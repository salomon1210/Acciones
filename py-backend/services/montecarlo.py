"""Monte Carlo projection of future returns."""

from __future__ import annotations

from typing import List

import numpy as np
from fastapi import APIRouter
from pydantic import BaseModel, Field


router = APIRouter()


class MonteCarloRequest(BaseModel):
    currentPrice: float = Field(..., gt=0)
    dailyReturns: List[float] = Field(..., min_length=30)
    horizonDays: int = Field(252, gt=0, le=2520)
    simulations: int = Field(5000, gt=99, le=20000)


class MonteCarloResponse(BaseModel):
    mean: float
    median: float
    p5: float
    p25: float
    p75: float
    p95: float
    probPositive: float


@router.post("", response_model=MonteCarloResponse)
def simulate(req: MonteCarloRequest) -> MonteCarloResponse:
    mu = float(np.mean(req.dailyReturns))
    sigma = float(np.std(req.dailyReturns))
    rng = np.random.default_rng()
    shocks = rng.normal(loc=mu, scale=sigma, size=(req.simulations, req.horizonDays))
    paths = req.currentPrice * np.exp(np.cumsum(shocks, axis=1))
    final = paths[:, -1]
    return MonteCarloResponse(
        mean=float(np.mean(final)),
        median=float(np.median(final)),
        p5=float(np.percentile(final, 5)),
        p25=float(np.percentile(final, 25)),
        p75=float(np.percentile(final, 75)),
        p95=float(np.percentile(final, 95)),
        probPositive=float(np.mean(final > req.currentPrice)),
    )
