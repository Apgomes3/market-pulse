/**
 * Social Buzz — Obsidian Command Design
 * Shows high/moderate/low chatter tickers with fire intensity indicators.
 */
import { motion } from "framer-motion";
import { Flame, MessageCircle } from "lucide-react";
import type { SocialBuzz as SocialBuzzType } from "@/lib/types";

interface Props {
  data: SocialBuzzType;
}

const levels = [
  {
    key: "high" as const,
    label: "High Chatter",
    fires: 3,
    color: "text-buzz-high",
    bg: "bg-buzz-high/10",
    border: "border-buzz-high/20",
    hoverBorder: "hover:border-buzz-high/40",
  },
  {
    key: "moderate" as const,
    label: "Moderate",
    fires: 2,
    color: "text-buzz-moderate",
    bg: "bg-buzz-moderate/10",
    border: "border-buzz-moderate/20",
    hoverBorder: "hover:border-buzz-moderate/40",
  },
  {
    key: "low" as const,
    label: "Low",
    fires: 1,
    color: "text-buzz-low",
    bg: "bg-buzz-low/10",
    border: "border-buzz-low/20",
    hoverBorder: "hover:border-buzz-low/40",
  },
];

export default function SocialBuzz({ data }: Props) {
  return (
    <div className="dash-card">
      <div className="section-label flex items-center gap-2">
        <MessageCircle className="w-3.5 h-3.5" />
        Social Buzz
      </div>

      <div className="space-y-5">
        {levels.map((level) => {
          const tickers = data[level.key];
          if (!tickers || tickers.length === 0) return null;

          return (
            <div key={level.key}>
              <div className="flex items-center gap-1.5 mb-2.5">
                {Array.from({ length: level.fires }).map((_, i) => (
                  <Flame key={i} className={`w-3.5 h-3.5 ${level.color}`} />
                ))}
                <span className={`text-xs font-semibold uppercase tracking-wider ml-1 ${level.color}`} style={{ fontFamily: "var(--font-heading)" }}>
                  {level.label}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {tickers.map((ticker, i) => (
                  <motion.span
                    key={ticker}
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.04, duration: 0.25 }}
                    className={`inline-flex items-center px-3 py-1 rounded-md font-mono text-sm font-semibold border transition-all duration-150 ${level.bg} ${level.color} ${level.border} ${level.hoverBorder}`}
                  >
                    {ticker}
                  </motion.span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
