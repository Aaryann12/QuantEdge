"""
QuantEdge FastAPI Backend Application
Exposes REST API endpoints for market data, NIFTY 50, market breadth, gainers/losers, stock quotes, history, and AI model predictions.
"""

from fastapi import FastAPI, Query, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
from pydantic import BaseModel

from .services.market_data import market_provider
from .services.prediction_engine import prediction_engine
from .services.lambdarank_engine import lambdarank_engine

app = FastAPI(
    title="QuantEdge AI Market Intelligence API",
    description="Production market data and LambdaRank stock prediction REST API",
    version="2.0.0"
)

# Enable CORS for frontend Vite dev server (http://localhost:5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PredictRequest(BaseModel):
    symbol: str

@app.get("/")
def read_root():
    return {
        "app": "QuantEdge AI Market Intelligence",
        "status": "online",
        "market_status": market_provider.get_market_status()
    }

@app.get("/api/market/status")
def get_market_status():
    return market_provider.get_market_status()

@app.get("/api/market/nifty")
def get_nifty():
    return market_provider.get_nifty()

@app.get("/api/market/indices")
def get_market_indices():
    return market_provider.get_market_indices()

@app.get("/api/market/breadth")
def get_market_breadth():
    return market_provider.get_market_breadth()

@app.get("/api/market/lambdarank")
def get_lambdarank_rankings(limit: int = Query(10, ge=1, le=50)):
    return lambdarank_engine.get_rankings(limit=limit)

@app.get("/api/market/metrics")
def get_model_metrics():
    return lambdarank_engine.get_model_performance()

@app.get("/api/market/gainers")
def get_top_gainers(limit: int = Query(10, ge=1, le=50)):
    return market_provider.get_gainers(limit=limit)

@app.get("/api/market/losers")
def get_top_losers(limit: int = Query(10, ge=1, le=50)):
    return market_provider.get_losers(limit=limit)

@app.get("/api/stocks/search")
def search_stocks(q: str = Query("", min_length=1), limit: int = Query(8, ge=1, le=20)):
    return market_provider.search_stocks(query=q, limit=limit)

@app.get("/api/stocks/{symbol}/quote")
def get_stock_quote(symbol: str):
    return market_provider.get_quote(symbol)

@app.get("/api/stocks/{symbol}/history")
def get_stock_history(symbol: str, timeframe: str = Query("1M")):
    return market_provider.get_history(symbol=symbol, timeframe=timeframe)

@app.post("/api/predict")
def predict_stock(payload: PredictRequest):
    if not payload.symbol or not payload.symbol.strip():
        raise HTTPException(status_code=400, detail="Stock symbol is required.")
    return prediction_engine.predict_stock(payload.symbol)
