import { NextRequest, NextResponse } from "next/server";
import { candidates } from "@/data/candidates";

export const runtime = "nodejs";

function overlap(a: string[], b: string[]) {
  return a.filter((x) => b.includes(x)).length;
}

function calculateMatchScore(candidate: any, jd: any) {
  const skillMatch =
    overlap(candidate.skills, jd.required_skills || []) /
    (jd.required_skills?.length || 1);

  const experienceScore =
    candidate.experience >= (jd.min_experience_years || 0) ? 1 : 0.5;

  const locationScore =
    jd.work_mode === "remote" || candidate.location === jd.work_mode ? 1 : 0.5;

  return Math.round(
    (skillMatch * 0.6 + experienceScore * 0.3 + locationScore * 0.1) * 100,
  );
}

function calculateInterestScore(candidate: any, jd: any) {
  let score = 50;

  if (candidate.notice_period <= 30) score += 20;
  if (candidate.salary_expectation <= 120000) score += 15;
  if (candidate.preferences.toLowerCase().includes(jd.work_mode)) score += 15;

  return Math.min(score, 100);
}

function getRisk(candidate: any) {
  if (candidate.notice_period > 60) return "High";
  if (candidate.salary_expectation > 130000) return "Medium";
  return "Low";
}

function getAction(score: number) {
  if (score > 80) return "Schedule Interview";
  if (score > 60) return "Keep Warm";
  return "Reject";
}

export async function POST(req: NextRequest) {
  try {
    const jd = await req.json();

    const results = candidates.map((candidate) => {
      const matchScore = calculateMatchScore(candidate, jd);
      const interestScore = calculateInterestScore(candidate, jd);
      const finalScore = Math.round(matchScore * 0.6 + interestScore * 0.4);

      return {
        ...candidate,
        matchScore,
        interestScore,
        finalScore,
        risk: getRisk(candidate),
        action: getAction(finalScore),
        explanation: `Matches ${candidate.skills.join(", ")}`,
      };
    });

    const sorted = results.sort((a, b) => b.finalScore - a.finalScore);

    return NextResponse.json({
      success: true,
      candidates: sorted,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Matching failed", details: error.message },
      { status: 500 },
    );
  }
}
