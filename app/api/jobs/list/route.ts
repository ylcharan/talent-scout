import { NextResponse } from "next/server";
import OpenAI from "openai";
import { mkdir, readdir, readFile, writeFile } from "fs/promises";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ParsedJob = {
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

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function GET() {
  try {
    const pdfsDir = path.join(process.cwd(), "data", "pdfs");

    // Read all files from data/pdfs directory
    let files: string[] = [];
    try {
      files = await readdir(pdfsDir);
    } catch {
      // Directory might not exist yet
      return NextResponse.json({
        success: true,
        jobs: [],
      });
    }

    await mkdir(pdfsDir, { recursive: true });

    const jsonFiles = files.filter((file) => file.endsWith(".json"));
    const pdfFiles = files.filter((file) => file.endsWith(".pdf"));
    const jsonBasenames = new Set(
      jsonFiles.map((file) => path.basename(file, ".json")),
    );

    const jobsFromJson = await Promise.all(
      jsonFiles.map(async (file) => {
        try {
          const filePath = path.join(pdfsDir, file);
          const content = await readFile(filePath, "utf-8");
          const jobData = normalizeJob(JSON.parse(content));
          return {
            id: file.replace(".json", ""),
            filename: file,
            ...jobData,
          };
        } catch {
          return null;
        }
      }),
    );

    const pdfsNeedingExtraction = pdfFiles.filter(
      (file) => !jsonBasenames.has(path.basename(file, ".pdf")),
    );

    const jobsFromPdfs = await Promise.all(
      pdfsNeedingExtraction.map(async (file) => {
        try {
          const jobData = await extractJobFromPdf(path.join(pdfsDir, file), file);
          const id = path.basename(file, ".pdf");
          await writeFile(
            path.join(pdfsDir, `${id}.json`),
            JSON.stringify(jobData, null, 2),
          );

          return {
            id,
            filename: file,
            source_pdf: file,
            ...jobData,
          };
        } catch (error) {
          console.error(`Failed to extract job from ${file}:`, error);
          return null;
        }
      }),
    );

    return NextResponse.json({
      success: true,
      jobs: [...jobsFromJson, ...jobsFromPdfs].filter((job) => job !== null),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch jobs", details: error.message },
      { status: 500 },
    );
  }
}

async function extractJobFromPdf(filePath: string, filename: string) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY missing");
  }

  const buffer = await readFile(filePath);
  const base64PDF = buffer.toString("base64");

  const response = await openai.responses.create({
    model: "gpt-4.1-mini",
    text: {
      format: {
        type: "json_object",
      },
    },
    input: [
      {
        role: "user",
        content: [
          {
            type: "input_file",
            filename,
            file_data: `data:application/pdf;base64,${base64PDF}`,
          },
          {
            type: "input_text",
            text: `
Extract exactly one job role from this job description PDF.

Return ONLY valid JSON. No markdown. No explanation.

Use this exact structure:

{
  "job_title": "",
  "company": "",
  "location": "",
  "work_mode": "remote | hybrid | onsite | unknown",
  "min_experience_years": 0,
  "required_skills": [],
  "optional_skills": [],
  "responsibilities": [],
  "education": "",
  "salary_range": "",
  "seniority_level": "",
  "domain": "",
  "summary": ""
}
`,
          },
        ],
      },
    ],
  });

  const cleaned = (response.output_text || "{}")
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  return normalizeJob(JSON.parse(cleaned));
}

function normalizeJob(job: Partial<ParsedJob>): ParsedJob {
  return {
    job_title: job.job_title || "Untitled role",
    company: job.company || "Unknown company",
    location: job.location || "Unknown location",
    work_mode: job.work_mode || "unknown",
    min_experience_years: Number(job.min_experience_years || 0),
    required_skills: Array.isArray(job.required_skills)
      ? job.required_skills
      : [],
    optional_skills: Array.isArray(job.optional_skills)
      ? job.optional_skills
      : [],
    responsibilities: Array.isArray(job.responsibilities)
      ? job.responsibilities
      : [],
    education: job.education || "",
    salary_range: job.salary_range || "",
    seniority_level: job.seniority_level || "",
    domain: job.domain || "",
    summary: job.summary || "",
  };
}
