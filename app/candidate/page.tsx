"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/* ─── Types ──────────────────────────────────────────────────────────────── */

type Job = {
  id: string;
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

type Message = {
  id: string;
  role: "assistant" | "user";
  text: string;
};

type View = "list" | "detail";

/* ─── Global Styles ──────────────────────────────────────────────────────── */

const GLOBAL_STYLES = `
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0);    }
  }
  @keyframes fadeDown {
    from { opacity: 0; transform: translateY(-18px); }
    to   { opacity: 1; transform: translateY(0);     }
  }
  @keyframes fadeInRight {
    from { opacity: 0; transform: translateX(28px); }
    to   { opacity: 1; transform: translateX(0);    }
  }
  @keyframes fadeOut {
    from { opacity: 1; }
    to   { opacity: 0; }
  }
  @keyframes bounce {
    0%, 80%, 100% { transform: translateY(0);   }
    40%           { transform: translateY(-6px); }
  }
  .view-enter-up   { animation: fadeUp   0.35s cubic-bezier(0.22, 1, 0.36, 1) both; }
  .view-enter-down { animation: fadeDown 0.35s cubic-bezier(0.22, 1, 0.36, 1) both; }
  .chat-enter      { animation: fadeInRight 0.3s cubic-bezier(0.22, 1, 0.36, 1) both; }
`;

/* ─── Chat Panel ──────────────────────────────────────────────────────────── */

function ChatPanel({ job, onClose }: { job: Job; onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "0",
      role: "assistant",
      text: `You are applying for **${job.job_title}** at **${job.company}**.\n\nI am here to help you put your best foot forward. Could you start by telling me a little about yourself and your relevant experience?`,
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const sendMessage = () => {
    const text = input.trim();
    if (!text) return;

    const userMsg: Message = { id: Date.now().toString(), role: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTyping(true);

    setTimeout(() => {
      const replies = [
        `Thank you for sharing. For the **${job.job_title}** role, ${job.company} looks for strong skills in ${job.required_skills.slice(0, 2).join(" and ")}. Could you walk me through a specific project where you applied these?`,
        `Noted. The team values ${job.domain} expertise. What is your preferred work arrangement — are you comfortable with a ${job.work_mode} environment?`,
        `Understood. The salary range is **${job.salary_range || "competitive"}** and the role requires **${job.min_experience_years}+ years** of experience. Does that align with your expectations?`,
        `Thank you. I will pass your interest along to the hiring team at ${job.company}. Is there anything else you would like to highlight in your application?`,
        `Your application has been noted. We will be in touch within 3–5 business days.`,
      ];
      const reply = replies[Math.min(messages.length - 1, replies.length - 1)];
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString() + "_a", role: "assistant", text: reply },
      ]);
      setTyping(false);
    }, 1200);
  };

  return (
    <aside
      className="chat-enter"
      style={{
        width: 380,
        minWidth: 320,
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        background: "#fff",
        borderRadius: 16,
        boxShadow: "0 4px 32px rgba(0,0,0,0.10)",
        overflow: "hidden",
        border: "1px solid #e5e7eb",
        alignSelf: "flex-start",
        position: "sticky",
        top: 24,
        maxHeight: "calc(100vh - 48px)",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: "#111",
          color: "#fff",
          padding: "16px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <p style={{ fontWeight: 700, fontSize: 14, margin: 0 }}>
            Application Assistant
          </p>
          <p style={{ fontSize: 11, color: "#9ca3af", margin: 0 }}>
            Powered by TalentScout AI
          </p>
        </div>
        <button
          onClick={onClose}
          aria-label="Close chat"
          style={{
            background: "transparent",
            border: "none",
            color: "#9ca3af",
            fontSize: 18,
            cursor: "pointer",
            padding: "4px 6px",
            borderRadius: 6,
            lineHeight: 1,
            transition: "color 0.15s",
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.color = "#fff")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.color = "#9ca3af")
          }
        >
          ✕
        </button>
      </div>

      {/* Job pill */}
      <div
        style={{
          background: "#f9fafb",
          padding: "8px 16px",
          display: "flex",
          alignItems: "center",
          gap: 8,
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        <span style={{ fontSize: 12, color: "#6b7280" }}>Applying for</span>
        <span
          style={{
            background: "#111",
            color: "#fff",
            borderRadius: 20,
            padding: "2px 10px",
            fontSize: 11,
            fontWeight: 600,
          }}
        >
          {job.job_title}
        </span>
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "16px 14px 8px",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              display: "flex",
              justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
            }}
          >
            <div
              style={{
                maxWidth: "85%",
                background: msg.role === "user" ? "#111" : "#f3f4f6",
                color: msg.role === "user" ? "#fff" : "#111",
                borderRadius:
                  msg.role === "user"
                    ? "14px 14px 4px 14px"
                    : "14px 14px 14px 4px",
                padding: "9px 13px",
                fontSize: 13,
                lineHeight: 1.55,
              }}
              dangerouslySetInnerHTML={{
                __html: msg.text
                  .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
                  .replace(/\n/g, "<br/>"),
              }}
            />
          </div>
        ))}

        {typing && (
          <div style={{ display: "flex", justifyContent: "flex-start" }}>
            <div
              style={{
                background: "#f3f4f6",
                borderRadius: "14px 14px 14px 4px",
                padding: "10px 14px",
                display: "flex",
                gap: 4,
                alignItems: "center",
              }}
            >
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "#9ca3af",
                    display: "inline-block",
                    animation: `bounce 1s ${i * 0.15}s infinite`,
                  }}
                />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div
        style={{
          borderTop: "1px solid #e5e7eb",
          padding: "10px 12px",
          display: "flex",
          gap: 8,
          background: "#fff",
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
          placeholder="Type your message..."
          style={{
            flex: 1,
            border: "1.5px solid #e5e7eb",
            borderRadius: 8,
            padding: "8px 12px",
            fontSize: 13,
            outline: "none",
            transition: "border-color 0.15s",
          }}
          onFocus={(e) =>
            ((e.currentTarget as HTMLInputElement).style.borderColor = "#111")
          }
          onBlur={(e) =>
            ((e.currentTarget as HTMLInputElement).style.borderColor = "#e5e7eb")
          }
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim() || typing}
          style={{
            background: "#111",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "0 14px",
            fontSize: 16,
            cursor: !input.trim() || typing ? "not-allowed" : "pointer",
            opacity: !input.trim() || typing ? 0.35 : 1,
            transition: "opacity 0.15s, background 0.15s",
          }}
          onMouseEnter={(e) => {
            if (input.trim() && !typing)
              (e.currentTarget as HTMLButtonElement).style.background = "#333";
          }}
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.background = "#111")
          }
        >
          ↑
        </button>
      </div>
    </aside>
  );
}

