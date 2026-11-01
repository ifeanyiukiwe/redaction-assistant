"use client";
import { useState } from "react";

type Suggestion = {
  type: string;
  text: string;
  start: number;
  end: number;
};

type Decision = "accepted" | "rejected";

const focusRing =
  "focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-amber-400";
const card = "rounded-lg border border-slate-200 bg-white p-6 shadow-sm";

function markClass(decision?: Decision) {
  if (decision === "accepted") return "bg-black text-black";
  if (decision === "rejected") return "bg-transparent";
  return "bg-yellow-200";
}

function buildSegments(
  source: string,
  items: Suggestion[],
  decisions: Record<number, Decision>,
) {
  const parts: React.ReactNode[] = [];
  let cursor = 0;
  for (const s of items) {
    if (s.start < cursor) continue; // skip overlapping findings
    parts.push(source.slice(cursor, s.start));
    const decision = decisions[s.start];
    const original = source.slice(s.start, s.end);
    parts.push(
      <mark key={s.start} className={markClass(decision)}>
        {decision === "accepted" ? (
          <>
            <span aria-hidden="true">{"█".repeat(original.length)}</span>
            <span className="sr-only">[redacted {s.type}]</span>
          </>
        ) : (
          original
        )}
      </mark>,
    );
    cursor = s.end;
  }
  parts.push(source.slice(cursor));
  return parts;
}

function buildRedactedText(
  source: string,
  items: Suggestion[],
  decisions: Record<number, Decision>,
) {
  let result = "";
  let cursor = 0;
  for (const s of items) {
    if (s.start < cursor) continue;
    result += source.slice(cursor, s.start);
    const original = source.slice(s.start, s.end);
    result +=
      decisions[s.start] === "accepted"
        ? "█".repeat(original.length)
        : original;
    cursor = s.end;
  }
  result += source.slice(cursor);
  return result;
}

