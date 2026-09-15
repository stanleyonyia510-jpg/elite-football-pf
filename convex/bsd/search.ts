import { v } from "convex/values";
import { action } from "../_generated/server";
import { bsdGet } from "./client.ts";
import type { BsdEventListResponse } from "./types.ts";
import type { MatchSearchResult } from "./types.ts";

export type { MatchSearchResult };

// Searches upcoming/live/finished matches by team name and/or date window.
export const searchMatches = action({
  args: {
    teamName: v.optional(v.string()),
    dateFrom: v.optional(v.string()), // YYYY-MM-DD
    dateTo: v.optional(v.string()), // YYYY-MM-DD
  },
  handler: async (_ctx, args): Promise<MatchSearchResult[]> => {
    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split("T")[0];

    const data = (await bsdGet("/events/", {
      team_name: args.teamName,
      // If user picked a date, use it. Otherwise, start from today!
      date_from: args.dateFrom || today,
      date_to: args.dateTo,
      limit: 30,
    })) as unknown as BsdEventListResponse;

    return data.results.map((event) => ({
      eventId: event.id,
      homeTeam: event.home_team,
      awayTeam: event.away_team,
      // Try to find the league name in multiple possible fields
      leagueName: (event as any).league_name ?? (event as any).league ?? (event as any).competition ?? "Unknown Competition",
      kickoff: event.event_date,
      status: event.status,
      homeScore: event.home_score,
      awayScore: event.away_score,
    }));
  },
});
