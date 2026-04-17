"""Discounted Cash Flow fair value calculation."""

from __future__ import annotations

from typing import List
from fastapi import APIRouter
from pydantic import BaseModel, Field

router = APIRouter()


class DCFRequest(BaseModel):
    freeCashFlow: float = Field(..., description="Current year FCF in currency units (absolute)")
    sharesOutstanding: float = Field(..., gt=0)
    growthRates: List[float] = Field(..., min_length=1, max_length=10, description="Annual growth rates (decimal) for projection years")
    terminalGrowth: float = Field(0.025, description="Perpetual growth rate after projection")
    discountRate: float = Field(0.09, description="WACC (decimal)")
    taxRate: float = Field(0.21)
    netCashPerShare: float = 0.0
    currentPrice: float | None = None


class DCFResponse(BaseModel):
    fairValuePerShare: float
    enterpriseValue: float
    upside: float | None
    projectedFCF: List[float]
    discountedFCF: List[float]
    terminalValue: float
    terminalDiscounted: float


@router.post("", response_model=DCFResponse)
def dcf(req: DCFRequest) -> DCFResponse:
    fcf = req.freeCashFlow
    projected: list[float] = []
    for g in req.growthRates:
        fcf = fcf * (1 + g)
        projected.append(fcf)

    discounted = [
        cf / ((1 + req.discountRate) ** (i + 1)) for i, cf in enumerate(projected)
    ]

    terminal = projected[-1] * (1 + req.terminalGrowth) / max(req.discountRate - req.terminalGrowth, 0.005)
    terminal_disc = terminal / ((1 + req.discountRate) ** len(projected))

    ev = sum(discounted) + terminal_disc
    per_share = ev / req.sharesOutstanding + req.netCashPerShare

    upside = None
    if req.currentPrice and req.currentPrice > 0:
        upside = (per_share - req.currentPrice) / req.currentPrice

    return DCFResponse(
        fairValuePerShare=per_share,
        enterpriseValue=ev,
        upside=upside,
        projectedFCF=projected,
        discountedFCF=discounted,
        terminalValue=terminal,
        terminalDiscounted=terminal_disc,
    )
