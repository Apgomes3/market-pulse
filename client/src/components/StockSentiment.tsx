/**
 * Stock Sentiment — Obsidian Command Design
 * Bullish (green) and Bearish (red) stock ticker pills with glow hover.
 */
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";
import type { StockHighlight } from "@/lib/types";

interface Props {
  bullish: string[];
  bearish: string[];
  highlights: StockHighlight[];
}

export default function StockSentiment({ bullish, bearish, highlights }: Props) {
  return (
    <div className="dash-card">
      <div className="section-label flex items-center gap-2">
        <TrendingUp className="w-3.5 h-3.5 text-bull" />
        Stock Sentiment
      </div>

      {/* Bullish */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1.5 h-1.5 rounded-full bg-bull" />
          <span className="text-xs font-semibold text-bull uppercase tracking-wider" style={{ fontFamily: "var(--font-heading)" }}>
            Bullish ({bullish.length})
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {bullish.map((ticker, i) => (
            <motion.span
              key={ticker}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
              className="ticker-pill ticker-bull"
            >
              ${ticker}
            </motion.span>
          ))}
        </div>
      </div>

      {/* Bearish */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1.5 h-1.5 rounded-full bg-bear" />
          <span className="text-xs font-semibold text-bear uppercase tracking-wider" style={{ fontFamily: "var(--font-heading)" }}>
            Bearish ({bearish.length})
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {bearish.map((ticker, i) => (
            <motion.span
              key={ticker}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
              className="ticker-pill ticker-bear"
            >
              ${ticker}
            </motion.span>
          ))}
        </div>
      </div>

      {/* Stock Highlights */}
      <div>
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3" style={{ fontFamily: "var(--font-heading)" }}>
          Highlights
        </div>
        <div className="space-y-2.5">
          {highlights.map((h, i) => (
            <motion.div
              key={`${h.ticker}-${i}`}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.06, duration: 0.3 }}
              className="flex items-start gap-3 text-xs"
            >
              <span className="font-mono font-semibold text-primary shrink-0 mt-0.5">
                ${h.ticker}
              </span>
              <div className="min-w-0">
                <p className="text-foreground/80 leading-relaxed">{h.context}</p>
                <p className="text-muted-foreground mt-0.5 italic">{h.publication}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
