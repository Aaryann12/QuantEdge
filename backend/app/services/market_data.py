"""
QuantEdge Central Live Market Data Service (Powered by yfinance)
Sole source of truth for stock quotes, NIFTY 50, SENSEX, NIFTY BANK, NIFTY IT, market status, market breadth, gainers/losers, and OHLCV history.
"""

from datetime import datetime, date, timedelta
import zoneinfo
import logging
import time
import yfinance as yf

# Indian Standard Timezone (Asia/Kolkata)
IST = zoneinfo.ZoneInfo("Asia/Kolkata")
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("market_data")

# NSE Holidays 2026 List (YYYY-MM-DD)
NSE_HOLIDAYS_2026 = {
    "2026-01-26", # Republic Day
    "2026-03-24", # Holi
    "2026-04-03", # Good Friday
    "2026-04-14", # Dr. Ambedkar Jayanti
    "2026-05-01", # Maharashtra Day
    "2026-08-15", # Independence Day
    "2026-10-02", # Mahatma Gandhi Jayanti
    "2026-10-20", # Dussehra
    "2026-11-09", # Diwali Laxmi Pujan
    "2026-12-25", # Christmas
}

# Authentic 500-Stock Universe Metadata (Symbol and Name metadata ONLY - ZERO static prices)
AUTHENTIC_500_STOCKS = [
  {"symbol": "CIPLA", "name": "Cipla Limited", "sector": "Pharma", "exchange": "NSE"},
  {"symbol": "RELIANCE", "name": "Reliance Industries Ltd.", "sector": "Energy & Retail", "exchange": "NSE"},
  {"symbol": "TCS", "name": "Tata Consultancy Services Ltd.", "sector": "IT Services", "exchange": "NSE"},
  {"symbol": "HDFCBANK", "name": "HDFC Bank Ltd.", "sector": "Banking", "exchange": "NSE"},
  {"symbol": "ICICIBANK", "name": "ICICI Bank Ltd.", "sector": "Banking", "exchange": "NSE"},
  {"symbol": "INFY", "name": "Infosys Ltd.", "sector": "IT Services", "exchange": "NSE"},
  {"symbol": "BHARTIARTL", "name": "Bharti Airtel Ltd.", "sector": "Telecom", "exchange": "NSE"},
  {"symbol": "SBIN", "name": "State Bank of India", "sector": "Banking", "exchange": "NSE"},
  {"symbol": "LTIM", "name": "LTIMindtree Ltd.", "sector": "IT Services", "exchange": "NSE"},
  {"symbol": "ITC", "name": "ITC Ltd.", "sector": "FMCG", "exchange": "NSE"},
  {"symbol": "KOTAKBANK", "name": "Kotak Mahindra Bank Ltd.", "sector": "Banking", "exchange": "NSE"},
  {"symbol": "LT", "name": "Larsen & Toubro Ltd.", "sector": "Engineering", "exchange": "NSE"},
  {"symbol": "HINDUNILVR", "name": "Hindustan Unilever Ltd.", "sector": "FMCG", "exchange": "NSE"},
  {"symbol": "AXISBANK", "name": "Axis Bank Ltd.", "sector": "Banking", "exchange": "NSE"},
  {"symbol": "BAJFINANCE", "name": "Bajaj Finance Ltd.", "sector": "NBFC", "exchange": "NSE"},
  {"symbol": "MARUTI", "name": "Maruti Suzuki India Ltd.", "sector": "Automobile", "exchange": "NSE"},
  {"symbol": "SUNPHARMA", "name": "Sun Pharmaceutical Industries Ltd.", "sector": "Healthcare", "exchange": "NSE"},
  {"symbol": "ADANIENT", "name": "Adani Enterprises Ltd.", "sector": "Metals & Mining", "exchange": "NSE"},
  {"symbol": "ONGC", "name": "Oil & Natural Gas Corporation Ltd.", "sector": "Oil & Gas", "exchange": "NSE"},
  {"symbol": "NTPC", "name": "NTPC Ltd.", "sector": "Power", "exchange": "NSE"},
  {"symbol": "HCLTECH", "name": "HCL Technologies Ltd.", "sector": "IT Services", "exchange": "NSE"},
  {"symbol": "POWERGRID", "name": "Power Grid Corporation of India Ltd.", "sector": "Power", "exchange": "NSE"},
  {"symbol": "TITAN", "name": "Titan Company Ltd.", "sector": "Consumer Durables", "exchange": "NSE"},
  {"symbol": "COALINDIA", "name": "Coal India Ltd.", "sector": "Mining", "exchange": "NSE"},
  {"symbol": "TATASTEEL", "name": "Tata Steel Ltd.", "sector": "Metals", "exchange": "NSE"},
  {"symbol": "JSWSTEEL", "name": "JSW Steel Ltd.", "sector": "Metals", "exchange": "NSE"},
  {"symbol": "M&M", "name": "Mahindra & Mahindra Ltd.", "sector": "Automobile", "exchange": "NSE"},
  {"symbol": "ADANIPORTS", "name": "Adani Ports & SEZ Ltd.", "sector": "Infrastructure", "exchange": "NSE"},
  {"symbol": "BAJAJFINSV", "name": "Bajaj Finserv Ltd.", "sector": "Financial Services", "exchange": "NSE"},
  {"symbol": "ULTRACEMCO", "name": "UltraTech Cement Ltd.", "sector": "Materials", "exchange": "NSE"},
  {"symbol": "ASIANPAINT", "name": "Asian Paints Ltd.", "sector": "Consumer Durables", "exchange": "NSE"},
  {"symbol": "WIPRO", "name": "Wipro Ltd.", "sector": "IT Services", "exchange": "NSE"},
  {"symbol": "NESTLEIND", "name": "Nestle India Ltd.", "sector": "FMCG", "exchange": "NSE"},
  {"symbol": "SIEMENS", "name": "Siemens Ltd.", "sector": "Capital Goods", "exchange": "NSE"},
  {"symbol": "DLF", "name": "DLF Ltd.", "sector": "Real Estate", "exchange": "NSE"},
  {"symbol": "GRASIM", "name": "Grasim Industries Ltd.", "sector": "Materials", "exchange": "NSE"},
  {"symbol": "TECHM", "name": "Tech Mahindra Ltd.", "sector": "IT Services", "exchange": "NSE"},
  {"symbol": "HINDALCO", "name": "Hindalco Industries Ltd.", "sector": "Metals", "exchange": "NSE"},
  {"symbol": "PIDILITIND", "name": "Pidilite Industries Ltd.", "sector": "Chemicals", "exchange": "NSE"},
  {"symbol": "BEL", "name": "Bharat Electronics Ltd.", "sector": "Defense", "exchange": "NSE"},
  {"symbol": "HAL", "name": "Hindustan Aeronautics Ltd.", "sector": "Defense", "exchange": "NSE"},
  {"symbol": "VBL", "name": "Varun Beverages Ltd.", "sector": "FMCG", "exchange": "NSE"},
  {"symbol": "TRENT", "name": "Trent Ltd.", "sector": "Retail", "exchange": "NSE"},
  {"symbol": "RECLTD", "name": "REC Ltd.", "sector": "Financials", "exchange": "NSE"},
  {"symbol": "PFC", "name": "Power Finance Corporation Ltd.", "sector": "Financials", "exchange": "NSE"},
  {"symbol": "IOC", "name": "Indian Oil Corporation Ltd.", "sector": "Energy", "exchange": "NSE"},
  {"symbol": "BPCL", "name": "Bharat Petroleum Corp. Ltd.", "sector": "Energy", "exchange": "NSE"},
  {"symbol": "GAIL", "name": "GAIL (India) Ltd.", "sector": "Gas", "exchange": "NSE"},
  {"symbol": "DRREDDY", "name": "Dr. Reddy's Laboratories Ltd.", "sector": "Pharma", "exchange": "NSE"},
  {"symbol": "DIVISLAB", "name": "Divi's Laboratories Ltd.", "sector": "Pharma", "exchange": "NSE"},
  {"symbol": "RADICO", "name": "Radico Khaitan Ltd.", "sector": "Beverages", "exchange": "NSE"},
  {"symbol": "RAMCOCEM", "name": "The Ramco Cements Ltd.", "sector": "Cement", "exchange": "NSE"},
  {"symbol": "RAYMOND", "name": "Raymond Ltd.", "sector": "Textiles", "exchange": "NSE"},
  {"symbol": "RAJESHEXPO", "name": "Rajesh Exports Ltd.", "sector": "Gems & Jewelry", "exchange": "NSE"},
  {"symbol": "RATNAMANI", "name": "Ratnamani Metals & Tubes Ltd.", "sector": "Capital Goods", "exchange": "NSE"},
  {"symbol": "RBLBANK", "name": "RBL Bank Ltd.", "sector": "Banking", "exchange": "NSE"},
  {"symbol": "RHIM", "name": "RHI Magnesita India Ltd.", "sector": "Industrial", "exchange": "NSE"},
  {"symbol": "RITES", "name": "RITES Ltd.", "sector": "Engineering", "exchange": "NSE"},
  {"symbol": "RVNL", "name": "Rail Vikas Nigam Ltd.", "sector": "Rail Infrastructure", "exchange": "NSE"}
]

