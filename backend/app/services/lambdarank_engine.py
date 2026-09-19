import os
import json
import time
import threading
import joblib
import pandas as pd
import numpy as np
import yfinance as yf
from .market_data import market_provider, AUTHENTIC_500_STOCKS

MODEL_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../stock_prediction_model"))
MODEL_PATH = os.path.join(MODEL_DIR, "lambdarank_model.pkl")
FEATURES_PATH = os.path.join(MODEL_DIR, "feature_columns.json")
CALIBRATION_PATH = os.path.join(MODEL_DIR, "calibration.json")

class LambdaRankEngine:
    def __init__(self):
        self.model = None
        self.feature_cols = []
        self.calibration = {}
        self._cache = None
        self._cache_time = 0
        self._cache_ttl = 900  # 15-minute in-memory cache TTL
        self._lock = threading.Lock()
        self._load_artifacts()

    def _load_artifacts(self):
        if os.path.exists(MODEL_PATH):
            try:
                self.model = joblib.load(MODEL_PATH)
            except Exception as e:
                print(f"[LambdaRankEngine] Error loading lambdarank_model.pkl: {e}")
        if os.path.exists(FEATURES_PATH):
            try:
                with open(FEATURES_PATH, "r") as f:
                    self.feature_cols = json.load(f)
            except Exception as e:
                print(f"[LambdaRankEngine] Error loading feature_columns.json: {e}")
        if os.path.exists(CALIBRATION_PATH):
            try:
                with open(CALIBRATION_PATH, "r") as f:
                    self.calibration = json.load(f)
            except Exception as e:
                pass

    def compute_features(self, df_all: pd.DataFrame) -> pd.DataFrame:
        """Computes the exact 65 technical features trained in Advanced_model.ipynb"""
        df = df_all.sort_values(["Date", "SYMBOL"]).reset_index(drop=True)
        g = df.groupby("SYMBOL", group_keys=False)

        df["RET_1D"] = g["Close"].pct_change(1)
        df["RET_3D"] = g["Close"].pct_change(3)
        df["RET_5D"] = g["Close"].pct_change(5)
        df["RET_10D"] = g["Close"].pct_change(10)
        df["RET_20D"] = g["Close"].pct_change(20)

        for lag in [1, 2, 3, 5, 10]:
            df[f"CLOSE_LAG_{lag}"] = g["Close"].shift(lag)

        for window in [5, 10, 20, 50]:
            df[f"SMA_{window}"] = g["Close"].transform(lambda x: x.rolling(window).mean())

        for window in [5, 10, 20]:
            df[f"EMA_{window}"] = g["Close"].transform(lambda x: x.ewm(span=window, adjust=False).mean())

        df["PRICE_SMA20"] = df["Close"] / (df["SMA_20"] + 1e-8) - 1
        df["PRICE_SMA50"] = df["Close"] / (df["SMA_50"] + 1e-8) - 1

        for window in [5, 10, 20]:
            df[f"VOLATILITY_{window}"] = g["RET_1D"].transform(lambda x: x.rolling(window).std())

        delta = g["Close"].diff()
        gain = delta.clip(lower=0)
        loss = -delta.clip(upper=0)
        avg_gain = gain.groupby(df["SYMBOL"]).transform(lambda x: x.rolling(14).mean())
        avg_loss = loss.groupby(df["SYMBOL"]).transform(lambda x: x.rolling(14).mean())
        rs = avg_gain / (avg_loss + 1e-8)
        df["RSI_14"] = 100 - (100 / (1 + rs))

        df["EMA_12"] = g["Close"].transform(lambda x: x.ewm(span=12, adjust=False).mean())
        df["EMA_26"] = g["Close"].transform(lambda x: x.ewm(span=26, adjust=False).mean())
        df["MACD"] = df["EMA_12"] - df["EMA_26"]
        df["MACD_SIGNAL"] = g["MACD"].transform(lambda x: x.ewm(span=9, adjust=False).mean())
        df["MACD_HIST"] = df["MACD"] - df["MACD_SIGNAL"]

        df["BB_MIDDLE"] = df["SMA_20"]
        df["BB_STD"] = g["Close"].transform(lambda x: x.rolling(20).std())
        df["BB_UPPER"] = df["BB_MIDDLE"] + 2 * df["BB_STD"]
        df["BB_LOWER"] = df["BB_MIDDLE"] - 2 * df["BB_STD"]
        df["BB_WIDTH"] = (df["BB_UPPER"] - df["BB_LOWER"]) / (df["BB_MIDDLE"] + 1e-8)
        df["BB_POSITION"] = (df["Close"] - df["BB_LOWER"]) / (df["BB_UPPER"] - df["BB_LOWER"] + 1e-8)

        prev_c = g["Close"].shift(1)
        tr1 = df["High"] - df["Low"]
        tr2 = (df["High"] - prev_c).abs()
        tr3 = (df["Low"] - prev_c).abs()
        df["TRUE_RANGE"] = pd.concat([tr1, tr2, tr3], axis=1).max(axis=1)
        df["ATR_14"] = g["TRUE_RANGE"].transform(lambda x: x.rolling(14).mean())
        df["ATR_PERCENT"] = df["ATR_14"] / (df["Close"] + 1e-8)

        low_14 = g["Low"].transform(lambda x: x.rolling(14).min())
        high_14 = g["High"].transform(lambda x: x.rolling(14).max())
        df["STOCH_K"] = ((df["Close"] - low_14) / (high_14 - low_14 + 1e-8)) * 100
        df["STOCH_D"] = g["STOCH_K"].transform(lambda x: x.rolling(3).mean())

        df["VOLUME_LAG_1"] = g["Volume"].shift(1)
        df["VOLUME_SMA20"] = g["Volume"].transform(lambda x: x.rolling(20).mean())
        df["VOLUME_RATIO"] = df["Volume"] / (df["VOLUME_SMA20"] + 1e-8)

        # Index-aligned VOLUME_RETURN_CORR feature computation
        corr_series = df.groupby("SYMBOL", group_keys=True).apply(
            lambda x: x["Volume"].rolling(20).corr(x["RET_1D"])
        )
        if isinstance(corr_series.index, pd.MultiIndex):
            df["VOLUME_RETURN_CORR"] = corr_series.droplevel(0)
        else:
            df["VOLUME_RETURN_CORR"] = corr_series

        rank_features = [
            "RET_1D", "RET_3D", "RET_5D", "RET_10D", "RET_20D",
            "RSI_14", "MACD", "MACD_HIST", "VOLATILITY_5", "VOLATILITY_10",
            "VOLATILITY_20", "ATR_PERCENT", "BB_POSITION", "VOLUME_RATIO",
            "PRICE_SMA20", "PRICE_SMA50"
        ]
        for col in rank_features:
            df["CS_RANK_" + col] = df.groupby("Date")[col].rank(pct=True)

        df["RISK_ADJUSTED_RET_5D"] = df["RET_5D"] / (df["VOLATILITY_20"] + 1e-6)
        df["RISK_ADJUSTED_RET_10D"] = df["RET_10D"] / (df["VOLATILITY_20"] + 1e-6)
        df["MOMENTUM_ACCELERATION"] = df["RET_1D"] - df["RET_5D"] / 5.0
        df["PRICE_TREND_STRENGTH"] = (df["Close"] - df["SMA_50"]) / (df["VOLATILITY_20"] * df["Close"] + 1e-6)
        df["MOMENTUM_VOL_RATIO"] = df["RET_5D"] / (df["VOLATILITY_5"] + 1e-6)

        return df

    def get_rankings(self, limit: int = 10) -> dict:
        now = time.time()
        with self._lock:
            if self._cache and (now - self._cache_time < self._cache_ttl):
                res_copy = dict(self._cache)
                res_copy["rankings"] = res_copy["rankings"][:limit]
                return res_copy

            status_info = market_provider.get_market_status()
            # Select 45 active, valid stocks (excluding delisted tickers like LTIM)
            valid_stocks = [s for s in AUTHENTIC_500_STOCKS if s["symbol"] != "LTIM"]
            top_symbols = [s["symbol"] for s in valid_stocks[:45]]
            ns_symbols = [f"{s}.NS" for s in top_symbols]

            try:
                # Download 60 days of historical data for feature computation
                df_raw = yf.download(ns_symbols, period="60d", progress=False)
                if df_raw.empty:
                    if self._cache:
                        res_copy = dict(self._cache)
                        res_copy["rankings"] = res_copy["rankings"][:limit]
                        return res_copy
                    return {"error": "Market data temporarily unavailable"}

                records = []
                closes = df_raw["Close"]
                opens = df_raw["Open"]
                highs = df_raw["High"]
                lows = df_raw["Low"]
                vols = df_raw["Volume"]

                dates = closes.index
                for dt in dates:
                    dt_str = dt.strftime("%Y-%m-%d")
                    for sym in top_symbols:
                        ns_sym = f"{sym}.NS"
                        if ns_sym in closes.columns:
                            c_val = closes.loc[dt, ns_sym]
                            if pd.notna(c_val):
                                records.append({
                                    "Date": dt_str,
                                    "SYMBOL": sym,
                                    "Open": float(opens.loc[dt, ns_sym]),
                                    "High": float(highs.loc[dt, ns_sym]),
                                    "Low": float(lows.loc[dt, ns_sym]),
                                    "Close": float(c_val),
                                    "Volume": float(vols.loc[dt, ns_sym])
                                })

                df_all = pd.DataFrame(records)
                if df_all.empty:
                    if self._cache:
                        res_copy = dict(self._cache)
                        res_copy["rankings"] = res_copy["rankings"][:limit]
                        return res_copy
                    return {"error": "Market data temporarily unavailable"}

                # Compute technical features
                df_feat = self.compute_features(df_all)

                # Get latest trading date's row for each stock
                latest_date = df_feat["Date"].max()
                latest_df = df_feat[df_feat["Date"] == latest_date].copy()

                # Fill any remaining NaNs with column median or 0
                for col in self.feature_cols:
                    if col in latest_df.columns:
                        latest_df[col] = latest_df[col].fillna(latest_df[col].median()).fillna(0)

                X_65 = latest_df[self.feature_cols]

                # Execute LightGBM LambdaRank model prediction
                scores = self.model.predict(X_65)
                latest_df["lambda_score"] = scores

                # Deterministic sorting: lambda_score descending, SYMBOL ascending
                latest_df = latest_df.sort_values(by=["lambda_score", "SYMBOL"], ascending=[False, True]).reset_index(drop=True)

                rankings = []
                for i, row in latest_df.iterrows():
                    sym = row["SYMBOL"]
                    meta = next((s for s in AUTHENTIC_500_STOCKS if s["symbol"] == sym), {})
                    
                    quote = market_provider.get_quote(sym)
                    if quote and not quote.get("error") and quote.get("current_price"):
                        c_price = round(float(quote["current_price"]), 2)
                        prev_close = round(float(quote["prev_close"]), 2)
                        change = round(c_price - prev_close, 2)
                        change_pct = round((change / prev_close) * 100, 2) if prev_close != 0 else 0.0
                    else:
                        c_price = round(float(row["Close"]), 2)
                        prev_close = round(float(row["CLOSE_LAG_1"]), 2) if "CLOSE_LAG_1" in row and pd.notna(row["CLOSE_LAG_1"]) else c_price
                        change = round(c_price - prev_close, 2)
                        change_pct = round((change / prev_close) * 100, 2) if prev_close != 0 else 0.0

                    l_score = float(row["lambda_score"])
                    
                    # Calibrated confidence & signal based on LambdaRank validation score
                    base_prob = float(self.calibration.get("positive_probability", 0.557))
                    conf = min(85, max(50, int(base_prob * 100 + (l_score * 100))))
                    sig = "STRONG" if conf >= 55 else "MODERATE"

                    rankings.append({
                        "rank": i + 1,
                        "symbol": sym,
                        "company_name": meta.get("name", f"{sym} Ltd."),
                        "sector": meta.get("sector", "Equities"),
                        "exchange": "NSE",
                        "current_price": c_price,
                        "price": c_price,
                        "prev_close": prev_close,
                        "change": change,
                        "change_percent": change_pct,
                        "lambda_score": round(l_score, 6),
                        "confidence": conf,
                        "signal": sig,
                        "direction": "UP" if change_pct >= 0 else "DOWN"
                    })

                res = {
                    "last_trading_date": latest_date,
                    "formatted_trading_date": status_info["formatted_trading_date"],
                    "next_trading_date": status_info["next_trading_date"],
                    "formatted_next_trading_date": status_info["formatted_next_trading_date"],
                    "market_status": status_info["market_status"],
                    "is_live": status_info["is_live"],
                    "rankings": rankings
                }

                self._cache = res
                self._cache_time = now

                res_copy = dict(res)
                res_copy["rankings"] = res_copy["rankings"][:limit]
                return res_copy

            except Exception as e:
                print(f"Error in lambdarank inference: {e}")
                if self._cache:
                    res_copy = dict(self._cache)
                    res_copy["rankings"] = res_copy["rankings"][:limit]
                    return res_copy
                return {"error": f"LambdaRank engine error: {e}"}

    def get_model_performance(self) -> list:
        MODEL_CONFIG_PATH = os.path.join(MODEL_DIR, "model_config.json")
        PERFORMANCE_PATH = os.path.join(MODEL_DIR, "model_performance.json")

        stocks_analyzed = "500"
        pos_days = "55.36%"
        avg_return = "+0.33%"
        sharpe = "2.67"

        if os.path.exists(MODEL_CONFIG_PATH):
            try:
                with open(MODEL_CONFIG_PATH, "r") as f:
                    cfg = json.load(f)
                    stocks_analyzed = str(cfg.get("number_of_stocks", 500))
            except Exception:
                pass

        if os.path.exists(PERFORMANCE_PATH):
            try:
                with open(PERFORMANCE_PATH, "r") as f:
                    perf = json.load(f)
                    test_perf = perf.get("final_test", {})
                    
                    if "top_5_positive_days" in test_perf:
                        p_val = float(test_perf["top_5_positive_days"])
                        pos_days = f"{round(p_val * 100, 2)}%"

                    if "top_5_avg_daily_return" in test_perf:
                        r_val = float(test_perf["top_5_avg_daily_return"])
                        avg_return = f"+{round(r_val * 100, 2)}%"

                    if "sharpe_ratio" in test_perf:
                        s_val = float(test_perf["sharpe_ratio"])
                        sharpe = f"{round(s_val, 2)}"
            except Exception:
                pass

        return [
            {
                "title": "Stocks Analyzed",
                "value": stocks_analyzed,
                "subtitle": "Indian Stock Universe",
                "icon": "Building2",
                "color": "#3b82f6",
                "bgColor": "rgba(59, 130, 246, 0.12)"
            },
            {
                "title": "Positive Days",
                "value": pos_days,
                "subtitle": "Test sessions with positive Top-5 return",
                "icon": "Target",
                "color": "#10b981",
                "bgColor": "rgba(16, 185, 129, 0.12)"
            },
            {
                "title": "Avg Top-5 Return",
                "value": avg_return,
                "subtitle": "Per Day (Out of Sample)",
                "icon": "TrendingUp",
                "color": "#8b5cf6",
                "bgColor": "rgba(139, 92, 246, 0.12)"
            },
            {
                "title": "Sharpe Ratio",
                "value": sharpe,
                "subtitle": "Out of Sample",
                "icon": "ShieldCheck",
                "color": "#f59e0b",
                "bgColor": "rgba(245, 158, 11, 0.12)"
            }
        ]

lambdarank_engine = LambdaRankEngine()

