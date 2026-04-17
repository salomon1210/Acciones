"""Simple backtesting utilities."""

from __future__ import annotations

from typing import List, Literal

import numpy as np
import pandas as pd
from fastapi import APIRouter
from pydantic import BaseModel, Field


router = APIRouter()


class BacktestCandle(BaseModel):
    t: int
    c: float


class BacktestRequest(BaseModel):
    strategy: Literal["sma_crossover", "rsi_mean_reversion"] = "sma_crossover"
    candles: List[BacktestCandle] = Field(..., min_length=50)
    fastSMA: int = 20
    slowSMA: int = 50
    rsiLow: int = 30
    rsiHigh: int = 70


class BacktestResponse(BaseModel):
    totalReturn: float
    cagr: float | None
    maxDrawdown: float
    sharpe: float | None
    trades: int


def _sharpe(returns: pd.Series) -> float | None:
    if returns.std() == 0 or returns.empty:
        return None
    return float((returns.mean() / returns.std()) * np.sqrt(252))


def _max_dd(equity: pd.Series) -> float:
    roll_max = equity.cummax()
    dd = equity / roll_max - 1
    return float(dd.min())


@router.post("", response_model=BacktestResponse)
def backtest(req: BacktestRequest) -> BacktestResponse:
    df = pd.DataFrame([c.model_dump() for c in req.candles]).sort_values("t")
    c = df["c"].reset_index(drop=True)
    rets = c.pct_change().fillna(0)

    if req.strategy == "sma_crossover":
        fast = c.rolling(req.fastSMA).mean()
        slow = c.rolling(req.slowSMA).mean()
        pos = (fast > slow).astype(int).shift(1).fillna(0)
    else:
        delta = c.diff()
        up = delta.clip(lower=0)
        down = -delta.clip(upper=0)
        period = 14
        rs = up.ewm(alpha=1 / period, adjust=False).mean() / down.ewm(alpha=1 / period, adjust=False).mean().replace(0, np.nan)
        rsi = 100 - 100 / (1 + rs)
        signal = pd.Series(0, index=c.index)
        holding = False
        for i in range(len(rsi)):
            if not holding and rsi.iloc[i] < req.rsiLow:
                holding = True
            elif holding and rsi.iloc[i] > req.rsiHigh:
                holding = False
            signal.iloc[i] = 1 if holding else 0
        pos = signal.shift(1).fillna(0)

    strat_rets = rets * pos
    equity = (1 + strat_rets).cumprod()
    total_ret = float(equity.iloc[-1] - 1)
    years = max(len(c) / 252, 1 / 252)
    cagr = float(equity.iloc[-1] ** (1 / years) - 1) if equity.iloc[-1] > 0 else None
    return BacktestResponse(
        totalReturn=total_ret,
        cagr=cagr,
        maxDrawdown=_max_dd(equity),
        sharpe=_sharpe(strat_rets),
        trades=int((pos.diff().fillna(0) != 0).sum()),
    )
