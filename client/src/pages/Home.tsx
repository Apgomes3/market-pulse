/**
 * Market Pulse — Control Center
 * Sidebar navigation layout with:
 *   - Market Overview (default): 42 Macro → Fear & Greed → Watchlist Sentiment → Highlights → Social Buzz → Insider Buys
 *   - Ticker Intelligence: expandable per-ticker cards
 *   - Watchlist: back-office management
 *   - Publications: back-office management
 *
 * Watchlist & Publications write back to S3 + GitHub via tRPC.
 */
import { useState, useEffect, useCallback } from "react";
import { useDashboardData } from "@/hooks/useDashboardData";
import { trpc } from "@/lib/trpc";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  AlertTriangle,
  Activity,
  BarChart2,
  Star,
  Rss,
  ChevronRight,
  Menu,
  X,
  Clock,
} from "lucide-react";
import { toast } from "sonner";

import MacroOverview from "@/components/MacroOverview";
import FearGreedGauge from "@/components/FearGreedGauge";
import StockSentiment from "@/components/StockSentiment";
import SocialBuzz from "@/components/SocialBuzz";
import InsiderBuys from "@/components/InsiderBuys";
import WatchlistManager from "@/components/WatchlistManager";
import SubstackPublications from "@/components/SubstackPublications";
import TickerIntelGrid from "@/components/TickerIntelGrid";
import type { SubstackPublication, SocialBuzz as SocialBuzzType, StockHighlight } from "@/lib/types";

type NavSection = "overview" | "intelligence" | "watchlist" | "publications";

const NAV_ITEMS: { id: NavSection; label: string; icon: React.ReactNode; description: string }[] = [
  { id: "overview", label: "Market Overview", icon: <BarChart2 className="w-4 h-4" />, description: "Daily macro & market intel" },
  { id: "intelligence", label: "Ticker Intelligence", icon: <Activity className="w-4 h-4" />, description: "Per-ticker deep dive" },
  { id: "watchlist", label: "Watchlist", icon: <Star className="w-4 h-4" />, description: "Manage tracked tickers" },
  { id: "publications", label: "Publications", icon: <Rss className="w-4 h-4" />, description: "Manage Substack feeds" },
];