export default function AppPage() {
  const [text, setText] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(
    "idle",
  );
  const [checkedText, setCheckedText] = useState("");
  const [decisions, setDecisions] = useState<Record<number, Decision>>({});
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setDecisions({});
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/suggestions`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        },
      );
      if (!response.ok) throw new Error("Request failed");
      const data = await response.json();
      setSuggestions(data.suggestions);
      setCheckedText(text);
      setStatus("done");
    } catch {
      setSuggestions([]);
      setStatus("error");
    }
  }
  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(redacted);
      setCopyFailed(false);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopyFailed(true);
    }
  }

  function statusMessage() {
    if (status === "loading")
      return "Checking… The first check after a quiet spell can take up to a minute while the server wakes up.";
    if (status === "done")
      return `Found ${suggestions.length} possible items of personal data`;
    return "";
  }

  const allDecided = suggestions.every((s) => decisions[s.start] !== undefined);
  const decidedCount = Object.keys(decisions).length;
  const redacted = buildRedactedText(checkedText, suggestions, decisions);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="bg-slate-900 text-white">
        <div className="mx-auto max-w-6xl px-5 py-4 flex flex-wrap items-center justify-between gap-2">
          <p className="text-lg font-bold">Redaction Assistant</p>
          <p className="text-sm font-bold rounded bg-amber-300 text-slate-900 px-2 py-1">
            Prototype · made-up data only
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-10 flex flex-col gap-8">
        <div className="max-w-3xl">
          <h1 className="text-3xl font-bold">
            Find personal data before release
          </h1>
          <p className="mt-2 text-lg text-slate-700">
            Paste document text, review each suggestion, then copy a redacted
            version. Nothing is redacted until you accept it.
          </p>
        </div>

        <section className={card}>
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label htmlFor="document" className="font-bold">
                Document text
              </label>
              <textarea
                id="document"
                rows={6}
                value={text}
                onChange={(e) => setText(e.target.value)}
                className={`w-full border-2 border-slate-800 rounded px-3 py-2 ${focusRing}`}
              />
            </div>
            <button
              type="submit"
              className={`self-start min-h-12 px-6 rounded bg-emerald-900 text-white font-bold hover:bg-emerald-800 cursor-pointer ${focusRing}`}
            >
              Find personal data
            </button>
          </form>
        </section>

        <p role="status" className="font-bold">
          {statusMessage()}
        </p>
        {status === "error" && (
          <p
            role="alert"
            className="rounded border-l-4 border-red-700 bg-red-50 p-4 font-bold"
          >
            Couldn’t reach the redaction service. Please try again.
          </p>
        )}

        {status === "done" && (
          <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
            <section aria-labelledby="doc-h" className={card}>
              <h2 id="doc-h" className="text-xl font-bold mb-4">
                Document
              </h2>
              <p className="whitespace-pre-wrap leading-relaxed">
                {buildSegments(checkedText, suggestions, decisions)}
              </p>
            </section>

            <section aria-labelledby="review-h" className={card}>
              <h2 id="review-h" className="text-xl font-bold mb-4">
                Review ({decidedCount} of {suggestions.length})
              </h2>
              <ul className="flex flex-col gap-3">
                {suggestions.map((s) => (
                  <li
                    key={s.start}
                    className="rounded border border-slate-200 p-3 flex flex-col gap-3"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wide rounded bg-slate-100 px-2 py-0.5">
                        {s.type}
                      </span>
                      <span className="font-mono break-all">{s.text}</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        aria-pressed={decisions[s.start] === "accepted"}
                        aria-label={`Accept ${s.type} ${s.text}`}
                        onClick={() =>
                          setDecisions({ ...decisions, [s.start]: "accepted" })
                        }
                        className={`min-h-11 px-4 rounded border-2 border-slate-800 font-bold cursor-pointer aria-pressed:bg-slate-900 aria-pressed:text-white ${focusRing}`}
                      >
                        Accept
                      </button>
                      <button
                        type="button"
                        aria-pressed={decisions[s.start] === "rejected"}
                        aria-label={`Reject ${s.type} ${s.text}`}
                        onClick={() =>
                          setDecisions({ ...decisions, [s.start]: "rejected" })
                        }
                        className={`min-h-11 px-4 rounded border-2 border-slate-800 font-bold cursor-pointer aria-pressed:bg-slate-900 aria-pressed:text-white ${focusRing}`}
                      >
                        Reject
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        )}

        {status === "done" && (
          <section
            aria-labelledby="output-h"
            className={`${card} flex flex-col gap-3`}
          >
            <h2 id="output-h" className="text-xl font-bold">
              Redacted output
            </h2>
            {allDecided ? (
              <>
                <pre className="whitespace-pre-wrap rounded border-2 border-slate-800 bg-slate-50 p-4">
                  {redacted}
                </pre>
                <button
                  type="button"
                  onClick={handleCopy}
                  className={`self-start min-h-11 px-4 rounded border-2 border-slate-800 font-bold cursor-pointer ${focusRing}`}
                >
                  {copied ? "Copied" : "Copy redacted text"}
                </button>
                <span role="status" className="sr-only">
                  {copied ? "Redacted text copied to clipboard" : ""}
                </span>
                {copyFailed && (
                  <p role="alert" className="font-bold text-red-700">
                    Couldn’t copy. Select the text above and copy it manually.
                  </p>
                )}
              </>
            ) : (
              <p>
                Review all {suggestions.length} suggestions before releasing.
              </p>
            )}
          </section>
        )}
      </main>

      <footer className="border-t border-slate-200">
        <div className="mx-auto max-w-6xl px-5 py-6 text-sm text-slate-600">
          Prototype by Ojo Ifeanyi Ukiwe ·{" "}
          <a
            className="underline"
            href="https://github.com/ifeanyiukiwe/redaction-assistant"
          >
            Source on GitHub
          </a>
        </div>
      </footer>
    </div>
  );
}
