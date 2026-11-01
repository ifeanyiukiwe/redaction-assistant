"use client";
import { useState } from "react";
type Suggestion = {
  type: string;
  text: string;
  start: number;
  end: number;
};

export default function AppPage() {
  const [text, setText] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(
    "idle",
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setStatus("loading");
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
      setStatus("done");
    } catch {
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
            className="border-2 border-ink rounded px-3 py-2"
          ></textarea>
        </div>
        <button
          type="submit"
          className="inline-flex self-start items-center cursor-pointer min-h-12 px-6 rounded bg-emerald-900 text-white font-bold no-underline border-gray-800 and hover:bg-emerald-800"
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
      <ul>
        {suggestions.map((s) => (
          <li key={s.start}>
            <p>{s.type}</p>
            <p>{s.text}</p>
          </li>
        ))}
      </ul>
    </>
  );
}
