/**
 * Home Page — Market Pulse Control Center
 * Design: "Obsidian Command" — Modern dark dashboard with layered depth
 * Layout: Tabbed control center with Watchlist, Publications, Intelligence, and Market sections
 */
import { useState, useEffect } from "react";
import { useDashboardData } from "@/hooks/useDashboardData";
import { motion } from "framer-motion";
import { Loader2, AlertTriangle } from "lucide-react";

import Header from "@/components/Header";
import KeyThemes from "@/components/KeyThemes";
import FearGreedGauge from "@/components/FearGreedGauge";
import StockSentiment from "@/components/StockSentiment";
import SocialBuzz from "@/components/SocialBuzz";
import InsiderBuys from "@/components/InsiderBuys";
import MacroOverview from "@/components/MacroOverview";
import PostSummaries from "@/components/PostSummaries";
import WatchlistManager from "@/components/WatchlistManager";
import SubstackPublications from "@/components/SubstackPublications";
import TickerIntelGrid from "@/components/TickerIntelGrid";

type Tab = "intelligence" | "watchlist" | "publications" | "market";

export default function Home() {
  const { data, loading, error } = useDashboardData();
  const [activeTab, setActiveTab] = useState<Tab>("intelligence");
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [publications, setPublications] = useState<any[]>([]);

  // Initialize from data and localStorage
  useEffect(() => {
    if (data && data.watchlist && Array.isArray(data.watchlist)) {
      const saved = localStorage.getItem("market_pulse_watchlist");
      setWatchlist(saved ? JSON.parse(saved) : data.watchlist);
    }
    if (data && data.substackPublications && Array.isArray(data.substackPublications)) {
      setPublications(data.substackPublications);
    }
  }, [data]);

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

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "intelligence", label: "Ticker Intelligence", icon: "📊" },
    { id: "watchlist", label: "Watchlist", icon: "⭐" },
    { id: "publications", label: "Publications", icon: "📰" },
    { id: "market", label: "Market Overview", icon: "🌍" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header with hero */}
      <Header data={data} />

      {/* Tab Navigation */}
      <div className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="container py-3">
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-md text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
                style={activeTab === tab.id ? { fontFamily: "var(--font-heading)" } : undefined}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="container py-6 md:py-8">
        {/* Intelligence Tab — Main focus */}
        {activeTab === "intelligence" && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <TickerIntelGrid watchlist={watchlist} tickerIntel={data.tickerIntel} />
          </motion.div>
        )}

        {/* Watchlist Tab */}
        {activeTab === "watchlist" && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <WatchlistManager watchlist={watchlist} onWatchlistChange={setWatchlist} />
          </motion.div>
        )}

        {/* Publications Tab */}
        {activeTab === "publications" && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {publications.length > 0 && (
              <SubstackPublications publications={publications} onPublicationsChange={setPublications} />
            )}
            {publications.length === 0 && (
              <div className="dash-card text-center py-8">
                <p className="text-sm text-muted-foreground">Loading publications...</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Market Overview Tab */}
        {activeTab === "market" && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Key Themes */}
            <KeyThemes themes={data.keyThemes} />

            {/* Macro Overview */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              <MacroOverview data={data.macroOverview} />
            </motion.div>

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
                  transition={{ delay: 0.2, duration: 0.5 }}
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
                  transition={{ delay: 0.15, duration: 0.5 }}
                >
                  <SocialBuzz data={data.socialBuzz} />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25, duration: 0.5 }}
                >
                  <PostSummaries categories={data.postSummaries} />
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Footer */}
        <footer className="mt-10 pt-6 border-t border-border/50">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <span style={{ fontFamily: "var(--font-heading)" }} className="font-semibold text-foreground/60">
                Market Pulse Control Center
              </span>
              <span>·</span>
              <span>Daily Market Intelligence</span>
            </div>
            <div className="flex items-center gap-4">
              <span>{watchlist.length} tickers tracked</span>
              <span>·</span>
              <span>{publications.length} publications</span>
              <span>·</span>
              <span>Data from {data.subscriptionsCount} Substack subscriptions</span>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
