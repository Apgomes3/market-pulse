/**
 * Post Summaries — Obsidian Command Design
 * Organized by category with expandable cards and external links.
 */
import { motion } from "framer-motion";
import { BookOpen, ExternalLink, ChevronDown } from "lucide-react";
import { useState } from "react";
import type { PostCategory } from "@/lib/types";

interface Props {
  categories: PostCategory[];
}

const categoryColors: Record<string, string> = {
  "Investing/Stocks": "text-bull border-bull/20 bg-bull/5",
  "Tech & AI": "text-primary border-primary/20 bg-primary/5",
  "General/Other": "text-buzz-high border-buzz-high/20 bg-buzz-high/5",
};

export default function PostSummaries({ categories }: Props) {
  const [expandedPost, setExpandedPost] = useState<string | null>(null);

  return (
    <div className="dash-card">
      <div className="section-label flex items-center gap-2">
        <BookOpen className="w-3.5 h-3.5" />
        Substack Summaries
      </div>

      <div className="space-y-6">
        {categories.map((cat, ci) => (
          <motion.div
            key={cat.category}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: ci * 0.1, duration: 0.4 }}
          >
            {/* Category header */}
            <div className="flex items-center gap-2 mb-3">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border ${categoryColors[cat.category] || "text-muted-foreground border-border bg-muted/30"}`}
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {cat.category}
              </span>
              <span className="text-[10px] text-muted-foreground">{cat.posts.length} posts</span>
            </div>

            {/* Posts */}
            <div className="space-y-2">
              {cat.posts.map((post, pi) => {
                const isExpanded = expandedPost === `${ci}-${pi}`;
                return (
                  <motion.div
                    key={post.url}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: ci * 0.1 + pi * 0.05, duration: 0.3 }}
                    className="border border-border/50 rounded-md overflow-hidden hover:border-border transition-colors"
                  >
                    <button
                      onClick={() => setExpandedPost(isExpanded ? null : `${ci}-${pi}`)}
                      className="w-full text-left p-3 flex items-start gap-3 group"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] text-muted-foreground font-medium">{post.publication}</span>
                          <span className="text-[10px] text-muted-foreground/50">·</span>
                          <span className="text-[10px] text-muted-foreground">{post.date}</span>
                        </div>
                        <h4 className="text-sm font-medium text-foreground leading-snug group-hover:text-primary transition-colors" style={{ fontFamily: "var(--font-heading)" }}>
                          {post.title}
                        </h4>
                        {!isExpanded && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                            {post.summary}
                          </p>
                        )}
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 text-muted-foreground shrink-0 mt-1 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                      />
                    </button>

                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        transition={{ duration: 0.2 }}
                        className="px-3 pb-3"
                      >
                        <p className="text-xs text-foreground/80 leading-relaxed mb-3">
                          {post.summary}
                        </p>
                        <a
                          href={post.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors"
                        >
                          Read on Substack
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
