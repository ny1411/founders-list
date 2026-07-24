import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { Founder, Company } from '@/lib/types';

const MAX_BATCH_SIZE = 100;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { founderIds } = body;

    if (!founderIds || !Array.isArray(founderIds) || founderIds.length === 0) {
      return NextResponse.json({ success: false, reason: "INVALID_PAYLOAD" }, { status: 400 });
    }

    if (founderIds.length > MAX_BATCH_SIZE) {
      return NextResponse.json({ success: false, reason: "INVALID_PAYLOAD" }, { status: 400 });
    }

    const SALESHANDY_API_KEY = process.env.SALESHANDY_API_KEY || "dummy_key";

    let baseUrl = process.env.SALESHANDY_BASE_URL || "https://dummy-api.saleshandy.com/v1";
    baseUrl = baseUrl.replace(/\/$/, ""); // remove trailing slash
    if (!baseUrl.endsWith('/v1')) {
      baseUrl = `${baseUrl}/v1`;
    }

    // Step 1: Check credits
    try {
      const creditsRes = await fetch(`${baseUrl}/credits`, {
        method: 'GET',
        headers: {
          'x-api-key': SALESHANDY_API_KEY,
          'Content-Type': 'application/json'
        }
      });

      if (!creditsRes.ok) {
        if (creditsRes.status === 401 || creditsRes.status === 403) {
          return NextResponse.json({ success: false, reason: "UNAUTHORIZED" }, { status: creditsRes.status });
        }
        const errorText = await creditsRes.text();
        console.error("Credits API failed:", creditsRes.status, errorText);
        return NextResponse.json({ success: false, reason: "CREDITS_CHECK_FAILED" }, { status: creditsRes.status });
      } else {
        const creditsData = await creditsRes.json();
        const creditsRemaining = creditsData.payload?.totalCredits;

        if (creditsRemaining !== undefined && creditsRemaining < founderIds.length) {
          return NextResponse.json({
            success: false,
            reason: "INSUFFICIENT_CREDITS",
            creditsRemaining
          }, { status: 400 });
        }
        console.log("Credits available!")
      }
    } catch (e) {
      console.error("Could not check credits:", e);
      return NextResponse.json({ success: false, reason: "CREDITS_CHECK_FAILED", error: String(e) }, { status: 500 });
    }

    // Step 2: Fetch founders and companies
    const foundersToEnrich = [];
    const companiesCache = new Map<string, Company>();

    for (const founderId of founderIds) {
      const founderDoc = await adminDb.collection('founders').doc(founderId).get();
      if (!founderDoc.exists) {
        return NextResponse.json({ success: false, reason: "NOT_FOUND" }, { status: 404 });
      }

      const founderData = { id: founderDoc.id, ...founderDoc.data() } as Founder;
      let companyData = companiesCache.get(founderData.companyId);

      if (!companyData) {
        const companyDoc = await adminDb.collection('companies').doc(founderData.companyId).get();
        if (companyDoc.exists) {
          companyData = { id: companyDoc.id, ...companyDoc.data() } as Company;
          companiesCache.set(founderData.companyId, companyData);
        }
      }

      foundersToEnrich.push({ founder: founderData, company: companyData });
    }

    // Step 3: Build payload
    const linkedin_url: string[] = [];
    const full_name_with_company: Record<string, string | undefined>[] = [];
    
    for (const { founder, company } of foundersToEnrich) {
      if (founder.linkedinUrl) {
        linkedin_url.push(founder.linkedinUrl);
      } else {
        let firstName = "";
        let lastName = "";
        if (founder.name) {
          const parts = founder.name.trim().split(' ');
          firstName = parts[0] || "";
          lastName = parts.slice(1).join(' ') || "";
        }

        let companyDomain = undefined;
        if (company?.website) {
          try {
            const url = new URL(company.website);
            companyDomain = url.hostname.replace(/^www\./, '');
          } catch {
            // ignore invalid url
          }
        }
        
        full_name_with_company.push({
          first_name: firstName || undefined,
          last_name: lastName || undefined,
          company_domain: companyDomain,
          company_website: company?.website || undefined
        });
      }
    }

    const payloadBody: Record<string, unknown> = {};
    if (linkedin_url.length > 0) payloadBody.linkedin_url = linkedin_url;
    if (full_name_with_company.length > 0) payloadBody.full_name_with_company = full_name_with_company;

    // Make the API call to start enrichment
    const enrichRes = await fetch(`${baseUrl}/enrich/contact`, {
      method: 'POST',
      headers: {
        'x-api-key': SALESHANDY_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payloadBody)
    });

    if (!enrichRes.ok) {
      const errorText = await enrichRes.text();
      return NextResponse.json({
        success: false,
        status: enrichRes.status,
        details: errorText
      }, { status: enrichRes.status });
    }

    const enrichData = await enrichRes.json();
    const requestId = enrichData.payload?.requestId;

    if (!requestId) {
      return NextResponse.json({ success: false, reason: "NO_REQUEST_ID", details: enrichData }, { status: 500 });
    }

    // Step 4: Poll for status
    let pollRetries = 15;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let finalResults: any[] | null = null;

    while (pollRetries > 0) {
      await new Promise(res => setTimeout(res, 2000)); // wait 2s
      const statusRes = await fetch(`${baseUrl}/enrich/status/result/${requestId}`, {
        method: 'GET',
        headers: {
          'x-api-key': SALESHANDY_API_KEY,
          'Content-Type': 'application/json'
        }
      });

      if (statusRes.ok) {
        const statusData = await statusRes.json();
        const payload = statusData.payload;
        if (payload?.status === "completed" || payload?.status === "completed-with-errors") {
          finalResults = payload.results || [];
          break;
        }
      }
      pollRetries--;
    }

    if (!finalResults) {
      return NextResponse.json({ success: false, reason: "POLLING_TIMEOUT" }, { status: 408 });
    }

    // Process response
    const results = [];
    const batch = adminDb.batch();

    const responses = finalResults;

    for (let i = 0; i < foundersToEnrich.length; i++) {
      const { founder, company } = foundersToEnrich[i];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const enrichmentData = responses.find((r: any) => {
        if (founder.linkedinUrl && r.linkedin_url) {
          return r.linkedin_url.includes(founder.linkedinUrl) || founder.linkedinUrl.includes(r.linkedin_url);
        }
        let firstName = "";
        let lastName = "";
        if (founder.name) {
          const parts = founder.name.trim().split(' ');
          firstName = parts[0] || "";
          lastName = parts.slice(1).join(' ') || "";
        }
        return r.first_name === firstName && r.last_name === lastName;
      }) || responses[i] || {};

      const updatedFounderData: Partial<Founder> = {};

      let validEmail = null;
      if (enrichmentData.emails && Array.isArray(enrichmentData.emails)) {
         const valid = enrichmentData.emails.find((e: Record<string, string>) => e.verificationStatus === 'valid');
         validEmail = valid ? valid.email : enrichmentData.emails[0]?.email;
      }
      
      const workEmail = validEmail || enrichmentData.email;
      const phone = enrichmentData.phone;
      const mobile = enrichmentData.mobile;
      const jobTitle = enrichmentData.job_title || enrichmentData.title;
      const linkedinUrl = enrichmentData.linkedin_url;
      const verificationStatus = enrichmentData.emails?.[0]?.verificationStatus;

      if (workEmail) {
        updatedFounderData.email = workEmail;
      }
      if (phone || mobile) {
        updatedFounderData.phone = phone || mobile;
      }
      if (verificationStatus) {
        (updatedFounderData as Founder & { verificationStatus?: string }).verificationStatus = verificationStatus;
      }
      if (!founder.linkedinUrl && linkedinUrl) {
        updatedFounderData.linkedinUrl = linkedinUrl;
      }
      if (jobTitle && !founder.role) {
        updatedFounderData.role = jobTitle;
      }

      if (Object.keys(updatedFounderData).length > 0) {
        updatedFounderData.updatedAt = new Date().toISOString();
        const founderRef = adminDb.collection('founders').doc(founder.id);
        batch.update(founderRef, updatedFounderData);
      }

      let companyDomain = undefined;
      if (company?.website) {
        try {
          const url = new URL(company.website);
          companyDomain = url.hostname.replace(/^www\./, '');
        } catch {
          // ignore
        }
      }

      results.push({
        founder: {
          existing: {
            name: founder.name,
            role: founder.role || null,
            linkedinUrl: founder.linkedinUrl || null,
            companyName: company?.name || null,
            companyWebsite: company?.website || null,
            companyDomain: companyDomain || null
          },
          enrichment: {
            workEmail: workEmail || null,
            phone: phone || null,
            mobile: mobile || null,
            verificationStatus: verificationStatus || null,
            jobTitle: jobTitle || null,
            linkedinUrl: linkedinUrl || null,
            raw: enrichmentData
          }
        }
      });
    }

    await batch.commit();

    // If a single founder was requested, return the single founder object as requested in the prompt example.
    const creditsRemaining = 999; // Mock if not provided in enrich endpoint

    if (results.length === 1) {
      return NextResponse.json({
        creditsRemaining,
        founder: results[0].founder
      });
    }

    return NextResponse.json({
      creditsRemaining,
      results
    });

  } catch (error) {
    console.error("Enrichment error:", error);
    return NextResponse.json({ success: false, reason: "INTERNAL_ERROR", error: String(error) }, { status: 500 });
  }
}
