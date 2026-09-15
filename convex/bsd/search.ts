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
    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split("T")[0];

    const data = (await bsdGet("/events/", {
      team_name: args.teamName,
      // If user picked a date, use it. Otherwise, start from today!
      date_from: args.dateFrom || today,
      date_to: args.dateTo,
      limit: 30,
    })) as unknown as BsdEventListResponse;

    return data.results.map((event: any) => {
      // Try every possible name Bzzoiro might use for the league
      const leagueName = 
        event.league_name || 
        event.league || 
        event.competition || 
        event.tournament || 
        event.competition_name || 
        "Unknown Competition";

      return {
        eventId: event.id,
        homeTeam: event.home_team,
        awayTeam: event.away_team,
        leagueName: leagueName,
        kickoff: event.event_date,
        status: event.status,
        homeScore: event.home_score,
        awayScore: event.away_score,
      };
    });
  },
});
