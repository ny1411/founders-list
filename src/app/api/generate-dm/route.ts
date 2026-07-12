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
You are an expert sales and networking assistant. 
Your task is to write a highly personalized, compelling, and concise cold DM (under 150 words) to a startup founder on LinkedIn or Twitter.

Context about the sender (from their resume):
${user.resumeText}

Context about the company:
Name: ${company.name}
Description: ${company.description || company.oneLiner || 'A startup'}
Industry: ${company.industry || 'Tech'}

Context about the recipient (the founder):
Name: ${founder.name}
Role: ${founder.role || 'Founder'}
Bio: ${founder.bio || 'Founder'}

Write a cold DM that the sender can send to the founder. 
Format of Cold DM must be similar to:

Hi ${founder.name},

This is a cold DM actually :)

I work around {mention technologies from resume} usually, and also have built Full-stack products. I have shipped {number of products} products from idea to deployment:

1. {Product Name 1} ({1 line short description})
2. {Product Name 2} ({1 line short description})
3. {Product Name 3} ({1 line short description})

I also worked at {company name from resume} where I helped build an {product}. Both products were shipped and used by real users. 

If you have a {user's target role based on their resume} open, I would like to contribute.

{User's social links from user profile}

Thanks,
{User's Name}

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
