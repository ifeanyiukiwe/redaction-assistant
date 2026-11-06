import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, afterEach } from "vitest";
import Page from "./page";

describe("Redaction Assistant page", () => {
  it("shows a labelled document box and a find button", () => {
    render(<Page />);

    expect(screen.getByLabelText("Document text")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Find personal data" }),
    ).toBeInTheDocument();
  });
  it("sends the text to the API and lists each suggestion for review", async () => {
    const fakeFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => fakeResponse,
    });
    vi.stubGlobal("fetch", fakeFetch);
    const user = userEvent.setup();

    render(<Page />);
    await user.type(screen.getByLabelText("Document text"), sampleText);
    await user.click(
      screen.getByRole("button", { name: "Find personal data" }),
    );

    expect(
      await screen.findByText("Found 2 possible items of personal data"),
    ).toBeInTheDocument();

    expect(fakeFetch).toHaveBeenCalledWith(
      expect.stringContaining("/suggestions"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ text: sampleText }),
      }),
    );

    expect(
      screen.getByRole("button", { name: "Accept phone 07700 900123" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Accept email jane@example.com" }),
    ).toBeInTheDocument();
  });
});

const sampleText = "Call Jane on 07700 900123 or email jane@example.com.";

const fakeResponse = {
  suggestions: [
    { type: "phone", text: "07700 900123", start: 13, end: 25 },
    { type: "email", text: "jane@example.com", start: 35, end: 51 },
  ],
};

afterEach(() => {
  vi.unstubAllGlobals();
});
