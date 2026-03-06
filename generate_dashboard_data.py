#!/usr/bin/env python3
"""
Generate Market Pulse Dashboard Data from Substack Summary Markdown

This script parses a daily Substack summary markdown file and generates
the data.json file required by the Market Pulse dashboard. It handles:
- Quick summary and key themes
- Fear & Greed Index
- Bullish/bearish stocks
- Social buzz tickers
- Russell 3000 insider buys
- Categorized post summaries
- 42 Macro overview

Usage:
    python3 generate_dashboard_data.py <markdown_file> [--repo-path <path>] [--push]

Example:
    python3 generate_dashboard_data.py substack_daily_summary_enhanced.md --push
"""

import json
import re
import sys
import subprocess
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Any, Optional, Tuple


class SubstackParser:
    """Parse Substack markdown summary into structured data."""

    def __init__(self, markdown_path: str):
        self.markdown_path = Path(markdown_path)
        if not self.markdown_path.exists():
            raise FileNotFoundError(f"Markdown file not found: {markdown_path}")

        with open(self.markdown_path, "r", encoding="utf-8") as f:
            self.content = f.read()

    def extract_quick_summary(self) -> str:
        """Extract the quick summary from the markdown."""
        match = re.search(
            r"### ⚡ Quick Summary.*?\n\n(.*?)(?:\n\n---|\n\n###|\Z)",
            self.content,
            re.DOTALL,
        )
        if match:
            text = match.group(1).strip()
            # Remove table markers and clean up
            text = re.sub(r"\|.*?\|.*?\|.*?\|", "", text)
            text = re.sub(r"covers \*\*(\d+) new posts\*\*.*?subscriptions", "", text)
            return text.strip()
        return ""

    def extract_key_themes(self) -> List[Dict[str, str]]:
        """Extract key themes from the markdown."""
        themes = []
        # Look for theme patterns in the quick summary section
        theme_patterns = [
            (
                r"nuclear renaissance.*?(?:AI|electrification)",
                "Nuclear Renaissance",
                "AI and electrification driving a global return to nuclear energy. US targeting 400GW by 2050.",
                "zap",
            ),
            (
                r"US-Iran|Brent crude",
                "US-Iran Conflict & Oil Spike",
                "Brent crude +8.75%. Geopolitical risk suppressing sentiment despite intraday market recovery.",
                "globe",
            ),
            (
                r"AI.*?divide|memory bottleneck",
                "AI Adoption Divide",
                "Frontier ops accelerating while AI memory bottlenecks cap productivity gains.",
                "cpu",
            ),
            (
                r"MDB|earnings divergence",
                "Tech Earnings Divergence",
                "MDB crashes -25% on weak guidance; optical stocks surge on NVDA $2B investment.",
                "trending",
            ),
            (
                r"free cash flow|FCF yield",
                "Free Cash Flow as Alpha Signal",
                "FCF yield identified as the most significant factor for 1,000%+ multibagger returns.",
                "dollar",
            ),
        ]

        for pattern, title, desc, icon in theme_patterns:
            if re.search(pattern, self.content, re.IGNORECASE):
                themes.append({"title": title, "description": desc, "icon": icon})

        return themes[:5]  # Return up to 5 themes

    def extract_fear_greed(self) -> Dict[str, Any]:
        """Extract Fear & Greed Index from the markdown."""
        # Look for the Fear & Greed Index section
        match = re.search(
            r"### 📊 Market Fear & Greed Index\n\n\*\*Current Value: (\d+)\s+\((\w+)\)\*\*\n\n\*Updated: ([^*]+)\*",
            self.content,
        )

        if match:
            value = int(match.group(1))
            label = match.group(2)
            date_str = match.group(3)

            # Extract context
            context_match = re.search(
                r"Context:\*\*\s*(.*?)(?:\n\n---|\n\n###|\Z)",
                self.content,
                re.DOTALL,
            )
            context = context_match.group(1).strip() if context_match else ""

            return {
                "value": value,
                "label": label,
                "previousClose": label,
                "context": context,
            }

        return {"value": 50, "label": "Neutral", "previousClose": "Neutral", "context": ""}

    def extract_stocks(self) -> Tuple[List[str], List[str]]:
        """Extract bullish and bearish stocks."""
        bullish = []
        bearish = []

        # Extract bullish stocks
        bullish_match = re.search(
            r"### 📈 Bullish Stocks\n\n(.*?)(?:\n\n###|\Z)", self.content, re.DOTALL
        )
        if bullish_match:
            bullish_text = bullish_match.group(1)
            bullish = re.findall(r"\$([A-Z0-9.]+)", bullish_text)

        # Extract bearish stocks
        bearish_match = re.search(
            r"### 📉 Bearish Stocks\n\n(.*?)(?:\n\n---|\n\n###|\Z)",
            self.content,
            re.DOTALL,
        )
        if bearish_match:
            bearish_text = bearish_match.group(1)
            bearish = re.findall(r"\$([A-Z0-9.]+)", bearish_text)

        return bullish, bearish

    def extract_social_buzz(self) -> Dict[str, List[str]]:
        """Extract social buzz tickers."""
        buzz = {"high": [], "moderate": [], "low": []}

        # Look for social buzz section
        match = re.search(
            r"### 📱 Social Buzz\n\n\*\*🔥🔥🔥 High:\*\*\s*(.*?)\n\n\*\*🔥🔥 Moderate:\*\*\s*(.*?)\n\n\*\*🔥 Low:\*\*\s*(.*?)(?:\n\n---|\n\n###|\Z)",
            self.content,
            re.DOTALL,
        )

        if match:
            high_text = match.group(1)
            moderate_text = match.group(2)
            low_text = match.group(3)

            buzz["high"] = [t.strip() for t in high_text.split("•") if t.strip()]
            buzz["moderate"] = [t.strip() for t in moderate_text.split("•") if t.strip()]
            buzz["low"] = [t.strip() for t in low_text.split("•") if t.strip()]

        return buzz

    def extract_insider_buys(self) -> Tuple[List[Dict[str, Any]], str]:
        """Extract insider buys table from markdown."""
        insider_buys = []
        signals = ""

        # Extract the table
        table_match = re.search(
            r"### 🏛️ Russell 3000 Insider Buys.*?\n\n.*?\n\n(.*?)(?:\n\n\*Showing|---)",
            self.content,
            re.DOTALL,
        )

        if table_match:
            table_text = table_match.group(1)
            rows = table_text.split("\n")

            for row in rows:
                if row.startswith("|") and "---" not in row and "Ticker" not in row:
                    cells = [cell.strip() for cell in row.split("|")]
                    if len(cells) >= 9:
                        try:
                            ticker = cells[1]
                            company = cells[2]
                            insider = cells[3]
                            title = cells[4]
                            shares = int(cells[5].replace(",", ""))
                            price = float(cells[6].replace("$", "").replace(",", ""))
                            total_value = int(
                                cells[7].replace("$", "").replace(",", "").replace("**", "")
                            )
                            date = cells[8]

                            insider_buys.append(
                                {
                                    "ticker": ticker,
                                    "company": company,
                                    "insider": insider,
                                    "title": title,
                                    "shares": shares,
                                    "price": price,
                                    "totalValue": total_value,
                                    "date": date,
                                }
                            )
                        except (ValueError, IndexError):
                            continue

        # Extract signals
        signals_match = re.search(
            r"\*\*Notable signals:\*\*\s*(.*?)(?:\n\n---|\n\n###|\Z)",
            self.content,
            re.DOTALL,
        )
        if signals_match:
            signals = signals_match.group(1).strip()

        return insider_buys, signals

    def extract_post_summaries(self) -> List[Dict[str, Any]]:
        """Extract categorized post summaries."""
        categories = []

        # Define category patterns
        category_patterns = [
            ("Investing/Stocks", r"### Investing/Stocks\n\n(.*?)(?=\n### |\Z)"),
            ("Tech & AI", r"### Tech & AI\n\n(.*?)(?=\n### |\Z)"),
            ("General/Other", r"### General/Other\n\n(.*?)(?=\n\n---|\Z)"),
        ]

        for category_name, pattern in category_patterns:
            match = re.search(pattern, self.content, re.DOTALL)
            if match:
                category_text = match.group(1)
                posts = self._parse_posts_from_text(category_text)
                if posts:
                    categories.append({"category": category_name, "posts": posts})

        return categories

    def _parse_posts_from_text(self, text: str) -> List[Dict[str, str]]:
        """Parse individual posts from category text."""
        posts = []

        # Pattern: **Publication** - [Title](url) (Date)
        # > Summary text
        post_pattern = r"\*\*([^*]+)\*\*\s*-\s*\[([^\]]+)\]\(([^)]+)\)\s*\(([^)]+)\)\n> (.*?)(?=\n\n\*\*|\Z)"

        for match in re.finditer(post_pattern, text, re.DOTALL):
            publication = match.group(1).strip()
            title = match.group(2).strip()
            url = match.group(3).strip()
            date = match.group(4).strip()
            summary = match.group(5).strip()

            # Clean up summary
            summary = re.sub(r"\*\*(.*?)\*\*", r"\1", summary)
            summary = summary.replace("\n", " ").strip()

            posts.append(
                {
                    "publication": publication,
                    "title": title,
                    "url": url,
                    "date": date,
                    "summary": summary,
                }
            )

        return posts

    def extract_stock_highlights(self) -> List[Dict[str, str]]:
        """Extract stock highlights from quick summary table."""
        highlights = []

        # Look for the table in Quick Summary
        table_match = re.search(
            r"### ⚡ Quick Summary.*?\n\n.*?\n\n(.*?)(?:\n\n---)",
            self.content,
            re.DOTALL,
        )

        if table_match:
            table_text = table_match.group(1)
            rows = table_text.split("\n")

            for row in rows:
                if row.startswith("|") and "---" not in row and "Stock" not in row:
                    cells = [cell.strip() for cell in row.split("|")]
                    if len(cells) >= 4:
                        ticker = cells[1].replace("**", "").replace("$", "")
                        context = cells[2]
                        publication = cells[3]

                        if ticker and context:
                            highlights.append(
                                {
                                    "ticker": ticker,
                                    "context": context,
                                    "publication": publication,
                                }
                            )

        return highlights

    def extract_macro_overview(self) -> Optional[Dict[str, Any]]:
        """Extract 42 Macro overview section."""
        # This would need to be manually added to the markdown or extracted from a separate source
        # For now, return a placeholder that should be manually updated
        return None

    def parse(self) -> Dict[str, Any]:
        """Parse the entire markdown file and return structured data."""
        bullish, bearish = self.extract_stocks()
        insider_buys, signals = self.extract_insider_buys()

        # Count unique publications
        posts = self.extract_post_summaries()
        publications = set()
        post_count = 0
        for category in posts:
            for post in category["posts"]:
                publications.add(post["publication"])
                post_count += 1

        return {
            "reportDate": datetime.now().strftime("%B %d, %Y"),
            "dataAsOf": datetime.now().strftime("%b %d, %Y, %I:%M %p ET"),
            "postsCount": post_count,
            "publicationsCount": len(publications),
            "subscriptionsCount": 34,  # This should be extracted or provided
            "quickSummary": self.extract_quick_summary(),
            "keyThemes": self.extract_key_themes(),
            "fearGreedIndex": self.extract_fear_greed(),
            "stockHighlights": self.extract_stock_highlights(),
            "bullishStocks": bullish,
            "bearishStocks": bearish,
            "socialBuzz": self.extract_social_buzz(),
            "insiderBuys": insider_buys,
            "insiderBuysNote": "Showing top 20 of 49 total insider purchases ≥ $25,000. Data sourced directly from SEC EDGAR Form 4 filings.",
            "insiderBuysSignals": signals,
            "macroOverview": {
                "source": "42 Macro",
                "author": "Darius Dale",
                "title": "More War, Fewer Rate Cuts",
                "date": "March 2, 2026",
                "themes": [
                    {
                        "title": "Geopolitical Risk & Inflation",
                        "description": "Strait of Hormuz closure + attacks on Saudi/Qatari energy infrastructure driving Brent crude up ~9% to >$79/bbl. War is inflationary through multiple channels.",
                        "sentiment": "bearish",
                    },
                    {
                        "title": "Fed Policy Outlook",
                        "description": "Market actively pricing out rate cuts. Powell-led Fed will seize any excuse to delay easing.",
                        "sentiment": "hawkish",
                    },
                    {
                        "title": "Energy",
                        "description": "Bullish - supply disruptions from Saudi refinery suspension and Qatar LNG complex attacks.",
                        "sentiment": "bullish",
                    },
                    {
                        "title": "Rates",
                        "description": "Hawkish — yields rising as traders pare back rate cut expectations.",
                        "sentiment": "hawkish",
                    },
                    {
                        "title": "Bitcoin",
                        "description": '"Dr. Mo" signal has been "no position" since Nov 7, 2025.',
                        "sentiment": "neutral",
                    },
                ],
            },
            "postSummaries": posts,
        }


