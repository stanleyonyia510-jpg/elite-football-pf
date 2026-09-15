// Shapes we care about from the BSD football API. These are intentionally
// partial - the provider returns more fields than we use, and we treat
// anything we don't explicitly type as optional/unknown.

export type BsdEventStatus =
  | "upcoming"
  | "live"
  | "finished"
  | "cancelled"
  | "postponed"
  | "unresolved";

export type BsdEventSummary = {
  id: number;
  league_id: number | null;
  season_id: number | null;
  league_name?: string | null;
  home_team: string;
  away_team: string;
  home_team_id?: number;
  away_team_id?: number;
  event_date: string | null; // ISO 8601 UTC
  status: BsdEventStatus;
  home_score: number | null;
  away_score: number | null;
  round_number?: number | null;
  round_name?: string | null;
};

export type BsdEventListResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: BsdEventSummary[];
};

// Frontend-safe result shapes returned by our Convex actions. Kept in this
// file (no Node APIs) so the frontend can import the types without pulling
// in server-only code that touches process.env.
export type MatchSearchResult = {
  eventId: number;
  homeTeam: string;
  awayTeam: string;
  leagueName: string | null;
  kickoff: string | null;
  status: string;
  homeScore: number | null;
  awayScore: number | null;
};

export type MatchSummary = MatchSearchResult;

// Data-integrity status applied to every retrieved/derived field. Never
// fabricate data: fetch failures or missing provider data become
// UNAVAILABLE rather than a guessed value.
export type DataStatus = "VERIFIED" | "CALCULATED" | "ESTIMATED" | "UNAVAILABLE";

export type TaggedField<T> = {
  status: DataStatus;
  data: T | null;
  reason?: string;
};

export type TeamFormSummary = {
  recentResults: string[]; // most recent first, e.g. ["W", "D", "L", "W", "W"]
  summary: string; // e.g. "3W-1D-1L (last 5)"
  matchesConsidered: number;
  goalsScoredAvg: number | null;
  goalsConcededAvg: number | null;
  bttsRate: number | null; // fraction of considered matches where both teams scored
  cleanSheetRate: number | null;
};

// Full aggregation bundle for one match. Raw provider payloads are kept
// opaque (unknown) here - this milestone's job is retrieval + tagging, not
// modeling. The prediction engine (a later milestone) will interpret these.
export type MatchAnalysisBundle = {
  eventId: number;
  fetchedAt: string; // ISO 8601 UTC
  matchDetail: TaggedField<MatchSummary>;
  standings: TaggedField<unknown>;
  homeForm: TaggedField<TeamFormSummary>;
  awayForm: TaggedField<TeamFormSummary>;
  h2h: TaggedField<unknown>;
  stats: TaggedField<unknown>; // goals, xG, shotmap, possession, shots
  lineups: TaggedField<unknown>;
  homeSquadAvailability: TaggedField<unknown>; // injuries/suspensions
  awaySquadAvailability: TaggedField<unknown>;
  incidents: TaggedField<unknown>;
  odds: TaggedField<unknown>;
  bsdPrediction: TaggedField<unknown>;
};
