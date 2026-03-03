/**
 * Watchlist Manager — Obsidian Command Design
 * Manage watched stock tickers with add/remove capabilities.
 * Persists to localStorage as backup.
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Props {
  watchlist: string[];
  onWatchlistChange: (newWatchlist: string[]) => void;
}

export default function WatchlistManager({ watchlist, onWatchlistChange }: Props) {
  const [inputValue, setInputValue] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const handleAddTicker = () => {
    const ticker = inputValue.toUpperCase().trim();
    if (ticker && !watchlist.includes(ticker)) {
      const updated = [...watchlist, ticker];
      onWatchlistChange(updated);
      localStorage.setItem("market_pulse_watchlist", JSON.stringify(updated));
      setInputValue("");
      setIsAdding(false);
    }
  };

  const handleRemoveTicker = (ticker: string) => {
    const updated = watchlist.filter((t) => t !== ticker);
    onWatchlistChange(updated);
    localStorage.setItem("market_pulse_watchlist", JSON.stringify(updated));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddTicker();
    } else if (e.key === "Escape") {
      setIsAdding(false);
      setInputValue("");
    }
  };

  return (
    <div className="dash-card">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
              Watchlist
            </h3>
            <span className="text-xs font-mono text-muted-foreground bg-muted/50 px-2 py-1 rounded">
              {watchlist.length} tickers
            </span>
          </div>
          {!isAdding && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsAdding(true)}
              className="gap-1"
            >
              <Plus className="w-4 h-4" />
              Add
            </Button>
          )}
        </div>

        {/* Add ticker input */}
        <AnimatePresence>
          {isAdding && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="mb-4 flex gap-2"
            >
              <Input
                placeholder="Enter ticker (e.g., AAPL)"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                autoFocus
                className="font-mono text-sm uppercase"
              />
              <Button size="sm" onClick={handleAddTicker} variant="default">
                Add
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setIsAdding(false);
                  setInputValue("");
                }}
              >
                Cancel
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Watchlist grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          <AnimatePresence mode="popLayout">
            {watchlist.map((ticker, idx) => (
              <motion.div
                key={ticker}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: idx * 0.02 }}
                className="relative group"
              >
                <div className="flex items-center justify-between px-3 py-2 rounded-md bg-card border border-border/50 hover:border-primary/50 transition-all duration-150">
                  <span className="font-mono text-sm font-semibold text-foreground">
                    {ticker}
                  </span>
                  <button
                    onClick={() => handleRemoveTicker(ticker)}
                    className="ml-2 p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-150 hover:bg-destructive/20 text-destructive/70 hover:text-destructive"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {watchlist.length === 0 && (
          <div className="text-center py-6">
            <p className="text-sm text-muted-foreground">No tickers in watchlist</p>
            <p className="text-xs text-muted-foreground mt-1">Add your first ticker to get started</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
