import { describe, expect, it } from "vitest";
import {
  cagr,
  pctGrowth,
  assessPE,
  assessROE,
  assessDebtEquity,
  assessFcfYield,
} from "@/lib/analysis/fundamentals";

describe("cagr", () => {
  it("returns compounded annual growth", () => {
    expect(cagr(100, 200, 5)).toBeCloseTo(Math.pow(2, 0.2) - 1, 5);
  });
  it("handles invalid inputs", () => {
    expect(cagr(null, 100, 5)).toBeNull();
    expect(cagr(100, null, 5)).toBeNull();
    expect(cagr(0, 100, 5)).toBeNull();
    expect(cagr(100, 200, 0)).toBeNull();
  });
});

describe("pctGrowth", () => {
  it("computes simple growth", () => {
    expect(pctGrowth(100, 150)).toBeCloseTo(0.5);
    expect(pctGrowth(200, 180)).toBeCloseTo(-0.1);
  });
  it("handles zero base", () => {
    expect(pctGrowth(0, 150)).toBeNull();
  });
});

describe("assessPE", () => {
  it("classifies cheap/fair/expensive", () => {
    expect(assessPE(10).label).toBe("barato");
    expect(assessPE(20).label).toBe("razonable");
    expect(assessPE(30).label).toBe("caro");
    expect(assessPE(80).label).toBe("muy caro");
    expect(assessPE(null).label).toBeNull();
  });
});

describe("assessROE", () => {
  it("labels higher-is-better", () => {
    expect(assessROE(0.25).label).toBe("barato");
    expect(assessROE(0.04).label).toBe("muy caro");
  });
});

describe("assessDebtEquity", () => {
  it("flags over-leveraged as muy caro", () => {
    expect(assessDebtEquity(0.3).label).toBe("barato");
    expect(assessDebtEquity(4).label).toBe("muy caro");
  });
  it("normalizes percentage inputs", () => {
    // yfinance returns 120 for a D/E of 1.2
    expect(assessDebtEquity(120).value).toBeCloseTo(1.2);
  });
});

describe("assessFcfYield", () => {
  it("requires positive market cap", () => {
    expect(assessFcfYield(1_000, 0).label).toBeNull();
    expect(assessFcfYield(1_000, 10_000).label).toBe("barato");
  });
});
