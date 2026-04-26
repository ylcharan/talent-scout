"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

type Candidate = {
  id: number;
  name: string;
  skills: string[];
  experience: number;
  location: string;
  salary_expectation: number;
  notice_period: number;
  preferences: string;
  matchScore: number;
  interestScore: number;
  finalScore: number;
  risk: string;
  action: string;
  explanation: string;
};

type ParsedJD = {
  job_title: string;
  company: string;
  location: string;
  work_mode: string;
  min_experience_years: number;
  required_skills: string[];
  optional_skills: string[];
  responsibilities: string[];
  education: string;
  salary_range: string;
  seniority_level: string;
  domain: string;
  summary: string;
};

export default function MatchResultsPage() {
  return (
    <Suspense fallback={<MatchResultsLoading />}>
      <MatchResultsContent />
    </Suspense>
  );
}

function MatchResultsLoading() {
  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-2xl bg-white p-8 shadow text-center">
          <p className="text-gray-600">Loading results...</p>
        </div>
      </div>
    </main>
  );
}

function MatchResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [parsedJD, setParsedJD] = useState<ParsedJD | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const jdParam = searchParams.get("jd");
      const candidatesParam = searchParams.get("candidates");

      if (jdParam) {
        setParsedJD(JSON.parse(jdParam));
      }

      if (candidatesParam) {
        setCandidates(JSON.parse(candidatesParam));
      }
    } catch (error) {
      console.error("Error parsing URL parameters:", error);
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  if (loading) {
    return <MatchResultsLoading />;
  }

  if (!parsedJD || candidates.length === 0) {
    return (
      <main className="min-h-screen bg-gray-50 px-6 py-10">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-2xl bg-white p-8 shadow">
            <button
              onClick={() => router.back()}
              className="mb-6 rounded-lg bg-gray-200 px-4 py-2 text-gray-800 hover:bg-gray-300 transition"
            >
              ← Back
            </button>
            <p className="text-gray-600">No results available.</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-6xl">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="mb-6 rounded-lg bg-gray-200 px-4 py-2 text-gray-800 hover:bg-gray-300 transition"
        >
          ← Back to JD Parser
        </button>

        {/* JD Summary Card */}
        <div className="mb-8 rounded-2xl bg-white p-8 shadow">
          <h1 className="text-3xl font-bold text-gray-900">Match Results</h1>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border bg-gray-50 p-4">
              <p className="text-sm text-gray-600">Job Title</p>
              <p className="mt-1 font-semibold text-gray-900">
                {parsedJD.job_title}
              </p>
            </div>
            <div className="rounded-lg border bg-gray-50 p-4">
              <p className="text-sm text-gray-600">Company</p>
              <p className="mt-1 font-semibold text-gray-900">
                {parsedJD.company}
              </p>
            </div>
            <div className="rounded-lg border bg-gray-50 p-4">
              <p className="text-sm text-gray-600">Location</p>
              <p className="mt-1 font-semibold text-gray-900">
                {parsedJD.location}
              </p>
            </div>
            <div className="rounded-lg border bg-gray-50 p-4">
              <p className="text-sm text-gray-600">Experience Required</p>
              <p className="mt-1 font-semibold text-gray-900">
                {parsedJD.min_experience_years} years
              </p>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="font-semibold text-gray-900">Required Skills</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {parsedJD.required_skills.map((skill, index) => (
                <span
                  key={index}
                  className="rounded-full border border-gray-300 bg-white px-3 py-1 text-sm text-gray-900"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Matched Candidates */}
        <div className="rounded-2xl bg-white p-8 shadow">
          <h2 className="text-2xl font-bold text-gray-900">
            Matched Candidates ({candidates.length})
          </h2>

          <p className="mt-2 text-gray-600">
            Sorted by final score (highest to lowest)
          </p>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b bg-gray-100">
                  <th className="p-4 font-semibold text-gray-900">Rank</th>
                  <th className="p-4 font-semibold text-gray-900">Candidate</th>
                  <th className="p-4 font-semibold text-gray-900">Skills</th>
                  <th className="p-4 font-semibold text-gray-900">
                    Experience
                  </th>
                  <th className="p-4 font-semibold text-gray-900">
                    Match Score
                  </th>
                  <th className="p-4 font-semibold text-gray-900">Interest</th>
                  <th className="p-4 font-semibold text-gray-900">
                    Final Score
                  </th>
                  <th className="p-4 font-semibold text-gray-900">Risk</th>
                  <th className="p-4 font-semibold text-gray-900">Action</th>
                </tr>
              </thead>
              <tbody>
                {candidates.map((candidate, index) => (
                  <tr key={candidate.id} className="border-b hover:bg-gray-50">
                    <td className="p-4 font-bold text-gray-900">{index + 1}</td>
                    <td className="p-4 font-semibold text-gray-900">
                      {candidate.name}
                    </td>
                    <td className="p-4 text-gray-700">
                      {candidate.skills.slice(0, 3).join(", ")}
                      {candidate.skills.length > 3 && "..."}
                    </td>
                    <td className="p-4 text-gray-700">
                      {candidate.experience} years
                    </td>
                    <td className="p-4">
                      <span className="rounded-full border border-gray-300 bg-white px-3 py-1 text-sm font-semibold text-gray-900">
                        {candidate.matchScore}%
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="rounded-full border border-gray-300 bg-white px-3 py-1 text-sm font-semibold text-gray-900">
                        {candidate.interestScore}%
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`rounded-full px-3 py-1 text-sm font-bold ${
                          candidate.finalScore >= 80
                            ? "bg-black text-white"
                            : candidate.finalScore >= 60
                              ? "bg-gray-200 text-gray-900"
                              : "bg-white text-gray-900 border border-gray-300"
                        }`}
                      >
                        {candidate.finalScore}%
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`rounded-full px-3 py-1 text-sm font-semibold ${
                          candidate.risk === "High"
                            ? "bg-black text-white"
                            : candidate.risk === "Medium"
                              ? "bg-gray-200 text-gray-900"
                              : "bg-white text-gray-900 border border-gray-300"
                        }`}
                      >
                        {candidate.risk}
                      </span>
                    </td>
                    <td className="p-4 font-semibold text-gray-900">
                      {candidate.action}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary Stats */}
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-gray-300 bg-white p-4">
              <p className="text-sm text-gray-600">Schedule Interview</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {candidates.filter((c) => c.finalScore > 80).length}
              </p>
            </div>
            <div className="rounded-lg border border-gray-300 bg-white p-4">
              <p className="text-sm text-gray-600">Keep Warm</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {
                  candidates.filter(
                    (c) => c.finalScore > 60 && c.finalScore <= 80,
                  ).length
                }
              </p>
            </div>
            <div className="rounded-lg border border-gray-300 bg-white p-4">
              <p className="text-sm text-gray-600">Reject</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {candidates.filter((c) => c.finalScore <= 60).length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
