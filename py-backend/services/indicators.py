"""Technical indicators computed from OHLCV data."""

from __future__ import annotations

import logging
from typing import List, Optional

import numpy as np
import pandas as pd
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

router = APIRouter()
logger = logging.getLogger(__name__)


class OHLCVCandle(BaseModel):
    t: int  # unix seconds
    o: float
    h: float
    l: float
    c: float
    v: float = 0.0


class IndicatorsRequest(BaseModel):
    candles: List[OHLCVCandle] = Field(..., min_length=20)


class IndicatorPoint(BaseModel):
    t: int
    rsi14: Optional[float] = None
    macd: Optional[float] = None
    macdSignal: Optional[float] = None
    macdHist: Optional[float] = None
    ema20: Optional[float] = None
    ema50: Optional[float] = None
    ema200: Optional[float] = None
    bbUpper: Optional[float] = None
    bbMiddle: Optional[float] = None
    bbLower: Optional[float] = None
    atr14: Optional[float] = None
    adx14: Optional[float] = None
    volRel: Optional[float] = None


class IndicatorsResponse(BaseModel):
    points: List[IndicatorPoint]
    snapshot: dict


def _ema(s: pd.Series, span: int) -> pd.Series:
    return s.ewm(span=span, adjust=False).mean()


def _rsi(s: pd.Series, period: int = 14) -> pd.Series:
    delta = s.diff()
    up = delta.clip(lower=0)
    down = -delta.clip(upper=0)
    roll_up = up.ewm(alpha=1 / period, adjust=False).mean()
    roll_dn = down.ewm(alpha=1 / period, adjust=False).mean()
    rs = roll_up / roll_dn.replace(0, np.nan)
    return 100 - (100 / (1 + rs))


def _atr(h: pd.Series, l: pd.Series, c: pd.Series, period: int = 14) -> pd.Series:
    prev_c = c.shift(1)
    tr = pd.concat([(h - l), (h - prev_c).abs(), (l - prev_c).abs()], axis=1).max(axis=1)
    return tr.ewm(alpha=1 / period, adjust=False).mean()


def _adx(h: pd.Series, l: pd.Series, c: pd.Series, period: int = 14) -> pd.Series:
    plus_dm = (h.diff()).clip(lower=0)
    minus_dm = (-l.diff()).clip(lower=0)
    plus_dm = plus_dm.where(plus_dm > minus_dm, 0)
    minus_dm = minus_dm.where(minus_dm > plus_dm, 0)
    atr = _atr(h, l, c, period)
    plus_di = 100 * plus_dm.ewm(alpha=1 / period, adjust=False).mean() / atr
    minus_di = 100 * minus_dm.ewm(alpha=1 / period, adjust=False).mean() / atr
    dx = (plus_di - minus_di).abs() / (plus_di + minus_di).replace(0, np.nan) * 100
    return dx.ewm(alpha=1 / period, adjust=False).mean()


@router.post("", response_model=IndicatorsResponse)
def compute_indicators(req: IndicatorsRequest) -> IndicatorsResponse:
    try:
        df = pd.DataFrame([c.model_dump() for c in req.candles])
        df = df.sort_values("t").reset_index(drop=True)
        close = df["c"]
        high = df["h"]
        low = df["l"]
        volume = df["v"]

        ema20 = _ema(close, 20)
        ema50 = _ema(close, 50)
        ema200 = _ema(close, 200)
        rsi14 = _rsi(close, 14)
        macd_fast = _ema(close, 12)
        macd_slow = _ema(close, 26)
        macd = macd_fast - macd_slow
        macd_signal = _ema(macd, 9)
        macd_hist = macd - macd_signal
        bb_mid = close.rolling(20).mean()
        bb_std = close.rolling(20).std()
        bb_up = bb_mid + 2 * bb_std
        bb_lo = bb_mid - 2 * bb_std
        atr14 = _atr(high, low, close, 14)
        adx14 = _adx(high, low, close, 14)
        vol_ma = volume.rolling(20).mean().replace(0, np.nan)
        vol_rel = volume / vol_ma

        points: list[IndicatorPoint] = []
        for i in range(len(df)):
            points.append(
                IndicatorPoint(
                    t=int(df.loc[i, "t"]),
                    rsi14=_nan_to_none(rsi14.iloc[i]),
                    macd=_nan_to_none(macd.iloc[i]),
                    macdSignal=_nan_to_none(macd_signal.iloc[i]),
                    macdHist=_nan_to_none(macd_hist.iloc[i]),
                    ema20=_nan_to_none(ema20.iloc[i]),
                    ema50=_nan_to_none(ema50.iloc[i]),
                    ema200=_nan_to_none(ema200.iloc[i]),
                    bbUpper=_nan_to_none(bb_up.iloc[i]),
                    bbMiddle=_nan_to_none(bb_mid.iloc[i]),
                    bbLower=_nan_to_none(bb_lo.iloc[i]),
                    atr14=_nan_to_none(atr14.iloc[i]),
                    adx14=_nan_to_none(adx14.iloc[i]),
                    volRel=_nan_to_none(vol_rel.iloc[i]),
                )
            )

        last = points[-1] if points else None
        snapshot = _snapshot(last, close)
        return IndicatorsResponse(points=points, snapshot=snapshot)
    except Exception as exc:
        logger.exception("indicators failed")
        raise HTTPException(500, detail=str(exc)) from exc


def _snapshot(last: Optional[IndicatorPoint], close: pd.Series) -> dict:
    if not last:
        return {}
    pattern = None
    try:
        e50 = last.ema50
        e200 = last.ema200
        if e50 is not None and e200 is not None:
            pattern = "golden_cross" if e50 > e200 else "death_cross"
        if last.rsi14 is not None:
            if last.rsi14 > 70:
                pattern = "overbought"
            elif last.rsi14 < 30:
                pattern = "oversold"
    except Exception:  # noqa: BLE001
        pattern = None
    return {
        "pattern": pattern,
        "latestClose": float(close.iloc[-1]),
        "support": float(close.tail(90).min()) if len(close) >= 90 else None,
        "resistance": float(close.tail(90).max()) if len(close) >= 90 else None,
    }


def _nan_to_none(x):
    try:
        if x is None:
            return None
        xf = float(x)
        if xf != xf:  # NaN
            return None
        return xf
    except (TypeError, ValueError):
        return None
