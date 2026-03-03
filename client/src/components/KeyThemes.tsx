/**
 * Key Themes — Obsidian Command Design
 * Horizontal scrollable cards showing today's key market themes.
 */
import { motion } from "framer-motion";
import { Globe, Zap, Cpu, TrendingUp, DollarSign } from "lucide-react";
import type { KeyTheme } from "@/lib/types";

const iconMap: Record<string, React.ReactNode> = {
  globe: <Globe className="w-5 h-5" />,
  zap: <Zap className="w-5 h-5" />,
  cpu: <Cpu className="w-5 h-5" />,
  trending: <TrendingUp className="w-5 h-5" />,
  dollar: <DollarSign className="w-5 h-5" />,
};

interface Props {
  themes: KeyTheme[];
}

export default function KeyThemes({ themes }: Props) {
  return (
    <div className="mb-8">
      <div className="section-label">Key Themes</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {themes.map((theme, i) => (
          <motion.div
            key={theme.title}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.4, ease: "easeOut" }}
            className="dash-card group"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-md bg-primary/10 text-primary shrink-0 group-hover:bg-primary/20 transition-colors">
                {iconMap[theme.icon] || <Zap className="w-5 h-5" />}
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-foreground leading-tight mb-1" style={{ fontFamily: "var(--font-heading)" }}>
                  {theme.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {theme.description}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
