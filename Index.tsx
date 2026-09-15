import { useAction } from "convex/react";
import { CalendarIcon, Loader2Icon, SearchIcon, ShieldAlertIcon } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/convex/_generated/api.js";
import type { MatchSearchResult } from "@/convex/bsd/types.ts";
import AppHeader from "@/components/app-header.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Card, CardContent } from "@/components/ui/card.tsx";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty.tsx";
import {
  ErrorState,
  ErrorStateContent,
  ErrorStateDescription,
  ErrorStateHeader,
  ErrorStateMedia,
  ErrorStateTitle,
} from "@/components/ui/error-state.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import {
  formatKickoff,
  STATUS_BADGE_CLASS,
  STATUS_LABEL,
} from "@/lib/match-format.ts";
import type { BsdEventStatus } from "@/convex/bsd/types.ts";

export default function Index() {
  const [teamName, setTeamName] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<MatchSearchResult[]>([]);

  const searchMatches = useAction(api.bsd.search.searchMatches);
  const navigate = useNavigate();

  const runSearch = async () => {
    setIsSearching(true);
    setHasSearched(true);
    setError(null);
    try {
      const matches = await searchMatches({
        teamName: teamName.trim() || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      });
      setResults(matches);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed. Please try again.");
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const canSearch = teamName.trim().length > 0 || (dateFrom && dateTo);

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="mx-auto max-w-6xl px-4 pt-10 pb-20 sm:px-6">
        <div className="mb-8 text-center sm:mb-10">
          <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Find a match. Analyze it. Decide with data.
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-balance text-muted-foreground">
            Search real fixtures, then run an independent statistical analysis
            built on verified match data.
          </p>
        </div>

        <Card className="border-border/70 shadow-lg">
          <CardContent className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1.5fr_1fr_1fr_auto]">
              <div className="relative">
                <SearchIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="Team name, e.g. Arsenal"
                  className="pl-9"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && canSearch) void runSearch();
                  }}
                />
              </div>
              <div className="relative">
                <CalendarIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="pl-9"
                  aria-label="From date"
                />
              </div>
              <div className="relative">
                <CalendarIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="pl-9"
                  aria-label="To date"
                />
              </div>
              <Button
                onClick={() => void runSearch()}
                disabled={!canSearch || isSearching}
                className="cursor-pointer"
              >
                {isSearching ? (
                  <Loader2Icon className="size-4 animate-spin" />
                ) : (
                  <SearchIcon className="size-4" />
                )}
                Search
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Search by team name, or narrow to a date range. Combine both for
              best results.
            </p>
          </CardContent>
        </Card>

        <div className="mt-8">
          {isSearching && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-28 w-full rounded-xl" />
              ))}
            </div>
          )}

          {!isSearching && error && (
            <ErrorState>
              <ErrorStateHeader>
                <ErrorStateMedia variant="icon">
                  <ShieldAlertIcon />
                </ErrorStateMedia>
                <ErrorStateTitle>Couldn't complete the search</ErrorStateTitle>
                <ErrorStateDescription>{error}</ErrorStateDescription>
              </ErrorStateHeader>
              <ErrorStateContent>
                <Button size="sm" onClick={() => void runSearch()} className="cursor-pointer">
                  Try again
                </Button>
              </ErrorStateContent>
            </ErrorState>
          )}

          {!isSearching && !error && hasSearched && results.length === 0 && (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <SearchIcon />
                </EmptyMedia>
                <EmptyTitle>No matches found</EmptyTitle>
                <EmptyDescription>
                  Try a different team name or widen the date range.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}

          {!isSearching && !error && results.length > 0 && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {results.map((match) => (
                <button
                  key={match.eventId}
                  onClick={() => navigate(`/match/${match.eventId}`)}
                  className="cursor-pointer rounded-xl border border-border/70 bg-card p-4 text-left transition-colors hover:border-primary/60 hover:bg-accent/10"
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="truncate text-xs font-medium tracking-wide text-muted-foreground uppercase">
                      {match.leagueName ?? "Competition unknown"}
                    </span>
                    <Badge
                      className={STATUS_BADGE_CLASS[match.status as BsdEventStatus]}
                    >
                      {STATUS_LABEL[match.status as BsdEventStatus] ?? match.status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="truncate font-semibold text-foreground">
                      {match.homeTeam}
                    </span>
                    <span className="shrink-0 text-sm font-medium text-muted-foreground">
                      {match.homeScore !== null && match.awayScore !== null
                        ? `${match.homeScore} – ${match.awayScore}`
                        : "vs"}
                    </span>
                    <span className="truncate text-right font-semibold text-foreground">
                      {match.awayTeam}
                    </span>
                  </div>
                  <div className="mt-3 text-xs text-muted-foreground">
                    {formatKickoff(match.kickoff)}
                  </div>
                </button>
              ))}
            </div>
          )}

          {!hasSearched && (
            <Empty className="border-none">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <SearchIcon />
                </EmptyMedia>
                <EmptyTitle>Search for a match to get started</EmptyTitle>
                <EmptyDescription>
                  Enter a team name or a date range above, then pick the exact
                  fixture you want analyzed.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent />
            </Empty>
          )}
        </div>
      </main>
    </div>
  );
}
