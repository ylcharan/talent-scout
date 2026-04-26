"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

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

export default function RecruiterPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [parsedJD, setParsedJD] = useState<ParsedJD | null>(null);
  const [rawPreview, setRawPreview] = useState("");
  const [chunks, setChunks] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [matchingLoading, setMatchingLoading] = useState(false);

  const matchCandidates = async () => {
    if (!parsedJD) return;

    try {
      setMatchingLoading(true);
      const res = await fetch("/api/match-candidates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(parsedJD),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to match candidates");
        return;
      }

      // Redirect to results page with JD data and candidates
      const queryParams = new URLSearchParams({
        jd: JSON.stringify(parsedJD),
        candidates: JSON.stringify(data.candidates || []),
      });

      router.push(`/match-results?${queryParams.toString()}`);
    } catch (error: any) {
      alert(error.message || "Error matching candidates");
    } finally {
      setMatchingLoading(false);
    }
  };

  const handleParse = async () => {
    if (!file) {
      alert("Please upload a PDF file");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    setParsedJD(null);
    setRawPreview("");
    setChunks(null);

    try {
      const res = await fetch("/api/jd-parser", {
        method: "POST",
        body: formData,
      });

      const text = await res.text();

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        console.error("Non JSON response:", text);
        throw new Error("API returned HTML instead of JSON. Check terminal.");
      }

      if (!res.ok) {
        throw new Error(data.details || data.error || "Failed to parse JD");
      }

      setParsedJD(data.parsed_jd);
      setRawPreview(data.raw_text_preview || "");
      setChunks(data.total_chunks || 0);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <button
          onClick={() => router.push("/")}
          className="mb-6 rounded-lg bg-gray-200 px-4 py-2 text-gray-800 hover:bg-gray-300 transition"
        >
          ← Back to Home
        </button>

        <div className="rounded-2xl bg-white p-8 shadow">
          <h1 className="text-3xl font-bold text-gray-900">Post a Job</h1>

          <p className="mt-2 text-gray-600">
            Upload a JD PDF. The system extracts text, chunks it, parses each
            chunk, and merges everything into recruiter-ready JSON.
          </p>

          <div className="mt-8 rounded-xl border-2 border-dashed border-gray-300 p-8 text-center">
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="mx-auto text-gray-600"
            />

            {file && (
              <p className="mt-4 text-sm text-gray-600">
                Selected: <span className="font-medium">{file.name}</span>
              </p>
            )}

            <button
              onClick={handleParse}
              disabled={loading}
              className="mt-6 rounded-xl bg-black px-6 py-3 text-white disabled:opacity-50"
            >
              {loading ? "Parsing JD..." : "Upload & Parse JD"}
            </button>
          </div>
        </div>

        {parsedJD && (
          <div className="mt-8 rounded-2xl bg-white p-8 shadow">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-2xl font-bold text-gray-900">
                Parsed Job Description
              </h2>

              {chunks !== null && (
                <span className="rounded-full bg-gray-100 px-4 py-2 text-sm text-gray-700">
                  {chunks} chunk{chunks === 1 ? "" : "s"} processed
                </span>
              )}
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <Info label="Job Title" value={parsedJD.job_title} />
              <Info label="Company" value={parsedJD.company} />
              <Info label="Location" value={parsedJD.location} />
              <Info label="Work Mode" value={parsedJD.work_mode} />
              <Info
                label="Minimum Experience"
                value={`${parsedJD.min_experience_years || 0} years`}
              />
              <Info label="Seniority" value={parsedJD.seniority_level} />
              <Info label="Domain" value={parsedJD.domain} />
              <Info label="Salary Range" value={parsedJD.salary_range} />
            </div>

            <Section title="Summary" items={[parsedJD.summary]} />
            <Section title="Required Skills" items={parsedJD.required_skills} />
            <Section title="Optional Skills" items={parsedJD.optional_skills} />
            <Section
              title="Responsibilities"
              items={parsedJD.responsibilities}
            />

            {rawPreview && (
              <div className="mt-8 rounded-xl bg-gray-100 p-4">
                <h3 className="font-semibold text-gray-900">
                  Raw PDF Text Preview
                </h3>
                <p className="mt-3 text-sm text-gray-700">{rawPreview}</p>
              </div>
            )}

            <div className="mt-8 rounded-xl bg-gray-100 p-4">
              <h3 className="font-semibold text-gray-900">Final JSON</h3>
              <pre className="mt-3 overflow-x-auto text-sm text-gray-700">
                {JSON.stringify(parsedJD, null, 2)}
              </pre>
            </div>

            <button
              onClick={matchCandidates}
              disabled={matchingLoading}
              className="mt-6 rounded-xl bg-black px-6 py-3 text-white font-semibold disabled:opacity-50 hover:bg-gray-900 transition"
            >
              {matchingLoading ? "Matching..." : "Match Candidates"}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

function Info({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border bg-gray-50 p-4">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-1 font-semibold text-gray-900">{value || "Unknown"}</p>
    </div>
  );
}

function Section({ title, items }: { title: string; items?: string[] }) {
  if (!items || items.length === 0) return null;

  return (
    <div className="mt-8">
      <h3 className="text-lg font-bold text-gray-900">{title}</h3>

      <div className="mt-3 flex flex-wrap gap-2">
        {items.map((item, index) => (
          <span
            key={index}
            className="rounded-full bg-gray-200 px-4 py-2 text-sm text-gray-800"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
