import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY missing" },
        { status: 500 },
      );
    }

    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "PDF file is required" },
        { status: 400 },
      );
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Only PDF files are allowed" },
        { status: 400 },
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
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
              filename: file.name,
              file_data: `data:application/pdf;base64,${base64PDF}`,
            },
            {
              type: "input_text",
              text: `
Extract this job description PDF into JSON.

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

    const output = response.output_text || "{}";
    const cleaned = output
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    let parsedJD;

    try {
      parsedJD = JSON.parse(cleaned);
    } catch (error: any) {
      console.error("JD Parser Error:", error);

      return NextResponse.json(
        {
          error: "Failed to parse JD",
          details: error.message,
        },
        { status: 500 },
      );
    }

    // Save parsed JD to data/pdfs directory
    try {
      const pdfsDir = path.join(process.cwd(), "data", "pdfs");
      await mkdir(pdfsDir, { recursive: true });

      const filename = `${Date.now()}_${file.name.replace(".pdf", ".json")}`;
      const filePath = path.join(pdfsDir, filename);
      await writeFile(filePath, JSON.stringify(parsedJD, null, 2));

      console.log(`Job description saved to ${filePath}`);
    } catch (saveError: any) {
      console.error("Error saving job description:", saveError);
    }

    return NextResponse.json({
      success: true,
      filename: file.name,
      parsed_jd: parsedJD,
    });
  } catch (error: any) {
    console.error("JD Parser Error:", error);

    return NextResponse.json(
      {
        error: "Failed to parse JD",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
