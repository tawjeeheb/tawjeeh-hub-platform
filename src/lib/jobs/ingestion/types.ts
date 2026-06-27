// Ingestion contracts. The pipeline pulls jobs from pluggable sources and turns
// them into normalized, classified Job records. Sources must be LEGAL/safe:
// RSS feeds, permitted public pages, official APIs, or manual seed/admin input.
// No aggressive scraping, no bypassing site terms.

export interface RawJob {
  title: string;
  employer?: string;
  city?: string;
  sector?: string;
  applyUrl: string;
  postedAt?: string;
  deadline?: string | null;
  /** Full ad text used by the classifier. */
  rawText: string;
  /** Source adapter id that produced this. */
  source: string;
  skills?: string[];
}

export interface SourceAdapter {
  /** Stable id, e.g. "seed", "rss-example". */
  id: string;
  /** Human label for logs/admin. */
  label: string;
  /** True if it needs external config (key/url) to run. When unconfigured the
   *  pipeline skips it gracefully instead of failing. */
  requiresConfig: boolean;
  /** Whether the required config is present right now. */
  isConfigured(): boolean;
  /** Fetch raw jobs. Must never throw — return [] on any error. */
  fetch(): Promise<RawJob[]>;
}