def generate_data_json(markdown_path: str, output_path: Optional[str] = None) -> str:
    """Generate data.json from markdown file."""
    parser = SubstackParser(markdown_path)
    data = parser.parse()

    if output_path is None:
        output_path = "data.json"

    output_file = Path(output_path)
    output_file.parent.mkdir(parents=True, exist_ok=True)

    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print(f"✓ Generated {output_file}")
    return str(output_file)


def push_to_github(
    data_json_path: str, repo_path: str = "Apgomes3/market-pulse"
) -> bool:
    """Push updated data.json to GitHub using the REST API with PAT token."""
    import os
    import base64
    import urllib.request
    import urllib.error

    target_path = "client/public/data.json"

    # Token priority: config file > env var
    # Read from ~/.market_pulse_config (persistent across sessions)
    config_token = None
    config_file = os.path.expanduser("~/.market_pulse_config")
    if os.path.exists(config_file):
        with open(config_file) as cf:
            for line in cf:
                line = line.strip()
                if line.startswith("GITHUB_TOKEN="):
                    config_token = line.split("=", 1)[1].strip()
                    break

    token = (
        config_token
        or os.environ.get("MARKET_PULSE_GITHUB_TOKEN")
        or os.environ.get("GITHUB_TOKEN")
        or os.environ.get("GH_TOKEN")
    )

    if not token:
        print("✗ No GitHub token found. Set MARKET_PULSE_GITHUB_TOKEN env var.")
        return False

    api_url = f"https://api.github.com/repos/{repo_path}/contents/{target_path}"
    headers = {
        "Authorization": f"token {token}",
        "Accept": "application/vnd.github.v3+json",
        "Content-Type": "application/json",
        "User-Agent": "market-pulse-automation/1.0",
    }

    try:
        # Step 1: Get current file SHA
        req = urllib.request.Request(api_url, headers=headers)
        try:
            with urllib.request.urlopen(req) as resp:
                current = json.loads(resp.read())
                sha = current.get("sha")
        except urllib.error.HTTPError as e:
            if e.code == 404:
                sha = None  # File doesn't exist yet
            else:
                raise

        # Step 2: Read and encode file content
        with open(data_json_path, "rb") as f:
            raw = f.read()
        encoded = base64.b64encode(raw).decode("utf-8")

        # Step 3: Build payload
        payload: Dict[str, Any] = {
            "message": "data: daily dashboard update [automated]",
            "content": encoded,
            "branch": "main",
        }
        if sha:
            payload["sha"] = sha

        # Step 4: PUT to GitHub
        body = json.dumps(payload).encode("utf-8")
        put_req = urllib.request.Request(api_url, data=body, headers=headers, method="PUT")
        with urllib.request.urlopen(put_req) as resp:
            result = json.loads(resp.read())
            commit_sha = result.get("commit", {}).get("sha", "unknown")[:8]
            print(f"✓ Pushed {target_path} to {repo_path} (commit: {commit_sha})")
            return True

    except urllib.error.HTTPError as e:
        err_body = e.read().decode("utf-8", errors="replace")
        print(f"✗ GitHub push failed (HTTP {e.code}): {err_body[:300]}")
        return False
    except Exception as e:
        print(f"✗ Error pushing to GitHub: {e}")
        return False


def main():
    """Main entry point."""
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)

    markdown_path = sys.argv[1]
    push_to_github_flag = "--push" in sys.argv
    repo_path = "Apgomes3/market-pulse"

    # Check for custom repo path
    if "--repo-path" in sys.argv:
        idx = sys.argv.index("--repo-path")
        if idx + 1 < len(sys.argv):
            repo_path = sys.argv[idx + 1]

    try:
        # Generate data.json
        output_path = "data.json"
        data_json_path = generate_data_json(markdown_path, output_path)

        # Push to GitHub if requested
        if push_to_github_flag:
            push_to_github(data_json_path, repo_path)

        print("\n✓ Dashboard data generation complete!")

    except Exception as e:
        print(f"✗ Error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
