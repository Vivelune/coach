// app/page.tsx


import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 bg-zinc-50 px-6 text-center dark:bg-black">
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
        Your data doesn&apos;t lie.
        <br />
        Neither will your coach.
      </h1>
      <p className="max-w-md text-zinc-600 dark:text-zinc-400">
        Log your food, weight, and lifts. Get blunt feedback based on what you
        actually did, not what you think you did.
      </p>
      <div className="flex gap-3">
        <Link href="/sign-up" className="rounded-md bg-black px-5 py-2.5 text-white dark:bg-white dark:text-black">
          Get started
        </Link>
        <Link href="/sign-in" className="rounded-md border px-5 py-2.5">
          Sign in
        </Link>
      </div>
    </main>
  );
}