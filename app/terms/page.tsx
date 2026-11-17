'use client';

import { useRouter } from 'next/navigation';

export default function Terms() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-[#FFF0F3] text-[#4A2C35] px-6 pt-12 pb-32 max-w-lg mx-auto">
      <button
        onClick={() => router.back()}
        className="text-[#4A2C35]/50 text-sm font-medium active:opacity-50 mb-6"
      >
        ← Back
      </button>

      <h1 className="text-2xl font-serif italic mb-2">Terms of Service</h1>
      <p className="text-xs text-[#4A2C35]/50 mb-8">Last updated: November 2026</p>

      <div className="space-y-6 text-sm leading-relaxed">
        <section>
          <h2 className="font-bold mb-2">What Late Circle is</h2>
          <p className="text-[#4A2C35]/80">
            Late Circle is a lifestyle tracker for girls and women with late or irregular periods. It helps you track your cycle, understand what might be happening in your body, and know when to relax or when to see a doctor.
          </p>
        </section>

        <section>
          <h2 className="font-bold mb-2">What Late Circle is not</h2>
          <p className="text-[#4A2C35]/80">
            Late Circle is not a medical device, and it does not diagnose, treat, or cure any condition. The messages from Ovi are educational and supportive. They are not medical advice. If you have a medical concern, please speak to a doctor or nurse.
          </p>
        </section>

        <section>
          <h2 className="font-bold mb-2">Your account</h2>
          <p className="text-[#4A2C35]/80">
            You can use Late Circle without an account. If you create one, you are responsible for keeping your password safe. You can delete your account and data at any time from the Care tab.
          </p>
        </section>

        <section>
          <h2 className="font-bold mb-2">Age</h2>
          <p className="text-[#4A2C35]/80">
            You must be 18 or older, or have a parent or guardian with you, to create an account.
          </p>
        </section>

        <section>
          <h2 className="font-bold mb-2">Emergency</h2>
          <p className="text-[#4A2C35]/80">
            If you have severe pain, heavy bleeding, fever, fainting, or a positive pregnancy test and you are worried, please go to a hospital or speak to a doctor or nurse quickly. Do not wait for the app to tell you what to do.
          </p>
        </section>

        <section>
          <h2 className="font-bold mb-2">Changes</h2>
          <p className="text-[#4A2C35]/80">
            We may update these terms as the app grows. If we make an important change, we will tell you inside the app.
          </p>
        </section>
      </div>
    </main>
  );
}