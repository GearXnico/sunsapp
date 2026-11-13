import { describe, expect, it } from "vitest";
import { contentSecurityPolicy } from "./csp";

describe("contentSecurityPolicy", () => {
  it("only lets the page load its own scripts, styles and images", () => {
    const policy = contentSecurityPolicy("https://api.example.com");

    expect(policy).toContain("default-src 'self'");
    expect(policy).toContain("script-src 'self'");
    expect(policy).toContain("style-src 'self'");
    expect(policy).toContain("object-src 'none'");
  });

  it("only lets the page call the API's origin", () => {
    expect(contentSecurityPolicy("https://api.example.com/some/path")).toContain(
      "connect-src https://api.example.com;",
    );
  });
});