/* ─── Animated View Wrapper ──────────────────────────────────────────────── */

function AnimatedView({
  viewKey,
  direction,
  children,
}: {
  viewKey: string;
  direction: "up" | "down";
  children: React.ReactNode;
}) {
  return (
    <div
      key={viewKey}
      className={direction === "up" ? "view-enter-up" : "view-enter-down"}
    >
      {children}
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────────────────────── */

export default function CandidatePage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>("list");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [chatJob, setChatJob] = useState<Job | null>(null);
  // direction: "up" = going deeper, "down" = going back
  const [direction, setDirection] = useState<"up" | "down">("up");

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await fetch("/api/jobs/list");
        const data = await res.json();
        if (data.success) setJobs(data.jobs);
      } catch (error) {
        console.error("Error fetching jobs:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const goToDetail = (job: Job, openChat = false) => {
    setDirection("up");
    setSelectedJob(job);
    setChatJob(openChat ? job : null);
    setView("detail");
  };

  const goToList = () => {
    setDirection("down");
    setChatJob(null);
    setView("list");
    // Clear selectedJob after the animation completes
    setTimeout(() => setSelectedJob(null), 380);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 px-6 py-10">
        <style>{GLOBAL_STYLES}</style>
        <div className="mx-auto max-w-6xl">
          <div className="rounded-2xl bg-white p-8 shadow text-center">
            <p className="text-gray-600">Loading jobs...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <style>{GLOBAL_STYLES}</style>

      {view === "list" && (
        <AnimatedView viewKey="list" direction={direction}>
          <div className="mx-auto max-w-6xl">
            <button
              onClick={() => router.push("/")}
              className="mb-6 rounded-lg bg-gray-200 px-4 py-2 text-gray-800 hover:bg-gray-300 transition"
            >
              ← Back to Home
            </button>

            <div className="mb-8 rounded-2xl bg-white p-8 shadow">
              <h1 className="text-3xl font-bold text-gray-900">Browse Jobs</h1>
              <p className="mt-2 text-gray-600">
                {jobs.length} open position{jobs.length !== 1 ? "s" : ""}{" "}
                available
              </p>
            </div>

            {jobs.length === 0 ? (
              <div className="rounded-2xl bg-white p-8 shadow text-center">
                <p className="text-gray-600">No jobs available at the moment.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {jobs.map((job) => (
                  <div
                    key={job.id}
                    onClick={() => goToDetail(job)}
                    className="cursor-pointer rounded-lg border border-gray-200 bg-white p-6 shadow transition hover:border-gray-900 hover:shadow-lg"
                  >
                    <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="text-xl font-bold text-gray-900">
                            {job.job_title}
                          </h3>
                          {job.seniority_level && (
                            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700">
                              {job.seniority_level}
                            </span>
                          )}
                        </div>

                        <p className="mt-1 text-gray-600">{job.company}</p>

                        <div className="mt-4 flex flex-wrap gap-2">
                          <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700">
                            {job.location}
                          </span>
                          <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700 capitalize">
                            {job.work_mode}
                          </span>
                          <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700">
                            {job.min_experience_years}+ yrs
                          </span>
                          {job.salary_range && (
                            <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700">
                              {job.salary_range}
                            </span>
                          )}
                        </div>

                        {job.summary && (
                          <p className="mt-4 line-clamp-2 text-sm leading-6 text-gray-700">
                            {job.summary}
                          </p>
                        )}

                        <div className="mt-4 flex flex-wrap gap-1">
                          {job.required_skills
                            .slice(0, 4)
                            .map((skill, index) => (
                              <span
                                key={index}
                                className="rounded-full border border-gray-300 bg-white px-2 py-1 text-xs text-gray-900"
                              >
                                {skill}
                              </span>
                            ))}
                          {job.required_skills.length > 4 && (
                            <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700">
                              +{job.required_skills.length - 4} more
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-3 md:self-stretch">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            goToDetail(job);
                          }}
                          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-900 transition hover:border-gray-900"
                        >
                          View
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            goToDetail(job, true);
                          }}
                          className="rounded-lg bg-black px-5 py-2 text-sm font-semibold text-white transition hover:bg-gray-900"
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </AnimatedView>
      )}

      {view === "detail" && selectedJob && (
        <AnimatedView viewKey={`detail-${selectedJob.id}`} direction={direction}>
          <div
            className="mx-auto"
            style={{ maxWidth: chatJob ? 1200 : 896, transition: "max-width 0.3s ease" }}
          >
            <button
              onClick={goToList}
              className="mb-6 rounded-lg bg-gray-200 px-4 py-2 text-gray-800 hover:bg-gray-300 transition"
            >
              ← Back to Jobs
            </button>

            <div
              style={{
                display: "flex",
                gap: 20,
                alignItems: "flex-start",
              }}
            >
              {/* Job Detail */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="rounded-2xl bg-white p-8 shadow">
                  <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0">
                      <h1 className="text-4xl font-bold text-gray-900">
                        {selectedJob.job_title}
                      </h1>
                      <p className="mt-2 text-xl text-gray-600">
                        {selectedJob.company}
                      </p>
                    </div>

                    <button
                      onClick={() =>
                        chatJob ? setChatJob(null) : setChatJob(selectedJob)
                      }
                      className="shrink-0 rounded-lg px-6 py-3 text-center text-sm font-bold text-white transition"
                      style={{ background: chatJob ? "#374151" : "#111" }}
                    >
                      {chatJob ? "Close Chat" : "Apply Now"}
                    </button>
                  </div>

                  <div className="mt-6 grid gap-4 md:grid-cols-2">
                    <InfoBox label="Location" value={selectedJob.location} />
                    <InfoBox label="Work Mode" value={selectedJob.work_mode} />
                    <InfoBox
                      label="Experience Required"
                      value={`${selectedJob.min_experience_years}+ years`}
                    />
                    <InfoBox
                      label="Seniority Level"
                      value={selectedJob.seniority_level}
                    />
                    <InfoBox
                      label="Salary Range"
                      value={selectedJob.salary_range || "Not specified"}
                    />
                    <InfoBox label="Domain" value={selectedJob.domain} />
                  </div>

                  <div className="mt-8 rounded-lg border-l-4 border-black bg-white p-6">
                    <h2 className="text-lg font-bold text-gray-900">Summary</h2>
                    <p className="mt-3 text-gray-700 leading-relaxed">
                      {selectedJob.summary}
                    </p>
                  </div>

                  <div className="mt-8">
                    <h2 className="text-lg font-bold text-gray-900">
                      Required Skills
                    </h2>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {selectedJob.required_skills.map((skill, index) => (
                        <span
                          key={index}
                          className="rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-900"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {selectedJob.optional_skills.length > 0 && (
                    <div className="mt-8">
                      <h2 className="text-lg font-bold text-gray-900">
                        Optional Skills
                      </h2>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {selectedJob.optional_skills.map((skill, index) => (
                          <span
                            key={index}
                            className="rounded-full bg-gray-200 px-4 py-2 text-sm text-gray-700"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedJob.responsibilities.length > 0 && (
                    <div className="mt-8">
                      <h2 className="text-lg font-bold text-gray-900">
                        Responsibilities
                      </h2>
                      <ul className="mt-3 space-y-2">
                        {selectedJob.responsibilities.map((resp, index) => (
                          <li
                            key={index}
                            className="flex gap-3 text-gray-700"
                          >
                            <span className="text-black">•</span>
                            <span>{resp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedJob.education && (
                    <div className="mt-8">
                      <h2 className="text-lg font-bold text-gray-900">
                        Education Required
                      </h2>
                      <p className="mt-3 text-gray-700">
                        {selectedJob.education}
                      </p>
                    </div>
                  )}

                  <div className="mt-8 flex justify-end">
                    <button
                      onClick={() =>
                        chatJob ? setChatJob(null) : setChatJob(selectedJob)
                      }
                      className="rounded-lg px-6 py-3 text-center text-sm font-bold text-white transition"
                      style={{ background: chatJob ? "#374151" : "#111" }}
                    >
                      {chatJob ? "Close Chat" : "Apply Now"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Chat Panel (right) */}
              {chatJob && (
                <ChatPanel
                  job={chatJob}
                  onClose={() => setChatJob(null)}
                />
              )}
            </div>
          </div>
        </AnimatedView>
      )}
    </main>
  );
}

/* ─── Helper ─────────────────────────────────────────────────────────────── */

function InfoBox({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border bg-gray-50 p-4">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-1 font-semibold text-gray-900 capitalize">
        {value || "Unknown"}
      </p>
    </div>
  );
}
