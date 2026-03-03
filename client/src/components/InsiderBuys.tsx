/**
 * Insider Buys Table — Obsidian Command Design
 * Dense data table with monospaced numbers, sorted by dollar value.
 * Background uses the network graph pattern image.
 */
import { motion } from "framer-motion";
import { ShieldCheck, ExternalLink } from "lucide-react";
import { formatCurrency, formatShares, formatPrice } from "@/lib/format";
import type { InsiderBuy } from "@/lib/types";

interface Props {
  buys: InsiderBuy[];
  note: string;
  signals: string;
}

export default function InsiderBuys({ buys, note, signals }: Props) {
  return (
    <div className="dash-card overflow-hidden">
      <div className="section-label flex items-center gap-2">
        <ShieldCheck className="w-3.5 h-3.5" />
        Russell 3000 Insider Buys
        <span className="text-[10px] font-normal normal-case tracking-normal text-muted-foreground ml-auto">
          SEC EDGAR Form 4
        </span>
      </div>

      {/* Notable signals callout */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="mb-4 p-3 rounded-md bg-buzz-high/5 border border-buzz-high/15 text-xs text-foreground/80 leading-relaxed"
      >
        <span className="font-semibold text-buzz-high">Notable: </span>
        {signals}
      </motion.div>

      {/* Table */}
      <div className="overflow-x-auto -mx-5 px-5">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2.5 pr-3 font-semibold text-muted-foreground uppercase tracking-wider" style={{ fontFamily: "var(--font-heading)", fontSize: "10px" }}>Ticker</th>
              <th className="text-left py-2.5 pr-3 font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell" style={{ fontFamily: "var(--font-heading)", fontSize: "10px" }}>Insider</th>
              <th className="text-left py-2.5 pr-3 font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell" style={{ fontFamily: "var(--font-heading)", fontSize: "10px" }}>Title</th>
              <th className="text-right py-2.5 pr-3 font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell" style={{ fontFamily: "var(--font-heading)", fontSize: "10px" }}>Shares</th>
              <th className="text-right py-2.5 pr-3 font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell" style={{ fontFamily: "var(--font-heading)", fontSize: "10px" }}>Price</th>
              <th className="text-right py-2.5 pr-3 font-semibold text-muted-foreground uppercase tracking-wider" style={{ fontFamily: "var(--font-heading)", fontSize: "10px" }}>Total Value</th>
              <th className="text-right py-2.5 font-semibold text-muted-foreground uppercase tracking-wider" style={{ fontFamily: "var(--font-heading)", fontSize: "10px" }}>Date</th>
            </tr>
          </thead>
          <tbody>
            {buys.map((buy, i) => (
              <motion.tr
                key={`${buy.ticker}-${buy.insider}-${i}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 + i * 0.03, duration: 0.3 }}
                className="border-b border-border/50 hover:bg-surface-hover/50 transition-colors"
              >
                <td className="py-2.5 pr-3">
                  <span className="font-mono font-semibold text-primary">${buy.ticker}</span>
                  <span className="block text-[10px] text-muted-foreground sm:hidden mt-0.5">{buy.insider}</span>
                </td>
                <td className="py-2.5 pr-3 text-foreground/80 hidden sm:table-cell">{buy.insider}</td>
                <td className="py-2.5 pr-3 text-muted-foreground hidden md:table-cell">{buy.title}</td>
                <td className="py-2.5 pr-3 text-right font-mono tabular-nums text-foreground/70 hidden lg:table-cell">{formatShares(buy.shares)}</td>
                <td className="py-2.5 pr-3 text-right font-mono tabular-nums text-foreground/70 hidden lg:table-cell">{formatPrice(buy.price)}</td>
                <td className="py-2.5 pr-3 text-right font-mono tabular-nums font-semibold text-foreground">
                  {formatCurrency(buy.totalValue)}
                </td>
                <td className="py-2.5 text-right text-muted-foreground">{buy.date}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 text-[10px] text-muted-foreground leading-relaxed">
        {note}
      </div>
    </div>
  );
}
