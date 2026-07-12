import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function POST(req: Request) {
  try {
    const { firebaseId, email } = await req.json();

    if (!firebaseId || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const userRef = adminDb.collection('users').doc(firebaseId);
    await userRef.set({
      firebaseId,
      email,
      updatedAt: new Date().toISOString(),
    }, { merge: true });

    const userDoc = await userRef.get();
    const user = { id: userDoc.id, ...userDoc.data() };

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error syncing user:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
