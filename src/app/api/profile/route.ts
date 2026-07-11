import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { adminAuth } from '@/lib/firebase-admin';

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    
    const user = await prisma.user.findUnique({
      where: { firebaseId: decodedToken.uid },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ resumeText: user.resumeText });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    
    const { resumeText } = await req.json();

    const user = await prisma.user.update({
      where: { firebaseId: decodedToken.uid },
      data: { resumeText },
    });

    return NextResponse.json({ success: true, resumeText: user.resumeText });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
