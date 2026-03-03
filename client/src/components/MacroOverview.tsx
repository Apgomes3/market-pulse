/**
 * Macro Overview — Obsidian Command Design
 * Displays daily macro summary from 42 Macro with sentiment-colored theme cards.
 */
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, AlertCircle, DollarSign } from "lucide-react";
import type { MacroOverview as MacroOverviewType } from "@/lib/types";

interface Props {
  data: MacroOverviewType;
}

const sentimentConfig = {
  bullish: {
    icon: <TrendingUp className="w-4 h-4" />,
    color: "text-bull",
    bg: "bg-bull/10",
    border: "border-bull/20",
    hoverBorder: "hover:border-bull/40",
  },
  bearish: {
    icon: <TrendingDown className="w-4 h-4" />,
    color: "text-bear",
    bg: "bg-bear/10",
    border: "border-bear/20",
    hoverBorder: "hover:border-bear/40",
  },
  hawkish: {
    icon: <AlertCircle className="w-4 h-4" />,
    color: "text-buzz-high",
    bg: "bg-buzz-high/10",
    border: "border-buzz-high/20",
    hoverBorder: "hover:border-buzz-high/40",
  },
  neutral: {
    icon: <DollarSign className="w-4 h-4" />,
    color: "text-muted-foreground",
    bg: "bg-muted/10",
    border: "border-muted/20",
    hoverBorder: "hover:border-muted/40",
  },
};

export default function MacroOverview({ data }: Props) {
  return (
    <div className="dash-card">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Header */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider text-primary bg-primary/10 border border-primary/20" style={{ fontFamily: "var(--font-heading)" }}>
              {data.source}
            </span>
            <span className="text-[10px] text-muted-foreground">by {data.author}</span>
          </div>
          <h3 className="text-lg font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
            {data.title}
          </h3>
          <p className="text-xs text-muted-foreground mt-1">{data.date}</p>
        </div>

        {/* Themes grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {data.themes.map((theme, i) => {
            const config = sentimentConfig[theme.sentiment];
            return (
              <motion.div
                key={theme.title}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + i * 0.05, duration: 0.3 }}
                className={`p-3 rounded-md border transition-all duration-150 ${config.bg} ${config.border} ${config.hoverBorder}`}
              >
                <div className="flex items-start gap-2.5">
                  <div className={`${config.color} shrink-0 mt-0.5`}>
                    {config.icon}
                  </div>
                  <div className="min-w-0">
                    <h4 className={`text-sm font-semibold ${config.color} leading-snug mb-1`} style={{ fontFamily: "var(--font-heading)" }}>
                      {theme.title}
                    </h4>
                    <p className="text-xs text-foreground/70 leading-relaxed">
                      {theme.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
