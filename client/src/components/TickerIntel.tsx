/**
 * Ticker Intel — Obsidian Command Design
 * Expandable cards showing per-ticker intelligence: Substack mentions,
 * Seeking Alpha ratings, social buzz, filings, and insider buys.
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, TrendingUp, MessageCircle, FileText, Users } from "lucide-react";
import type { TickerIntel as TickerIntelType } from "@/lib/types";

interface Props {
  ticker: string;
  intel: TickerIntelType;
}

export default function TickerIntel({ ticker, intel }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);

  const hasMentions = intel.substackMentions.length > 0;
  const hasAlpha = intel.seekingAlpha.length > 0;
  const hasFilings = intel.corporateFilings.length > 0;
  const hasInsider = intel.insiderBuys.length > 0;
  const hasData = hasMentions || hasAlpha || hasFilings || hasInsider;

  const buzzLevel =
    intel.socialBuzz.twitter === "high" || intel.socialBuzz.reddit === "high"
      ? "high"
      : intel.socialBuzz.twitter === "moderate" || intel.socialBuzz.reddit === "moderate"
        ? "moderate"
        : "low";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="dash-card"
    >
      {/* Header — always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between"
      >
        <div className="flex items-center gap-3 flex-1">
          {/* Ticker badge */}
          <div className="px-3 py-1.5 rounded-md bg-primary/10 border border-primary/30 font-mono font-bold text-primary">
            {ticker}
          </div>

          {/* Quick stats */}
          <div className="flex items-center gap-3 text-xs">
            {hasMentions && (
              <div className="flex items-center gap-1 text-foreground/70">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span>{intel.substackMentions.length} mention{intel.substackMentions.length !== 1 ? "s" : ""}</span>
              </div>
            )}
            {hasAlpha && (
              <div className="flex items-center gap-1 text-foreground/70">
                <span className="w-1.5 h-1.5 rounded-full bg-chart-2" />
                <span>{intel.seekingAlpha.length} rating{intel.seekingAlpha.length !== 1 ? "s" : ""}</span>
              </div>
            )}
            {hasInsider && (
              <div className="flex items-center gap-1 text-bull">
                <span className="w-1.5 h-1.5 rounded-full bg-bull" />
                <span>{intel.insiderBuys.length} insider buy{intel.insiderBuys.length !== 1 ? "s" : ""}</span>
              </div>
            )}
            {/* Social buzz indicator */}
            <div
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold ${
                buzzLevel === "high"
                  ? "bg-buzz-high/10 text-buzz-high"
                  : buzzLevel === "moderate"
                    ? "bg-buzz-moderate/10 text-buzz-moderate"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              <MessageCircle className="w-3 h-3" />
              {buzzLevel}
            </div>
          </div>
        </div>

        {/* Expand button */}
        <motion.button
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="p-1 rounded hover:bg-muted transition-colors"
        >
          <ChevronDown className="w-5 h-5 text-muted-foreground" />
        </motion.button>
      </button>

      {/* Expanded content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-4 pt-4 border-t border-border/50 space-y-4"
          >
            {/* Substack Mentions */}
            {hasMentions && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  <h4 className="text-sm font-semibold text-foreground">Substack Mentions</h4>
                </div>
                <div className="space-y-2">
                  {intel.substackMentions.map((mention, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-md bg-muted/30 border border-border/50 text-xs"
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="font-semibold text-foreground">{mention.publication}</p>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold whitespace-nowrap ${
                            mention.sentiment === "bullish"
                              ? "bg-bull/20 text-bull"
                              : mention.sentiment === "bearish"
                                ? "bg-bear/20 text-bear"
                                : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {mention.sentiment}
                        </span>
                      </div>
                      <p className="text-foreground/70">{mention.context}</p>
                      <p className="text-muted-foreground mt-1">{mention.date}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Seeking Alpha */}
            {hasAlpha && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-chart-2" />
                  <h4 className="text-sm font-semibold text-foreground">Seeking Alpha</h4>
                </div>
                <div className="space-y-2">
                  {intel.seekingAlpha.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-md bg-muted/30 border border-border/50 text-xs"
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="font-semibold text-foreground">{item.title}</p>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-primary/20 text-primary whitespace-nowrap">
                          {item.rating}
                        </span>
                      </div>
                      <p className="text-foreground/70">{item.summary}</p>
                      <p className="text-muted-foreground mt-1">{item.date}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Insider Buys */}
            {hasInsider && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-bull" />
                  <h4 className="text-sm font-semibold text-foreground">Insider Buys</h4>
                </div>
                <div className="space-y-2">
                  {intel.insiderBuys.map((buy, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-md bg-bull/5 border border-bull/20 text-xs"
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="font-semibold text-foreground">{buy.insider}</p>
                        <span className="text-bull font-mono font-semibold">
                          ${(buy.totalValue / 1000000).toFixed(1)}M
                        </span>
                      </div>
                      <p className="text-foreground/70 text-[11px]">{buy.title}</p>
                      <p className="text-muted-foreground text-[11px] mt-1">
                        {buy.shares.toLocaleString()} shares @ ${buy.price.toFixed(2)} · {buy.date}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Corporate Filings */}
            {hasFilings && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <h4 className="text-sm font-semibold text-foreground">Corporate Filings</h4>
                </div>
                <div className="space-y-2">
                  {intel.corporateFilings.map((filing, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-md bg-muted/30 border border-border/50 text-xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-foreground">{filing.title}</p>
                          <p className="text-muted-foreground">{filing.type}</p>
                        </div>
                        <span className="text-muted-foreground whitespace-nowrap">{filing.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!hasData && (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">No intelligence data available</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
