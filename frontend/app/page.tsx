"use client";
import { useState } from "react";
type Suggestion = {
  type: string;
  text: string;
  start: number;
  end: number;
};

function buildSegments(
  source: string,
  items: Suggestion[],
  decisions: Record<number, "accepted" | "rejected">,
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

function markClass(decision?: "accepted" | "rejected") {
  if (decision === "accepted") {
    return "bg-black text-black";
  }
  if (decision === "rejected") {
    return "bg-transparent";
  }
  return "bg-yellow-200";
}

export default function AppPage() {
  const [text, setText] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(
    "idle",
  );
  const [checkedText, setCheckedText] = useState("");
  const [decisions, setDecisions] = useState<
    Record<number, "accepted" | "rejected">
  >({});

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

  function statusMessage() {
    if (status === "loading") return "Checking…";
    if (status === "done")
      return `Found ${suggestions.length} possible items of personal data`;
    return "";
  }

  return (
    <>
      <form
        action=""
        onSubmit={handleSubmit}
        className="max-w-xl flex flex-col gap-6"
      >
        <div className="flex flex-col gap-2">
          <label htmlFor="document" className="font-bold">
            Document text
          </label>
          <textarea
            name="document"
            id="document"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="border-2 border-gray-800 rounded px-3 py-2"
          ></textarea>
        </div>
        <button
          type="submit"
          className="inline-flex self-start items-center cursor-pointer min-h-12 px-6 rounded bg-emerald-900 text-white font-bold no-underline border-gray-800 hover:bg-emerald-800"
        >
          Find personal data
        </button>
      </form>
      <p role="status">{statusMessage()}</p>
      {status === "error" && (
        <p role="alert">
          Couldn’t reach the redaction service. Please try again.
        </p>
      )}
      {status === "done" && (
        <p className="whitespace-pre-wrap">
          {buildSegments(checkedText, suggestions, decisions)}
        </p>
      )}
      <ul>
        {suggestions.map((s) => (
          <li key={s.start}>
            <p>{s.type}</p>
            <p>{s.text}</p>
            <button
              type="button"
              aria-pressed={decisions[s.start] === "accepted"}
              aria-label={`Accept ${s.type} ${s.text}`}
              onClick={() =>
                setDecisions({ ...decisions, [s.start]: "accepted" })
              }
              className="min-h-11 px-4 rounded border-2 border-gray-800 font-bold aria-pressed:bg-gray-900 aria-pressed:text-white"
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
              className="min-h-11 px-4 rounded border-2 border-gray-800 font-bold aria-pressed:bg-gray-900 aria-pressed:text-white"
            >
              Reject
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}
