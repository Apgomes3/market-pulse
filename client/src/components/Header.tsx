/**
 * Header — Obsidian Command Design
 * Hero section with report date, stats bar, and background image.
 */
import { motion } from "framer-motion";
import { Activity, Newspaper, Rss, Clock } from "lucide-react";
import type { DashboardData } from "@/lib/types";

interface Props {
  data: DashboardData;
}

const HERO_BG = "https://d2xsxph8kpxj0f.cloudfront.net/116015656/ar35e7MczEhRk5mYUvPnhD/hero-bg-Du3iEMXb6VGcFqtvywxtKS.webp";

export default function Header({ data }: Props) {
  return (
    <header className="relative overflow-hidden border-b border-border">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-30"
        style={{ backgroundImage: `url(${HERO_BG})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/40" />

      <div className="relative container py-8 md:py-12">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Brand */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-6 h-6 text-primary" />
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
                Market Pulse
              </h1>
            </div>
            <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider text-primary bg-primary/10 border border-primary/20" style={{ fontFamily: "var(--font-heading)" }}>
              Daily Brief
            </span>
          </div>

          {/* Date */}
          <div className="flex items-center gap-2 mb-5">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <time className="text-lg md:text-xl font-semibold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
              {data.reportDate}
            </time>
            <span className="text-xs text-muted-foreground ml-2">
              as of {data.dataAsOf}
            </span>
          </div>

          {/* Quick summary */}
          <p className="text-sm text-foreground/70 leading-relaxed max-w-3xl mb-6">
            {data.quickSummary}
          </p>

          {/* Stats bar */}
          <div className="flex flex-wrap gap-4 md:gap-6">
            {[
              { icon: <Newspaper className="w-4 h-4" />, label: "Posts", value: data.postsCount },
              { icon: <Rss className="w-4 h-4" />, label: "Publications", value: data.publicationsCount },
              { icon: <Activity className="w-4 h-4" />, label: "Subscriptions", value: data.subscriptionsCount },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1, duration: 0.3 }}
                className="flex items-center gap-2 px-3 py-2 rounded-md bg-card/50 border border-border/50 backdrop-blur-sm"
              >
                <span className="text-muted-foreground">{stat.icon}</span>
                <span className="font-mono text-sm font-semibold tabular-nums text-foreground">{stat.value}</span>
                <span className="text-xs text-muted-foreground">{stat.label}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </header>
  );
}
