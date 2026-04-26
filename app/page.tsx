"use client";

import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-white px-6 py-10">
      <div className="mx-auto max-w-4xl">
        <div className="mb-16 text-center">
          <h1 className="text-5xl font-bold text-gray-900">TalentScout AI</h1>
          <p className="mt-4 text-xl text-gray-600">
            Connect talent with opportunity
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Recruiter Card */}
          <Link href="/recruiter">
            <div className="cursor-pointer rounded-2xl bg-white p-8 shadow-lg transition hover:shadow-xl hover:scale-105">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-gray-900 bg-white">
                <span className="text-2xl font-bold text-gray-900">R</span>
              </div>

              <h2 className="text-2xl font-bold text-gray-900">Recruiter</h2>

              <p className="mt-4 text-gray-600">
                Upload job descriptions, parse them with AI, and find the best
                matching candidates instantly.
              </p>

              <ul className="mt-6 space-y-2 text-sm text-gray-700">
                <li className="flex items-center gap-2">
                  <span className="text-black">✓</span> Upload Job PDFs
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-black">✓</span> AI-Powered Parsing
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-black">✓</span> Instant Matching
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-black">✓</span> Ranked Candidates
                </li>
              </ul>

              <div className="mt-8 rounded-lg bg-black px-6 py-3 text-center text-white font-semibold">
                Post a Job
              </div>
            </div>
          </Link>

          {/* Candidate Card */}
          <Link href="/candidate">
            <div className="cursor-pointer rounded-2xl bg-white p-8 shadow-lg transition hover:shadow-xl hover:scale-105">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-gray-900 bg-white">
                <span className="text-2xl font-bold text-gray-900">C</span>
              </div>

              <h2 className="text-2xl font-bold text-gray-900">Candidate</h2>

              <p className="mt-4 text-gray-600">
                Browse open job positions, view job details extracted from PDFs,
                and apply to roles that match your profile.
              </p>

              <ul className="mt-6 space-y-2 text-sm text-gray-700">
                <li className="flex items-center gap-2">
                  <span className="text-black">✓</span> Browse Open Jobs
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-black">✓</span> Detailed Job Info
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-black">✓</span> Quick Apply
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-black">✓</span> Track Applications
                </li>
              </ul>

              <div className="mt-8 rounded-lg bg-black px-6 py-3 text-center text-white font-semibold">
                Browse Jobs
              </div>
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}
