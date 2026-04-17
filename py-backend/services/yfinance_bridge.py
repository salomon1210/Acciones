"""yfinance bridge — free market data gateway for the Node.js side."""

from __future__ import annotations

import logging
from typing import Any

import yfinance as yf
from fastapi import APIRouter, HTTPException, Query

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/quote")
def quote(symbol: str) -> dict[str, Any]:
    try:
        t = yf.Ticker(symbol)
        info = t.fast_info
        prev = float(info.get("previous_close") or 0)
        last = float(info.get("last_price") or info.get("regular_market_price") or 0)
        change = last - prev if prev else 0.0
        pct = (change / prev) if prev else 0.0
        return {
            "symbol": symbol.upper(),
            "price": last,
            "prevClose": prev,
            "change": change,
            "changePct": pct,
            "dayHigh": float(info.get("day_high") or 0),
            "dayLow": float(info.get("day_low") or 0),
            "volume": int(info.get("last_volume") or 0),
            "currency": info.get("currency") or "USD",
            "marketCap": _safe_float(info.get("market_cap")),
        }
    except Exception as exc:
        logger.warning("yf quote failed for %s: %s", symbol, exc)
        raise HTTPException(502, detail=f"yfinance quote failed for {symbol}") from exc


@router.get("/historical")
def historical(
    symbol: str,
    period: str = Query("1y", description="yfinance period: 1mo, 3mo, 6mo, 1y, 2y, 5y, max"),
    interval: str = Query("1d"),
) -> dict[str, Any]:
    try:
        hist = yf.Ticker(symbol).history(period=period, interval=interval, auto_adjust=True)
        if hist.empty:
            raise HTTPException(404, detail=f"no history for {symbol}")
        candles = [
            {
                "t": int(ts.timestamp()),
                "o": _safe_float(row["Open"]),
                "h": _safe_float(row["High"]),
                "l": _safe_float(row["Low"]),
                "c": _safe_float(row["Close"]),
                "v": _safe_float(row.get("Volume", 0.0)),
            }
            for ts, row in hist.iterrows()
        ]
        return {"symbol": symbol.upper(), "candles": candles}
    except HTTPException:
        raise
    except Exception as exc:
        logger.warning("yf history failed for %s: %s", symbol, exc)
        raise HTTPException(502, detail=f"yfinance history failed for {symbol}") from exc


@router.get("/fundamentals")
def fundamentals(symbol: str) -> dict[str, Any]:
    try:
        t = yf.Ticker(symbol)
        info = t.info or {}
        out = {
            "symbol": symbol.upper(),
            "name": info.get("longName") or info.get("shortName"),
            "sector": info.get("sector"),
            "industry": info.get("industry"),
            "country": info.get("country"),
            "exchange": info.get("exchange"),
            "summary": info.get("longBusinessSummary"),
            "website": info.get("website"),
            "marketCap": _safe_float(info.get("marketCap")),
            "enterpriseValue": _safe_float(info.get("enterpriseValue")),
            "sharesOutstanding": _safe_float(info.get("sharesOutstanding")),
            "floatShares": _safe_float(info.get("floatShares")),
            "peRatio": _safe_float(info.get("trailingPE")),
            "forwardPE": _safe_float(info.get("forwardPE")),
            "pbRatio": _safe_float(info.get("priceToBook")),
            "psRatio": _safe_float(info.get("priceToSalesTrailing12Months")),
            "evEbitda": _safe_float(info.get("enterpriseToEbitda")),
            "dividendYield": _safe_float(info.get("dividendYield")),
            "payoutRatio": _safe_float(info.get("payoutRatio")),
            "beta": _safe_float(info.get("beta")),
            "shortFloat": _safe_float(info.get("shortPercentOfFloat")),
            "insiderOwnership": _safe_float(info.get("heldPercentInsiders")),
            "institutionalOwnership": _safe_float(info.get("heldPercentInstitutions")),
            "fiftyTwoWeekHigh": _safe_float(info.get("fiftyTwoWeekHigh")),
            "fiftyTwoWeekLow": _safe_float(info.get("fiftyTwoWeekLow")),
            "profitMargin": _safe_float(info.get("profitMargins")),
            "operatingMargin": _safe_float(info.get("operatingMargins")),
            "grossMargin": _safe_float(info.get("grossMargins")),
            "returnOnEquity": _safe_float(info.get("returnOnEquity")),
            "returnOnAssets": _safe_float(info.get("returnOnAssets")),
            "debtToEquity": _safe_float(info.get("debtToEquity")),
            "currentRatio": _safe_float(info.get("currentRatio")),
            "quickRatio": _safe_float(info.get("quickRatio")),
            "revenue": _safe_float(info.get("totalRevenue")),
            "grossProfit": _safe_float(info.get("grossProfits")),
            "ebitda": _safe_float(info.get("ebitda")),
            "netIncome": _safe_float(info.get("netIncomeToCommon")),
            "freeCashFlow": _safe_float(info.get("freeCashflow")),
            "operatingCashflow": _safe_float(info.get("operatingCashflow")),
            "totalCash": _safe_float(info.get("totalCash")),
            "totalDebt": _safe_float(info.get("totalDebt")),
            "revenueGrowth": _safe_float(info.get("revenueGrowth")),
            "earningsGrowth": _safe_float(info.get("earningsGrowth")),
            "targetMeanPrice": _safe_float(info.get("targetMeanPrice")),
            "targetHighPrice": _safe_float(info.get("targetHighPrice")),
            "targetLowPrice": _safe_float(info.get("targetLowPrice")),
            "recommendationKey": info.get("recommendationKey"),
            "numberOfAnalystOpinions": info.get("numberOfAnalystOpinions"),
        }
        return out
    except Exception as exc:
        logger.warning("yf fundamentals failed for %s: %s", symbol, exc)
        raise HTTPException(502, detail=f"yfinance fundamentals failed for {symbol}") from exc


@router.get("/statements")
def statements(symbol: str) -> dict[str, Any]:
    try:
        t = yf.Ticker(symbol)
        income = _df_to_records(t.financials)
        balance = _df_to_records(t.balance_sheet)
        cash = _df_to_records(t.cashflow)
        return {"income": income, "balance": balance, "cashflow": cash}
    except Exception as exc:
        logger.warning("yf statements failed for %s: %s", symbol, exc)
        raise HTTPException(502, detail=f"yfinance statements failed for {symbol}") from exc


def _df_to_records(df) -> list[dict[str, Any]]:
    if df is None or df.empty:
        return []
    records = []
    for col in df.columns:
        record = {"period": str(col)}
        for idx, val in df[col].items():
            record[str(idx)] = _safe_float(val)
        records.append(record)
    return records


def _safe_float(x):
    try:
        if x is None:
            return None
        xf = float(x)
        if xf != xf:
            return None
        return xf
    except (TypeError, ValueError):
        return None
