/**
 * Substack Publications Manager — Obsidian Command Design
 * Manage tracked Substack publications with add/remove capabilities.
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Rss } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { SubstackPublication } from "@/lib/types";

interface Props {
  publications: SubstackPublication[];
  onPublicationsChange: (newPublications: SubstackPublication[]) => void;
}

export default function SubstackPublications({ publications, onPublicationsChange }: Props) {
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newUrl, setNewUrl] = useState("");

  const handleAddPublication = () => {
    const name = newName.trim();
    const url = newUrl.trim();

    if (name && url) {
      const updated = [...publications, { name, url }];
      onPublicationsChange(updated);
      setNewName("");
      setNewUrl("");
      setIsAdding(false);
    }
  };

  const handleRemovePublication = (name: string) => {
    const updated = publications.filter((p) => p.name !== name);
    onPublicationsChange(updated);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddPublication();
    } else if (e.key === "Escape") {
      setIsAdding(false);
      setNewName("");
      setNewUrl("");
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
            <Rss className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
              Publications
            </h3>
            <span className="text-xs font-mono text-muted-foreground bg-muted/50 px-2 py-1 rounded">
              {publications.length}
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

        {/* Add publication form */}
        <AnimatePresence>
          {isAdding && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="mb-4 space-y-2 p-3 rounded-md bg-muted/30 border border-border/50"
            >
              <Input
                placeholder="Publication name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyPress={handleKeyPress}
                className="text-sm"
              />
              <Input
                placeholder="URL (e.g., https://example.substack.com)"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                onKeyPress={handleKeyPress}
                className="text-sm"
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleAddPublication} variant="default">
                  Add
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setIsAdding(false);
                    setNewName("");
                    setNewUrl("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Publications list */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          <AnimatePresence mode="popLayout">
            {publications.map((pub, idx) => (
              <motion.div
                key={pub.name}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ delay: idx * 0.02 }}
                className="flex items-center justify-between p-2.5 rounded-md bg-card/50 border border-border/50 hover:border-primary/50 hover:bg-card transition-all duration-150 group"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {pub.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {pub.url}
                  </p>
                </div>
                <button
                  onClick={() => handleRemovePublication(pub.name)}
                  className="ml-2 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-150 hover:bg-destructive/20 text-destructive/70 hover:text-destructive flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {publications.length === 0 && (
          <div className="text-center py-6">
            <p className="text-sm text-muted-foreground">No publications tracked</p>
            <p className="text-xs text-muted-foreground mt-1">Add your first publication to get started</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
