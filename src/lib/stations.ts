import type { StationRef } from "@/types/rail";

/** The station subset the UI needs after a suggestion is selected. */
export type StationSelection = Pick<StationRef, "id" | "name">;

export const DEFAULT_FROM_STATION: StationSelection = {
  id: "8011160",
  name: "Berlin Hbf",
};

export const DEFAULT_TO_STATION: StationSelection = {
  id: "8000261",
  name: "München Hbf",
};
