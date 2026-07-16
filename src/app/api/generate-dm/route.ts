import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { GoogleGenAI } from '@google/genai';
import { Company, Founder, User } from '@/lib/types';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    
    const { founderId, companySlug } = await req.json();

    const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get();

    if (!userDoc.exists || !userDoc.data()?.resumeText) {
      return NextResponse.json({ error: 'User resume not found' }, { status: 404 });
    }

    const user = { id: userDoc.id, ...userDoc.data() } as User;

    const companySnapshot = await adminDb.collection('companies').where('slug', '==', companySlug).limit(1).get();
    if (companySnapshot.empty) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }
    const company = companySnapshot.docs[0].data() as Company;

    const founderDoc = await adminDb.collection('founders').doc(founderId).get();
    if (!founderDoc.exists) {
      return NextResponse.json({ error: 'Founder not found' }, { status: 404 });
    }
    const founder = { id: founderDoc.id, ...founderDoc.data() } as Founder;

    // Check for existing DM
    const dmSnapshot = await adminDb.collection('generatedMessages')
      .where('userId', '==', user.id)
      .where('founderId', '==', founder.id)
      .limit(1)
      .get();

    if (!dmSnapshot.empty) {
      return NextResponse.json({ dmText: dmSnapshot.docs[0].data().content });
    }

    const prompt = `
You are writing a cold DM that feels like it was written by a real engineer applying to an early-stage startup.

Your goal is NOT to impress with buzzwords.
Your goal is to make the founder think:

"I should reply to this person."

Use the resume to extract:
- strongest technologies
- startup experience
- products shipped
- measurable impact
- notable internships/work
- AI/full-stack expertise
- projects relevant to this company

Company

Name:
${company.name}

Description:
${company.description || company.oneLiner}

Industry:
${company.industry}

Founder

Name:
${founder.name}

Role:
${founder.role}

Bio:
${founder.bio}

Candidate Resume

${user.resumeText}

-------------------------

Rules

• Maximum 140 words.
• Write naturally.
• No emojis.
• No bullet points.
• No numbered lists.
• No marketing language.
• No clichés like:
  - innovative company
  - excited to apply
  - leverage my skills
  - passion for technology
• Never copy the resume.
• Never summarize everything.
• Mention only the experience most relevant to THIS startup.
• Mention 1-2 technologies naturally.
• Mention 1-2 achievements with outcomes.
• Show genuine understanding of what the company is building.
• Explain WHY the company genuinely interests the candidate.
• End with one simple call-to-action.

Structure

Hi {Founder},

Open with one sentence showing genuine interest in what they're building.

Then connect the candidate's experience to that product. Mention only the most relevant startup/project/work experience. Focus on impact rather than responsibilities.

If applicable, mention products shipped, real users, production systems, AI, infrastructure, frontend, backend, etc., but only if relevant.

Close with:

"If you're hiring for a {best matching role}, I'd love to chat and see how I can contribute."

Sign with the candidate's name.

Tone

Write like an engineer talking to another engineer.

Not a recruiter.
Not ChatGPT.
Not a cover letter.

The DM should feel handcrafted for this founder.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
    });
    
    const dmText = response.text;

    if (dmText) {
      try {
        await adminDb.collection('generatedMessages').add({
          userId: user.id,
          founderId: founder.id,
          content: dmText,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      } catch (dbError) {
         console.error('Error saving generated message', dbError);
      }
    }

    return NextResponse.json({ dmText });
  } catch (error) {
    console.error('Error generating DM:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Error generating DM' }, { status: 500 });
  }
}
