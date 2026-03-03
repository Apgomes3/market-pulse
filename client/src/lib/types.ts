export interface DashboardData {
  reportDate: string;
  dataAsOf: string;
  postsCount: number;
  publicationsCount: number;
  subscriptionsCount: number;
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
  postSummaries: PostCategory[];
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
