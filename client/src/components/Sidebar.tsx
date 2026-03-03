/**
 * Sidebar Navigation — Obsidian Command Design
 * Professional trading terminal side navigation with collapsible mobile drawer.
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  BarChart3,
  Star,
  Rss,
  Globe,
  Menu,
  X,
  Settings,
  Clock,
} from "lucide-react";

export type NavSection = "overview" | "intelligence" | "watchlist" | "publications";

interface Props {
  active: NavSection;
  onNavigate: (section: NavSection) => void;
  reportDate: string;
  watchlistCount: number;
  publicationsCount: number;
}

const navItems: { id: NavSection; label: string; icon: React.ReactNode; group: "main" | "settings" }[] = [
  { id: "overview", label: "Market Overview", icon: <Globe className="w-4 h-4" />, group: "main" },
  { id: "intelligence", label: "Ticker Intel", icon: <BarChart3 className="w-4 h-4" />, group: "main" },
  { id: "watchlist", label: "Watchlist", icon: <Star className="w-4 h-4" />, group: "settings" },
  { id: "publications", label: "Publications", icon: <Rss className="w-4 h-4" />, group: "settings" },
];

export default function Sidebar({ active, onNavigate, reportDate, watchlistCount, publicationsCount }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const mainItems = navItems.filter((n) => n.group === "main");
  const settingsItems = navItems.filter((n) => n.group === "settings");

  const renderNav = (closeMobile?: () => void) => (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="p-4 pb-3 border-b border-sidebar-border">
        <div className="flex items-center gap-2 mb-2">
          <Activity className="w-5 h-5 text-primary" />
          <span className="text-sm font-bold tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
            Market Pulse
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <Clock className="w-3 h-3" />
          <span>{reportDate}</span>
        </div>
      </div>

      {/* Main nav */}
      <div className="flex-1 py-3 px-2 space-y-0.5">
        <div className="px-2 mb-2">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60" style={{ fontFamily: "var(--font-heading)" }}>
            Dashboard
          </span>
        </div>
        {mainItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              onNavigate(item.id);
              closeMobile?.();
            }}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-all duration-150 ${
              active === item.id
                ? "bg-sidebar-primary text-sidebar-primary-foreground font-semibold"
                : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}

        {/* Settings separator */}
        <div className="pt-4 pb-1 px-2">
          <div className="flex items-center gap-1.5">
            <Settings className="w-3 h-3 text-muted-foreground/50" />
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60" style={{ fontFamily: "var(--font-heading)" }}>
              Settings
            </span>
          </div>
        </div>
        {settingsItems.map((item) => {
          const count = item.id === "watchlist" ? watchlistCount : item.id === "publications" ? publicationsCount : 0;
          return (
            <button
              key={item.id}
              onClick={() => {
                onNavigate(item.id);
                closeMobile?.();
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-all duration-150 ${
                active === item.id
                  ? "bg-sidebar-primary text-sidebar-primary-foreground font-semibold"
                  : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
              }`}
            >
              <div className="flex items-center gap-2.5">
                {item.icon}
                <span>{item.label}</span>
              </div>
              {count > 0 && (
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                  active === item.id
                    ? "bg-white/20 text-white"
                    : "bg-muted text-muted-foreground"
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="p-4 pt-2 border-t border-sidebar-border">
        <div className="text-[10px] text-muted-foreground/50 leading-relaxed">
          <span className="font-semibold text-muted-foreground/70" style={{ fontFamily: "var(--font-heading)" }}>
            Daily Intelligence
          </span>
          <br />
          {watchlistCount} tickers · {publicationsCount} feeds
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-56 shrink-0 bg-sidebar border-r border-sidebar-border h-screen sticky top-0 overflow-y-auto">
        {renderNav()}
      </aside>

      {/* Mobile hamburger */}
      <div className="lg:hidden fixed top-3 left-3 z-50">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-md bg-card border border-border text-foreground hover:bg-muted transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-50 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 w-64 bg-sidebar border-r border-sidebar-border z-50 lg:hidden overflow-y-auto"
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-3 right-3 p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              {renderNav(() => setMobileOpen(false))}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
