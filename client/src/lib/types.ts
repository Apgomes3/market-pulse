export interface DashboardData {
  reportDate: string;
  dataAsOf: string;
  postsCount: number;
  publicationsCount: number;
  subscriptionsCount: string;
  quickSummary: string;
  keyThemes: KeyTheme[];
  fearGreedIndex: FearGreedIndex;
  stockHighlights: StockHighlight[];
  bullishStocks: string[];
  bearishStocks: string[];
  socialBuzz: SocialBuzz;
  insiderBuys: InsiderBuy[];
  insiderBuysNote: string;
  insiderBuysSignals: string;
  macroOverview: MacroOverview;
  postSummaries: PostCategory[];
  watchlist: string[];
  substackPublications: SubstackPublication[];
  tickerIntel: Record<string, TickerIntel>;
}

export interface KeyTheme {
  title: string;
  description: string;
  icon: string;
}

export interface FearGreedIndex {
  value: number;
  label: string;
  previousClose: string;
  context: string;
}

export interface StockHighlight {
  ticker: string;
  context: string;
  publication: string;
}

export interface SocialBuzz {
  high: string[];
  moderate: string[];
  low: string[];
}

export interface InsiderBuy {
  ticker: string;
  company: string;
  insider: string;
  title: string;
  shares: number;
  price: number;
  totalValue: number;
  date: string;
}

export interface PostCategory {
  category: string;
  posts: Post[];
}

export interface Post {
  publication: string;
  title: string;
  url: string;
  date: string;
  summary: string;
}

export interface MacroOverview {
  source: string;
  author: string;
  title: string;
  date: string;
  themes: MacroTheme[];
}

export interface MacroTheme {
  title: string;
  description: string;
  sentiment: "bullish" | "bearish" | "hawkish" | "neutral";
}

export interface SubstackPublication {
  name: string;
  url: string;
}

export interface TickerIntel {
  substackMentions: SubstackMention[];
  seekingAlpha: SeekingAlphaMention[];
  socialBuzz: SocialBuzzTicker;
  corporateFilings: CorporateFiling[];
  insiderBuys: TickerInsiderBuy[];
}

export interface SubstackMention {
  publication: string;
  title: string;
  context: string;
  sentiment: "bullish" | "bearish" | "neutral";
  date: string;
}

export interface SeekingAlphaMention {
  title: string;
  rating: string;
  date: string;
  summary: string;
}

export interface SocialBuzzTicker {
  twitter: "low" | "moderate" | "high";
  reddit: "low" | "moderate" | "high";
}

export interface CorporateFiling {
  type: string;
  date: string;
  title: string;
}

export interface TickerInsiderBuy {
  insider: string;
  title: string;
  shares: number;
  price: number;
  totalValue: number;
  date: string;
}