export default function Home() {
  const { data, loading, error } = useDashboardData();
  const [activeSection, setActiveSection] = useState<NavSection>("overview");
  const [watchlist, setWatchlistState] = useState<string[]>([]);
  const [publications, setPublicationsState] = useState<SubstackPublication[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // tRPC mutations for persistence
  const updateWatchlistMutation = trpc.dashboard.updateWatchlist.useMutation({
    onSuccess: () => {
      toast.success("Watchlist synced to GitHub");
      setIsSyncing(false);
    },
    onError: (err) => {
      toast.error(`Sync failed: ${err.message}`);
      setIsSyncing(false);
    },
  });

  const updatePublicationsMutation = trpc.dashboard.updatePublications.useMutation({
    onSuccess: () => {
      toast.success("Publications synced to GitHub");
      setIsSyncing(false);
    },
    onError: (err) => {
      toast.error(`Sync failed: ${err.message}`);
      setIsSyncing(false);
    },
  });

  // Initialize from data
  useEffect(() => {
    if (data) {
      if (data.watchlist?.length) {
        const saved = localStorage.getItem("market_pulse_watchlist");
        setWatchlistState(saved ? JSON.parse(saved) : data.watchlist);
      }
      if (data.substackPublications?.length) {
        setPublicationsState(data.substackPublications);
      }
    }
  }, [data]);

  const handleWatchlistChange = useCallback((newWatchlist: string[]) => {
    setWatchlistState(newWatchlist);
    localStorage.setItem("market_pulse_watchlist", JSON.stringify(newWatchlist));
    setIsSyncing(true);
    updateWatchlistMutation.mutate({ watchlist: newWatchlist });
  }, [updateWatchlistMutation]);

  const handlePublicationsChange = useCallback((newPubs: SubstackPublication[]) => {
    setPublicationsState(newPubs);
    setIsSyncing(true);
    updatePublicationsMutation.mutate({ publications: newPubs });
  }, [updatePublicationsMutation]);

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

  // ── Watchlist-filtered data ──────────────────────────────────────────────────
  const watchlistSet = new Set(watchlist.map((t) => t.toUpperCase()));

  const watchlistBullish = data.bullishStocks.filter((t) => watchlistSet.has(t.toUpperCase()));
  const watchlistBearish = data.bearishStocks.filter((t) => watchlistSet.has(t.toUpperCase()));
  const watchlistHighlights: StockHighlight[] = (data.stockHighlights || []).filter((h) =>
    watchlistSet.has(h.ticker.toUpperCase())
  );

  const watchlistSocialBuzz: SocialBuzzType = {
    high: (data.socialBuzz?.high || []).filter((t) => watchlistSet.has(t.toUpperCase())),
    moderate: (data.socialBuzz?.moderate || []).filter((t) => watchlistSet.has(t.toUpperCase())),
    low: (data.socialBuzz?.low || []).filter((t) => watchlistSet.has(t.toUpperCase())),
  };

  const hasSocialBuzz =
    watchlistSocialBuzz.high.length > 0 ||
    watchlistSocialBuzz.moderate.length > 0 ||
    watchlistSocialBuzz.low.length > 0;

  // ── Sidebar ──────────────────────────────────────────────────────────────────
  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <nav
      className={`${
        mobile
          ? "flex flex-col h-full"
          : "hidden lg:flex flex-col h-full"
      }`}
    >
      {/* Logo */}
      <div className="px-4 py-5 border-b border-border/50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-md bg-primary/20 border border-primary/30 flex items-center justify-center">
            <Activity className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
              Market Pulse
            </h1>
            <p className="text-[10px] text-muted-foreground">Daily Intelligence</p>
          </div>
        </div>
      </div>

      {/* Date */}
      <div className="px-4 py-3 border-b border-border/50">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          <span>{data.reportDate}</span>
        </div>
        {isSyncing && (
          <div className="flex items-center gap-1.5 mt-1 text-[10px] text-primary">
            <Loader2 className="w-2.5 h-2.5 animate-spin" />
            <span>Syncing to GitHub...</span>
          </div>
        )}
      </div>

      {/* Nav items */}
      <div className="flex-1 px-2 py-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = activeSection === item.id;
          const isBackOffice = item.id === "watchlist" || item.id === "publications";
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveSection(item.id);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-left transition-all duration-150 group ${
                isActive
                  ? "bg-primary/15 border border-primary/25 text-primary"
                  : isBackOffice
                  ? "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                  : "text-foreground/80 hover:text-foreground hover:bg-muted/30"
              }`}
            >
              <span className={`shrink-0 ${isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`}>
                {item.icon}
              </span>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${isActive ? "text-primary" : ""}`} style={{ fontFamily: "var(--font-heading)" }}>
                  {item.label}
                </p>
                <p className="text-[10px] text-muted-foreground truncate">{item.description}</p>
              </div>
              {isActive && <ChevronRight className="w-3.5 h-3.5 text-primary shrink-0" />}
            </button>
          );
        })}
      </div>

      {/* Footer stats */}
      <div className="px-4 py-3 border-t border-border/50 space-y-1.5">
        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
          <span>Watchlist</span>
          <span className="font-mono text-foreground/60">{watchlist.length} tickers</span>
        </div>
        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
          <span>Publications</span>
          <span className="font-mono text-foreground/60">{publications.length}</span>
        </div>
        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
          <span>Fear & Greed</span>
          <span className={`font-mono font-semibold ${
            data.fearGreedIndex.value <= 45 ? "text-bear" : data.fearGreedIndex.value >= 55 ? "text-bull" : "text-muted-foreground"
          }`}>{data.fearGreedIndex.value} · {data.fearGreedIndex.label}</span>
        </div>
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-56 xl:w-64 border-r border-border bg-card/30 shrink-0 sticky top-0 h-screen overflow-y-auto">
        <Sidebar />
      </aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 z-50 w-64 bg-card border-r border-border lg:hidden overflow-y-auto"
            >
              <div className="flex items-center justify-between p-4 border-b border-border/50">
                <span className="text-sm font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
                  Market Pulse
                </span>
                <button onClick={() => setSidebarOpen(false)} className="p-1 rounded hover:bg-muted transition-colors">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
              <Sidebar mobile />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Mobile top bar */}
        <div className="lg:hidden sticky top-0 z-30 flex items-center gap-3 px-4 py-3 bg-background/95 backdrop-blur-sm border-b border-border">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-md hover:bg-muted transition-colors"
          >
            <Menu className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" />
            <span className="text-sm font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
              Market Pulse
            </span>
          </div>
          <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>{data.reportDate}</span>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            {/* ── MARKET OVERVIEW ─────────────────────────────────────────────── */}
            {activeSection === "overview" && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.25 }}
                className="p-4 md:p-6 space-y-5 max-w-6xl"
              >
                {/* Page title */}
                <div>
                  <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
                    Market Overview
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">as of {data.dataAsOf}</p>
                </div>

                {/* 1. 42 Macro Overview — TOP */}
                <MacroOverview data={data.macroOverview} />

                {/* 2. Fear & Greed */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <FearGreedGauge data={data.fearGreedIndex} />

                  {/* 3. Watchlist Stock Sentiment */}
                  <div className="dash-card">
                    <div className="section-label text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4" style={{ fontFamily: "var(--font-heading)" }}>
                      Watchlist Sentiment
                    </div>
                    {watchlistBullish.length === 0 && watchlistBearish.length === 0 ? (
                      <div className="text-center py-6">
                        <p className="text-sm text-muted-foreground">No watchlist tickers in today's sentiment data</p>
                        <p className="text-xs text-muted-foreground mt-1">Add tickers to your watchlist to see filtered sentiment</p>
                      </div>
                    ) : (
                      <StockSentiment
                        bullish={watchlistBullish}
                        bearish={watchlistBearish}
                        highlights={watchlistHighlights}
                      />
                    )}
                  </div>
                </div>

                {/* 4. Social Buzz — watchlist only */}
                {hasSocialBuzz && (
                  <SocialBuzz data={watchlistSocialBuzz} />
                )}
                {!hasSocialBuzz && (
                  <div className="dash-card">
                    <div className="section-label text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3" style={{ fontFamily: "var(--font-heading)" }}>
                      Social Buzz — Watchlist
                    </div>
                    <p className="text-sm text-muted-foreground text-center py-4">No social buzz data for watchlist tickers today</p>
                  </div>
                )}

                {/* 5. Russell 3000 Top 20 Insider Buys — overall */}
                <InsiderBuys
                  buys={data.insiderBuys}
                  note={data.insiderBuysNote}
                  signals={data.insiderBuysSignals}
                />
              </motion.div>
            )}

            {/* ── TICKER INTELLIGENCE ─────────────────────────────────────────── */}
            {activeSection === "intelligence" && (
              <motion.div
                key="intelligence"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.25 }}
                className="p-4 md:p-6"
              >
                <div className="mb-5">
                  <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
                    Ticker Intelligence
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Click any ticker to expand Substack mentions, Seeking Alpha ratings, social buzz, insider buys & filings
                  </p>
                </div>
                <TickerIntelGrid watchlist={watchlist} tickerIntel={data.tickerIntel} />
              </motion.div>
            )}

            {/* ── WATCHLIST ────────────────────────────────────────────────────── */}
            {activeSection === "watchlist" && (
              <motion.div
                key="watchlist"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.25 }}
                className="p-4 md:p-6 max-w-3xl"
              >
                <div className="mb-5">
                  <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
                    Watchlist
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Manage tracked tickers. Changes sync to GitHub so the daily automation reads the current list.
                  </p>
                </div>
                <WatchlistManager watchlist={watchlist} onWatchlistChange={handleWatchlistChange} />
              </motion.div>
            )}

            {/* ── PUBLICATIONS ─────────────────────────────────────────────────── */}
            {activeSection === "publications" && (
              <motion.div
                key="publications"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.25 }}
                className="p-4 md:p-6 max-w-3xl"
              >
                <div className="mb-5">
                  <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
                    Publications
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Manage tracked Substack publications. Changes sync to GitHub so the daily automation reads the current list.
                  </p>
                </div>
                <SubstackPublications publications={publications} onPublicationsChange={handlePublicationsChange} />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
