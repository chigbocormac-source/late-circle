'use client';

import { useRouter } from 'next/navigation';

export default function Privacy() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-[#FFF0F3] text-[#4A2C35] px-6 pt-12 pb-32 max-w-lg mx-auto">
      <button
        onClick={() => router.back()}
        className="text-[#4A2C35]/50 text-sm font-medium active:opacity-50 mb-6"
      >
        ← Back
      </button>

      <h1 className="text-2xl font-serif italic mb-2">Privacy Policy</h1>
      <p className="text-xs text-[#4A2C35]/50 mb-8">Last updated: November 2026</p>

      <div className="space-y-6 text-sm leading-relaxed">
        <section>
          <h2 className="font-bold mb-2">What we keep on your phone</h2>
          <p className="text-[#4A2C35]/80">
            Your cycle dates, check-ins, saved fears, and the notes you write to future you live on your phone. They do not leave your phone unless you choose to create an account.
          </p>
        </section>

        <section>
          <h2 className="font-bold mb-2">What we keep on our servers</h2>
          <p className="text-[#4A2C35]/80">
            If you use the app anonymously, we store a random ID and your daily check-ins (food, walk, sleep, calm) so the app can remember you across visits. We never store your name, email, or anything that could identify you unless you create an account.
          </p>
          <p className="text-[#4A2C35]/80 mt-2">
            If you create an account, we store your email and your history so you can log in from another phone.
          </p>
        </section>

        <section>
          <h2 className="font-bold mb-2">What we never do</h2>
          <ul className="list-disc pl-5 space-y-1 text-[#4A2C35]/80">
            <li>We never sell your data.</li>
            <li>We never share your chats with anyone unless you ask us to.</li>
            <li>We never show your period dates to anyone else.</li>
            <li>We never use your data for advertising.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-bold mb-2">Your rights</h2>
          <p className="text-[#4A2C35]/80">
            You can delete everything at any time from the Care tab. When you delete, we remove your data from your phone and from our servers. This cannot be undone.
          </p>
        </section>

        <section>
          <h2 className="font-bold mb-2">Who we are</h2>
          <p className="text-[#4A2C35]/80">
            Late Circle is a lifestyle tracker. It is not a medical diagnosis. If you have a medical concern, please speak to a doctor or nurse.
          </p>
        </section>

        <section>
          <h2 className="font-bold mb-2">Questions</h2>
          <p className="text-[#4A2C35]/80">
            If you have questions about your data, you can reach us through the Ovi chat.
          </p>
        </section>
      </div>
    </main>
  );
}