import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Page from "./page";

describe("Redaction Assistant page", () => {
  it("shows a labelled document box and a find button", () => {
    render(<Page />);

    expect(screen.getByLabelText("Document text")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Find personal data" }),
    ).toBeInTheDocument();
  });
});
