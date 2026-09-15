import { v } from "convex/values";
import { action } from "../_generated/server";
import { bsdGet } from "./client.ts";
import type { BsdEventListResponse } from "./types.ts";
import type { MatchSearchResult } from "./types.ts";

export type { MatchSearchResult };

export const searchMatches = action({
  args: {
    teamName: v.optional(v.string()),
    dateFrom: v.optional(v.string()), // YYYY-MM-DD
    dateTo: v.optional(v.string()), // YYYY-MM-DD
  },
  handler: async (_ctx, args): Promise<MatchSearchResult[]> => {
    // 1. Force the search to start from TODAY if the user didn't pick a date
    const today = new Date().toISOString().split("T")[0];
    
    // 2. Fetch the data
    const data = (await bsdGet("/events/", {
      team_name: args.teamName,
      date_from: args.dateFrom || today, // Enforce today onwards
      date_to: args.dateTo,
      limit: 30,
    })) as unknown as BsdEventListResponse;

    // 3. Map the results with a "brute force" approach for field names
    return data.results.map((event: any) => {
      // Try EVERY possible name for the league
      const leagueName = 
        event.league_name || 
        event.league || 
        event.competition || 
        event.tournament || 
        event.competition_name || 
        event.category || 
        "Unknown Competition";

      return {
        eventId: event.id || event.event_id || Math.random(),
        homeTeam: event.home_team || event.homeTeam || event.home || "Home Team",
        awayTeam: event.away_team || event.awayTeam || event.away || "Away Team",
        leagueName: leagueName,
        kickoff: event.event_date || event.date || event.kickoff || event.start_time || "",
        status: event.status || event.match_status || "unknown",
        homeScore: event.home_score !== undefined ? event.home_score : event.homeScore ?? null,
        awayScore: event.away_score !== undefined ? event.away_score : event.awayScore ?? null,
      };
    });
  },
});
