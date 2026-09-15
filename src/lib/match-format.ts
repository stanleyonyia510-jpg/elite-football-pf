import { format, parseISO } from "date-fns";
import type { BsdEventStatus } from "@/convex/bsd/types.ts";

export function formatKickoff(iso: string | null): string {
  if (!iso) return "Time TBC";
  try {
    return format(parseISO(iso), "EEE d MMM, HH:mm 'UTC'");
  } catch {
    return "Time TBC";
  }
}

export const STATUS_LABEL: Record<BsdEventStatus, string> = {
  upcoming: "Upcoming",
  live: "Live",
  finished: "Finished",
  cancelled: "Cancelled",
  postponed: "Postponed",
  unresolved: "Unresolved",
};

export const STATUS_BADGE_CLASS: Record<BsdEventStatus, string> = {
  upcoming: "bg-secondary text-secondary-foreground",
  live: "bg-destructive text-white",
  finished: "bg-muted text-muted-foreground",
  cancelled: "bg-muted text-muted-foreground",
  postponed: "bg-muted text-muted-foreground",
  unresolved: "bg-muted text-muted-foreground",
};
