"""FastAPI entrypoint for Investment Command."""

from __future__ import annotations

import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from services import dcf, indicators, backtest, montecarlo, yfinance_bridge

logger = logging.getLogger("invcmd")
logging.basicConfig(level=logging.INFO)

app = FastAPI(title="Investment Command Backend", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


app.include_router(indicators.router, prefix="/indicators", tags=["indicators"])
app.include_router(dcf.router, prefix="/dcf", tags=["valuation"])
app.include_router(backtest.router, prefix="/backtest", tags=["backtest"])
app.include_router(montecarlo.router, prefix="/montecarlo", tags=["risk"])
app.include_router(yfinance_bridge.router, prefix="/yf", tags=["yfinance"])
