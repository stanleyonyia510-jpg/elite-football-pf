import { v } from "convex/values";
import { action } from "../_generated/server";
import { bsdGet } from "./client.ts";
import type { BsdEventListResponse } from "./types.ts";
import type { MatchSearchResult } from "./types.ts";

export type { MatchSearchResult };

// Helper to find the actual date no matter what Bzzoiro calls it
function extractDate(event: any): string {
  const rawDate = 
    event.event_date || 
    event.date || 
    event.kickoff || 
    event.start_time || 
    event.match_date || 
    event.fixture_date || 
    null;
    
  if (!rawDate) return "";
  // Clean up the date to just "YYYY-MM-DD"
  return String(rawDate).split("T")[0];
}

export const searchMatches = action({
  args: {
    teamName: v.optional(v.string()),
    dateFrom: v.optional(v.string()),
    dateTo: v.optional(v.string()),
  },
  handler: async (_ctx, args): Promise<MatchSearchResult[]> => {
    const today = new Date().toISOString().split("T")[0];

    const data = (await bsdGet("/events/", {
      team_name: args.teamName,
      // We send the date, but we don't trust the API to respect it
      date_from: args.dateFrom || today,
      date_to: args.dateTo,
      limit: 50,
    })) as unknown as BsdEventListResponse;

    // 1. Map EVERYTHING carefully
    const mappedResults = data.results.map((event: any) => {
      const realDate = extractDate(event);
      
      return {
        eventId: event.id || event.event_id || Math.random(),
        homeTeam: event.home_team || event.homeTeam || event.home || "Home Team",
        awayTeam: event.away_team || event.awayTeam || event.away || "Away Team",
        leagueName:
          event.league_name ||
          event.league ||
          event.competition ||
          event.tournament ||
          "Competition Unknown",
        // Save the clean date so the rest of the app understands it
        kickoff: realDate,
        status: event.status || "notstarted",
        homeScore: event.home_score ?? event.homeScore ?? null,
        awayScore: event.away_score ?? event.awayScore ?? null,
      };
    });

    // 2. THE HARD FILTER: Absolutely no games before today allowed.
    const finalResults = mappedResults.filter((match) => {
      if (!match.kickoff) return false; // If we still can't find a date, throw it out
      return match.kickoff >= today; // Only keep today or future games
    });

    return finalResults;
  },
});
