/**
 * Home Page — Market Pulse Dashboard
 * Design: "Obsidian Command" — Modern dark dashboard with layered depth
 * Layout: Asymmetric grid — left 2/3 primary, right 1/3 secondary on desktop
 */
import { useDashboardData } from "@/hooks/useDashboardData";
import { motion } from "framer-motion";
import { Loader2, AlertTriangle } from "lucide-react";

import Header from "@/components/Header";
import KeyThemes from "@/components/KeyThemes";
import FearGreedGauge from "@/components/FearGreedGauge";
import StockSentiment from "@/components/StockSentiment";
import SocialBuzz from "@/components/SocialBuzz";
import InsiderBuys from "@/components/InsiderBuys";
import PostSummaries from "@/components/PostSummaries";

export default function Home() {
  const { data, loading, error } = useDashboardData();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground" style={{ fontFamily: "var(--font-heading)" }}>
            Loading market intelligence...
          </p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 text-center px-4">
          <AlertTriangle className="w-8 h-8 text-destructive" />
          <p className="text-sm text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
            Failed to load dashboard data
          </p>
          <p className="text-xs text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header with hero */}
      <Header data={data} />

      {/* Main content */}
      <main className="container py-6 md:py-8">
        {/* Key Themes — full width */}
        <KeyThemes themes={data.keyThemes} />

        {/* Dashboard grid — asymmetric */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left column — primary content (8 cols) */}
          <div className="lg:col-span-8 space-y-5">
            {/* Fear & Greed + Stock Sentiment row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <FearGreedGauge data={data.fearGreedIndex} />
              <StockSentiment
                bullish={data.bullishStocks}
                bearish={data.bearishStocks}
                highlights={data.stockHighlights}
              />
            </div>

            {/* Insider Buys table */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <InsiderBuys
                buys={data.insiderBuys}
                note={data.insiderBuysNote}
                signals={data.insiderBuysSignals}
              />
            </motion.div>
          </div>

          {/* Right column — secondary intel (4 cols) */}
          <div className="lg:col-span-4 space-y-5">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <SocialBuzz data={data.socialBuzz} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <PostSummaries categories={data.postSummaries} />
            </motion.div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-10 pt-6 border-t border-border/50">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <span style={{ fontFamily: "var(--font-heading)" }} className="font-semibold text-foreground/60">
                Market Pulse
              </span>
              <span>·</span>
              <span>Daily Market Intelligence</span>
            </div>
            <div className="flex items-center gap-4">
              <span>Data from {data.subscriptionsCount} Substack subscriptions</span>
              <span>·</span>
              <span>Insider data via SEC EDGAR</span>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
