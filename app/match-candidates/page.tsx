"use client";

import { useState } from "react";

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

export default function MatchCandidatesPage() {
  const [jdJson, setJdJson] = useState("");
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(false);

  const handleMatchCandidates = async () => {
    try {
      setLoading(true);
      setCandidates([]);

      const parsedJD = JSON.parse(jdJson);

      const res = await fetch("/api/match-candidates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(parsedJD),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.details || data.error || "Matching failed");
      }

      setCandidates(data.candidates);
    } catch (error: any) {
      alert(error.message || "Invalid JD JSON");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-2xl bg-white p-8 shadow">
          <h1 className="text-3xl font-bold text-gray-900">Match Candidates</h1>

          <p className="mt-2 text-gray-600">
            Paste parsed JD JSON from your JD parser and rank candidates.
          </p>

          <textarea
            value={jdJson}
            onChange={(e) => setJdJson(e.target.value)}
            placeholder="Paste parsed JD JSON here..."
            className="mt-6 h-72 w-full rounded-xl border p-4 font-mono text-sm"
          />

          <button
            onClick={handleMatchCandidates}
            disabled={loading}
            className="mt-6 rounded-xl bg-black px-6 py-3 text-white disabled:opacity-50"
          >
            {loading ? "Matching..." : "Find Matching Candidates"}
          </button>
        </div>

        {candidates.length > 0 && (
          <div className="mt-8 rounded-2xl bg-white p-8 shadow">
            <h2 className="text-2xl font-bold text-gray-900">
              Ranked Shortlist
            </h2>

            <div className="mt-6 overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b bg-gray-100">
                    <th className="p-4">Rank</th>
                    <th className="p-4">Candidate</th>
                    <th className="p-4">Match</th>
                    <th className="p-4">Interest</th>
                    <th className="p-4">Final</th>
                    <th className="p-4">Risk</th>
                    <th className="p-4">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {candidates.map((candidate, index) => (
                    <tr key={candidate.id} className="border-b">
                      <td className="p-4 font-bold">#{index + 1}</td>

                      <td className="p-4">
                        <p className="font-semibold">{candidate.name}</p>
                        <p className="text-sm text-gray-500">
                          {candidate.experience} yrs • {candidate.location}
                        </p>
                      </td>

                      <td className="p-4 font-semibold">
                        {candidate.matchScore}%
                      </td>

                      <td className="p-4 font-semibold">
                        {candidate.interestScore}%
                      </td>

                      <td className="p-4 text-lg font-bold">
                        {candidate.finalScore}%
                      </td>

                      <td className="p-4">
                        <span className="rounded-full bg-gray-200 px-3 py-1 text-sm">
                          {candidate.risk}
                        </span>
                      </td>

                      <td className="p-4 font-medium">{candidate.action}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-8 grid gap-4">
              {candidates.map((candidate) => (
                <div
                  key={candidate.id}
                  className="rounded-xl border bg-gray-50 p-5"
                >
                  <h3 className="text-lg font-bold">{candidate.name}</h3>

                  <p className="mt-2 text-sm text-gray-600">
                    {candidate.explanation}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {candidate.skills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full bg-white px-3 py-1 text-sm border"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-3">
                    <Info
                      label="Salary Expectation"
                      value={`$${candidate.salary_expectation}`}
                    />
                    <Info
                      label="Notice Period"
                      value={`${candidate.notice_period} days`}
                    />
                    <Info label="Preference" value={candidate.preferences} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function Info({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg bg-white p-3 border">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-1 font-semibold text-gray-900">{value}</p>
    </div>
  );
}
