import { NextResponse } from 'next/server';
import * as webpush from 'web-push';

export async function POST(req: Request) {
  try {
    // Set VAPID details at request time so we don't crash at build time
    // if env vars are missing in a build context
    webpush.setVapidDetails(
      process.env.VAPID_SUBJECT || 'mailto:hello@late-circle.vercel.app',
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '',
      process.env.VAPID_PRIVATE_KEY || ''
    );

    const { subscription, title, body, url } = await req.json();

    if (!subscription) {
      return NextResponse.json({ error: 'No subscription provided' }, { status: 400 });
    }

    await webpush.sendNotification(
      subscription,
      JSON.stringify({ title, body, url })
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending push:', error);
    return NextResponse.json({ error: 'Failed to send push' }, { status: 500 });
  }
}