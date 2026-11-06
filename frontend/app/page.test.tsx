import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, afterEach } from "vitest";
import Page from "./page";

const block = "\u2588";

// Shared setup used by the tests below
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

describe("Redaction Assistant page", () => {
  // Test 1: the page shows its main controls
  it("shows a labelled document box and a find button", () => {
    render(<Page />);

    expect(screen.getByLabelText("Document text")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Find personal data" }),
    ).toBeInTheDocument();
  });

  // Test 2: submitting sends the text and lists the suggestions
  it("sends the text to the API and lists each suggestion for review", async () => {
    // ARRANGE
    const fakeFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => fakeResponse,
    });
    vi.stubGlobal("fetch", fakeFetch);
    const user = userEvent.setup();
    render(<Page />);

    // ACT
    await user.type(screen.getByLabelText("Document text"), sampleText);
    await user.click(
      screen.getByRole("button", { name: "Find personal data" }),
    );

    // ASSERT
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

  // Test 3: accepting everything produces the redacted output
  it("shows the redacted output once every item is accepted", async () => {
    // ARRANGE
    const fakeFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => fakeResponse,
    });
    vi.stubGlobal("fetch", fakeFetch);
    const user = userEvent.setup();
    render(<Page />);

    // ACT
    await user.type(screen.getByLabelText("Document text"), sampleText);
    await user.click(
      screen.getByRole("button", { name: "Find personal data" }),
    );
    await user.click(
      await screen.findByRole("button", { name: "Accept phone 07700 900123" }),
    );
    await user.click(
      screen.getByRole("button", { name: "Accept email jane@example.com" }),
    );

    // ASSERT
    expect(
      screen.getByText(
        `Call Jane on ${block.repeat(12)} or email ${block.repeat(16)}.`,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Copy redacted text" }),
    ).toBeInTheDocument();
  });
});