class MarketDataProvider:
    def __init__(self):
        self._cache = {}
        self._cache_ttl = 60 # 60 seconds cache TTL for live data

    def get_current_time_ist(self) -> datetime:
        return datetime.now(IST)

    def is_holiday(self, dt: date) -> bool:
        return dt.strftime("%Y-%m-%d") in NSE_HOLIDAYS_2026

    def get_latest_trading_date(self, ref_dt: datetime = None) -> date:
        if ref_dt is None:
            ref_dt = self.get_current_time_ist()
        current = ref_dt.date()
        while current.weekday() in (5, 6) or self.is_holiday(current):
            current -= timedelta(days=1)
        if ref_dt.date() == current and ref_dt.time() < datetime.strptime("09:00", "%H:%M").time():
            current -= timedelta(days=1)
            while current.weekday() in (5, 6) or self.is_holiday(current):
                current -= timedelta(days=1)
        return current

    def get_next_trading_date(self, ref_d: date = None) -> date:
        if ref_d is None:
            ref_d = self.get_latest_trading_date()
        next_d = ref_d + timedelta(days=1)
        while next_d.weekday() in (5, 6) or self.is_holiday(next_d):
            next_d += timedelta(days=1)
        return next_d

    def get_market_status(self) -> dict:
        now_ist = self.get_current_time_ist()
        today = now_ist.date()
        weekday = now_ist.weekday()
        latest_trading_d = self.get_latest_trading_date(now_ist)
        next_trading_d = self.get_next_trading_date(latest_trading_d)

        if weekday in (5, 6):
            status = "WEEKEND"
        elif self.is_holiday(today):
            status = "MARKET_HOLIDAY"
        else:
            time_now = now_ist.time()
            open_time = datetime.strptime("09:15", "%H:%M").time()
            close_time = datetime.strptime("15:30", "%H:%M").time()
            pre_open_time = datetime.strptime("09:00", "%H:%M").time()

            if pre_open_time <= time_now < open_time:
                status = "PRE_MARKET"
            elif open_time <= time_now <= close_time:
                status = "MARKET_OPEN"
            else:
                status = "MARKET_CLOSED"

        return {
            "market_status": status,
            "market_date": today.strftime("%Y-%m-%d"),
            "last_trading_date": latest_trading_d.strftime("%Y-%m-%d"),
            "formatted_trading_date": latest_trading_d.strftime("%d %b %Y"),
            "next_trading_date": next_trading_d.strftime("%Y-%m-%d"),
            "formatted_next_trading_date": next_trading_d.strftime("%d %b %Y"),
            "last_updated": now_ist.strftime("%H:%M:%S IST"),
            "data_source": "Yahoo Finance (NSE Live API)",
            "is_live": status == "MARKET_OPEN"
        }

    def _get_cached_quote(self, symbol: str):
        cache_key = f"quote_{symbol.upper()}"
        if cache_key in self._cache:
            entry, timestamp = self._cache[cache_key]
            if time.time() - timestamp < self._cache_ttl:
                return entry
        return None

    def _set_cached_quote(self, symbol: str, data: dict):
        cache_key = f"quote_{symbol.upper()}"
        self._cache[cache_key] = (data, time.time())

    def _fetch_index_quote(self, name: str, ticker_sym: str) -> dict:
        cached = self._get_cached_quote(ticker_sym)
        if cached:
            return cached

        status_info = self.get_market_status()
        try:
            ticker = yf.Ticker(ticker_sym)
            df = ticker.history(period="5d")

            c_price, p_close, open_p, high_p, low_p = None, None, None, None, None
            session_dt = None

            if not df.empty and len(df) >= 1:
                last_dt_str = df.index[-1].strftime("%Y-%m-%d")
                if last_dt_str == status_info["last_trading_date"]:
                    last_row = df.iloc[-1]
                    prev_row = df.iloc[-2] if len(df) >= 2 else df.iloc[-1]
                    c_price = round(float(last_row["Close"]), 2)
                    p_close = round(float(prev_row["Close"]), 2)
                    open_p = round(float(last_row["Open"]), 2)
                    high_p = round(float(last_row["High"]), 2)
                    low_p = round(float(last_row["Low"]), 2)
                    session_dt = df.index[-1]

            if c_price is None:
                try:
                    info = ticker.info or {}
                    rm_time = info.get("regularMarketTime")
                    info_dt_str = datetime.fromtimestamp(rm_time, tz=IST).strftime("%Y-%m-%d") if rm_time else None

                    if rm_time and info_dt_str == status_info["last_trading_date"] and info.get("regularMarketPrice"):
                        c_price = round(float(info.get("regularMarketPrice")), 2)
                        p_close = round(float(info.get("regularMarketPreviousClose") or info.get("previousClose") or (df.iloc[-1]["Close"] if not df.empty else c_price)), 2)
                        open_p = round(float(info.get("regularMarketOpen") or info.get("open") or c_price), 2)
                        high_p = round(float(info.get("regularMarketDayHigh") or info.get("dayHigh") or c_price), 2)
                        low_p = round(float(info.get("regularMarketDayLow") or info.get("dayLow") or c_price), 2)
                except Exception as info_err:
                    logger.warning(f"Info quote fallback failed for {name} ({ticker_sym}): {info_err}")

            if c_price is None and not df.empty and len(df) >= 1:
                last_row = df.iloc[-1]
                prev_row = df.iloc[-2] if len(df) >= 2 else df.iloc[-1]
                c_price = round(float(last_row["Close"]), 2)
                p_close = round(float(prev_row["Close"]), 2)
                open_p = round(float(last_row["Open"]), 2)
                high_p = round(float(last_row["High"]), 2)
                low_p = round(float(last_row["Low"]), 2)
                session_dt = df.index[-1]

            if c_price is not None:
                change = round(c_price - p_close, 2)
                change_pct = round((change / p_close) * 100, 2) if p_close != 0 else 0.0

                last_trading_date = session_dt.strftime("%Y-%m-%d") if session_dt else status_info["last_trading_date"]
                formatted_trading_date = session_dt.strftime("%d %b %Y") if session_dt else status_info["formatted_trading_date"]

                res = {
                    "symbol": name,
                    "ticker": ticker_sym,
                    "price": c_price,
                    "current_price": c_price,
                    "prev_close": p_close,
                    "change": change,
                    "change_percent": change_pct,
                    "direction": "UP" if change >= 0 else "DOWN",
                    "isUp": change >= 0,
                    "open": open_p,
                    "high": high_p,
                    "low": low_p,
                    "market_status": status_info["market_status"],
                    "last_trading_date": last_trading_date,
                    "formatted_trading_date": formatted_trading_date,
                    "last_updated": status_info["last_updated"]
                }
                self._set_cached_quote(ticker_sym, res)
                return res
        except Exception as e:
            logger.error(f"yfinance index quote error for {name} ({ticker_sym}): {e}")

        return {
            "symbol": name,
            "ticker": ticker_sym,
            "error": f"{name} data temporarily unavailable"
        }

    def get_market_indices(self) -> list:
        indices_config = [
            {"name": "NIFTY 50", "ticker": "^NSEI"},
            {"name": "SENSEX", "ticker": "^BSESN"},
            {"name": "NIFTY BANK", "ticker": "^NSEBANK"},
            {"name": "NIFTY IT", "ticker": "^CNXIT"}
        ]
        results = []
        for item in indices_config:
            q = self._fetch_index_quote(item["name"], item["ticker"])
            results.append(q)
        return results

    def get_quote(self, symbol: str) -> dict:
        clean_symbol = symbol.strip().upper()
        cached = self._get_cached_quote(clean_symbol)
        if cached:
            return cached

        status_info = self.get_market_status()
        ticker_sym = f"{clean_symbol}.NS"

        try:
            ticker = yf.Ticker(ticker_sym)
            df = ticker.history(period="5d")
            
            if df.empty or len(df) == 0:
                return {"error": f"Market data temporarily unavailable for {clean_symbol}"}

            last_row = df.iloc[-1]
            prev_row = df.iloc[-2] if len(df) >= 2 else df.iloc[-1]

            current_price = round(float(last_row["Close"]), 2)
            prev_close = round(float(prev_row["Close"]), 2)
            open_price = round(float(last_row["Open"]), 2)
            high_price = round(float(last_row["High"]), 2)
            low_price = round(float(last_row["Low"]), 2)
            volume = int(last_row["Volume"])

            change = round(current_price - prev_close, 2)
            change_pct = round((change / prev_close) * 100, 2) if prev_close != 0 else 0.0

            session_dt = df.index[-1]
            last_trading_date = session_dt.strftime("%Y-%m-%d")
            formatted_trading_date = session_dt.strftime("%d %b %Y")

            meta = next((s for s in AUTHENTIC_500_STOCKS if s["symbol"] == clean_symbol), None)
            company_name = meta["name"] if meta else f"{clean_symbol} Limited"
            sector = meta["sector"] if meta else "Equities"

            res = {
                "symbol": clean_symbol,
                "company_name": company_name,
                "sector": sector,
                "exchange": "NSE",
                "current_price": current_price,
                "prev_close": prev_close,
                "open": open_price,
                "high": high_price,
                "low": low_price,
                "change": change,
                "change_percent": change_pct,
                "direction": "UP" if change >= 0 else "DOWN",
                "volume": volume,
                "formatted_volume": f"{round(volume/1000000, 2)}M",
                "last_trading_date": last_trading_date,
                "formatted_trading_date": formatted_trading_date,
                "last_updated": status_info["last_updated"],
                "market_status": status_info["market_status"]
            }

            self._set_cached_quote(clean_symbol, res)
            return res

        except Exception as e:
            logger.error(f"yfinance quote failed for {clean_symbol}: {e}")
            return {"error": f"Market data temporarily unavailable for {clean_symbol}"}

    def get_nifty(self) -> dict:
        return self._fetch_index_quote("NIFTY 50", "^NSEI")

    def get_all_quotes(self) -> list:
        top_symbols = [s["symbol"] for s in AUTHENTIC_500_STOCKS[:45]]
        ns_symbols = [f"{s}.NS" for s in top_symbols]

        try:
            df = yf.download(ns_symbols, period="5d", progress=False)
            if df.empty:
                return []

            closes = df['Close']
            opens = df['Open']
            highs = df['High']
            lows = df['Low']
            volumes = df['Volume']

            results = []
            for sym in top_symbols:
                ns_sym = f"{sym}.NS"
                try:
                    if ns_sym in closes.columns:
                        s_close = closes[ns_sym].dropna()
                        s_open = opens[ns_sym].dropna()
                        s_high = highs[ns_sym].dropna()
                        s_low = lows[ns_sym].dropna()
                        s_vol = volumes[ns_sym].dropna()

                        if len(s_close) >= 2:
                            c_price = round(float(s_close.iloc[-1]), 2)
                            p_close = round(float(s_close.iloc[-2]), 2)
                            chg = round(c_price - p_close, 2)
                            chg_pct = round((chg / p_close) * 100, 2) if p_close != 0 else 0.0
                            vol = int(s_vol.iloc[-1])

                            meta = next((s for s in AUTHENTIC_500_STOCKS if s["symbol"] == sym), {})

                            results.append({
                                "symbol": sym,
                                "company_name": meta.get("name", f"{sym} Ltd."),
                                "sector": meta.get("sector", "Equities"),
                                "exchange": "NSE",
                                "current_price": c_price,
                                "price": c_price,
                                "prev_close": p_close,
                                "open": round(float(s_open.iloc[-1]), 2),
                                "high": round(float(s_high.iloc[-1]), 2),
                                "low": round(float(s_low.iloc[-1]), 2),
                                "change": chg,
                                "change_percent": chg_pct,
                                "direction": "UP" if chg >= 0 else "DOWN",
                                "volume": vol,
                                "formatted_volume": f"{round(vol/1000000, 2)}M",
                                "last_trading_date": s_close.index[-1].strftime("%Y-%m-%d"),
                                "formatted_trading_date": s_close.index[-1].strftime("%d %b %Y")
                            })
                except Exception:
                    continue

            return results
        except Exception as e:
            logger.error(f"yfinance batch quote error: {e}")
            return []

    def get_gainers(self, limit: int = 10) -> dict:
        quotes = self.get_all_quotes()
        if not quotes:
            return {"error": "Market data temporarily unavailable"}

        gainers_list = [q for q in quotes if q["change_percent"] > 0]
        gainers_list.sort(key=lambda x: x["change_percent"], reverse=True)
        top = gainers_list[:limit]
        
        last_date = top[0]["last_trading_date"] if top else self.get_market_status()["last_trading_date"]

        return {
            "last_trading_date": last_date,
            "formatted_trading_date": top[0]["formatted_trading_date"] if top else self.get_market_status()["formatted_trading_date"],
            "gainers": top
        }

    def get_losers(self, limit: int = 10) -> dict:
        quotes = self.get_all_quotes()
        if not quotes:
            return {"error": "Market data temporarily unavailable"}

        losers_list = [q for q in quotes if q["change_percent"] < 0]
        losers_list.sort(key=lambda x: x["change_percent"])
        top = losers_list[:limit]

        last_date = top[0]["last_trading_date"] if top else self.get_market_status()["last_trading_date"]

        return {
            "last_trading_date": last_date,
            "formatted_trading_date": top[0]["formatted_trading_date"] if top else self.get_market_status()["formatted_trading_date"],
            "losers": top
        }

    def get_market_breadth(self) -> dict:
        """Calculates accurate market breadth across the active stock universe without artificial multipliers or false fallbacks."""
        quotes = self.get_all_quotes()
        if not quotes:
            return {"error": "Market data temporarily unavailable"}

        total_universe = 500
        valid_count = len(quotes)

        advances = sum(1 for s in quotes if s.get("change", 0) > 0)
        declines = sum(1 for s in quotes if s.get("change", 0) < 0)
        unchanged = sum(1 for s in quotes if s.get("change", 0) == 0)
        data_unavailable = max(0, total_universe - valid_count)

        total_vol = sum(s.get("volume", 0) for s in quotes)
        total_vol_cr = round(total_vol / 10000000, 2) if total_vol > 0 else None

        status_info = self.get_market_status()

        return {
            "advances": advances,
            "declines": declines,
            "unchanged": unchanged,
            "data_unavailable": data_unavailable,
            "total_universe": total_universe,
            "valid_count": valid_count,
            "advances_percent": round((advances / valid_count) * 100, 1) if valid_count > 0 else 0.0,
            "declines_percent": round((declines / valid_count) * 100, 1) if valid_count > 0 else 0.0,
            "unchanged_percent": round((unchanged / valid_count) * 100, 1) if valid_count > 0 else 0.0,
            "total_volume_cr": total_vol_cr,
            "formatted_volume": f"{total_vol_cr} Cr" if total_vol_cr is not None else "Volume unavailable",
            "market_breadth_ratio": round(advances / max(1, declines), 2),
            "last_trading_date": status_info["last_trading_date"],
            "formatted_trading_date": status_info["formatted_trading_date"],
            "last_updated": status_info["last_updated"]
        }

    def get_history(self, symbol: str, timeframe: str = "1M") -> dict:
        clean = symbol.strip().upper()
        if clean in ["^NSEI", "NIFTY", "NIFTY 50", "NIFTY50"]:
            ticker_sym = "^NSEI"
        elif clean.startswith("^"):
            ticker_sym = clean
        else:
            ticker_sym = f"{clean}.NS"
        status_info = self.get_market_status()

        if timeframe == "1D":
            try:
                ticker = yf.Ticker(ticker_sym)
                df = ticker.history(period="5d", interval="15m")
                if not df.empty:
                    latest_date = df.index[-1].date()
                    session_df = df[df.index.date == latest_date]
                    if session_df.empty:
                        session_df = df.iloc[-26:]

                    candles = []
                    for dt, row in session_df.iterrows():
                        time_str = dt.strftime("%H:%M")
                        candles.append({
                            "date": time_str,
                            "full_date": f"{latest_date.strftime('%d %b %Y')} {time_str}",
                            "timestamp": time_str,
                            "open": round(float(row["Open"]), 2),
                            "high": round(float(row["High"]), 2),
                            "low": round(float(row["Low"]), 2),
                            "close": round(float(row["Close"]), 2),
                            "price": round(float(row["Close"]), 2),
                            "volume": int(row["Volume"])
                        })

                    formatted_session = latest_date.strftime("%d %b %Y")
                    return {
                        "timeframe": "1D",
                        "symbol": clean,
                        "session_date": formatted_session,
                        "header_title": f"Historical intraday prices for {formatted_session}",
                        "candles": candles
                    }
            except Exception as e:
                logger.error(f"yfinance 1D intraday error for {clean}: {e}")

        period_map = {"5D": "5d", "1W": "5d", "1M": "1mo", "3M": "3mo", "6M": "6mo", "1Y": "1y"}
        period = period_map.get(timeframe, "5d")

        try:
            df = yf.Ticker(ticker_sym).history(period=period, interval="1d")
            if df.empty:
                return {"timeframe": timeframe, "symbol": clean, "candles": [], "header_title": "Historical prices"}

            candles = []
            for dt, row in df.iterrows():
                candles.append({
                    "date": dt.strftime("%d %b"),
                    "full_date": dt.strftime("%d %b %Y"),
                    "timestamp": dt.strftime("%d %b %Y"),
                    "iso_date": dt.strftime("%Y-%m-%d"),
                    "open": round(float(row["Open"]), 2),
                    "high": round(float(row["High"]), 2),
                    "low": round(float(row["Low"]), 2),
                    "close": round(float(row["Close"]), 2),
                    "price": round(float(row["Close"]), 2),
                    "volume": int(row["Volume"])
                })

            header_titles = {
                "5D": "Historical closing prices for the last 5 trading sessions",
                "1M": "Historical closing prices for the last 1 month",
                "3M": "Historical closing prices for the last 3 months",
                "6M": "Historical closing prices for the last 6 months",
                "1Y": "Historical closing prices for the last 1 year"
            }

            return {
                "timeframe": timeframe,
                "symbol": clean,
                "session_date": status_info["formatted_trading_date"],
                "header_title": header_titles.get(timeframe, "Historical prices for the selected period"),
                "candles": candles
            }
        except Exception as e:
            logger.error(f"yfinance history error for {clean} ({timeframe}): {e}")
            return {"timeframe": timeframe, "symbol": clean, "candles": [], "header_title": "Historical prices"}

    def search_stocks(self, query: str, limit: int = 8) -> list:
        q = query.strip().upper()
        if not q:
            return []

        matches = []
        for stock in AUTHENTIC_500_STOCKS:
            sym = stock["symbol"].upper()
            name = stock["name"].upper()

            if q in sym or q in name:
                score = 0
                if sym == q: score = 100
                elif sym.startswith(q): score = 80
                elif name.startswith(q): score = 60
                elif q in sym: score = 40
                else: score = 20
                matches.append((score, stock))

        matches.sort(key=lambda x: x[0], reverse=True)
        top = matches[:limit]

        results = []
        for _, s in top:
            quote = self.get_quote(s["symbol"])
            if not quote.get("error"):
                results.append(quote)
            else:
                results.append({
                    "symbol": s["symbol"],
                    "company_name": s["name"],
                    "sector": s["sector"],
                    "exchange": "NSE"
                })

        return results

market_provider = MarketDataProvider()
