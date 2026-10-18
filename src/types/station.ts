/** One row returned by `GET /api/stations`. */
export interface StationSuggestion {
  /** Canonical station name, e.g. "Dortmund Hbf". */
  name: string;
  /** City the station belongs to, e.g. "Dortmund". */
  city: string;
}
