/**
 * Ticker Intel Grid — Obsidian Command Design
 * Grid of expandable ticker cards showing per-ticker intelligence.
 */
import { motion } from "framer-motion";
import TickerIntel from "./TickerIntel";
import type { DashboardData } from "@/lib/types";

interface Props {
  watchlist: string[];
  tickerIntel: DashboardData["tickerIntel"];
}

export default function TickerIntelGrid({ watchlist, tickerIntel }: Props) {
  if (watchlist.length === 0) {
    return (
      <div className="dash-card text-center py-12">
        <p className="text-sm text-muted-foreground">No tickers in watchlist</p>
        <p className="text-xs text-muted-foreground mt-1">Add tickers to see their intelligence</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-3"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
            Ticker Intelligence
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Substack mentions, Seeking Alpha ratings, social buzz, filings & insider activity
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold font-mono text-primary">{watchlist.length}</div>
          <div className="text-xs text-muted-foreground">tickers</div>
        </div>
      </div>

      {/* Grid of ticker intel cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {watchlist.map((ticker, idx) => (
          <motion.div
            key={ticker}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05, duration: 0.3 }}
          >
            <TickerIntel ticker={ticker} intel={tickerIntel[ticker] || {
              substackMentions: [],
              seekingAlpha: [],
              socialBuzz: { twitter: "low", reddit: "low" },
              corporateFilings: [],
              insiderBuys: [],
            }} />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
