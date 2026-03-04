import { describe, it, expect } from "vitest";

/**
 * Validates that MARKET_PULSE_GITHUB_TOKEN is set and can authenticate
 * against the Apgomes3/market-pulse repository.
 */
describe("MARKET_PULSE_GITHUB_TOKEN", () => {
  it("is set in environment", () => {
    const token =
      process.env.MARKET_PULSE_GITHUB_TOKEN ||
      process.env.GITHUB_TOKEN ||
      process.env.GH_TOKEN;
    expect(token, "GitHub token must be set").toBeTruthy();
    expect(token!.length, "Token must be at least 20 chars").toBeGreaterThan(20);
  });

  it("can authenticate against GitHub API and access the market-pulse repo", async () => {
    const token =
      process.env.MARKET_PULSE_GITHUB_TOKEN ||
      process.env.GITHUB_TOKEN ||
      process.env.GH_TOKEN;

    if (!token) {
      throw new Error("No GitHub token available");
    }

    const res = await fetch(
      "https://api.github.com/repos/Apgomes3/market-pulse",
      {
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github.v3+json",
        },
      }
    );

    expect(res.status, `GitHub API returned ${res.status}`).toBe(200);

    const data = await res.json() as { full_name: string; private: boolean };
    expect(data.full_name).toBe("Apgomes3/market-pulse");
  });
});
