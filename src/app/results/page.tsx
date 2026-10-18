import type { Metadata } from "next";
import { Suspense } from "react";
import { parseCriteria } from "@/lib/criteria";
import type { TravelMode } from "@/types/travel";
import { ResultsView } from "./ResultsView";

export const metadata: Metadata = {
  title: "Connections — bahngebot",
};

/**
 * Cache Components: reading `searchParams` opts this segment into request-time
 * rendering, so it has to sit behind a Suspense boundary. The shell (header,
 * ambient glow) is never touched by that.
 */
export default function ResultsPage(props: PageProps<"/results">) {
  return (
    <Suspense fallback={null}>
      <ResultsFromParams searchParams={props.searchParams} />
    </Suspense>
  );
}

async function ResultsFromParams({
  searchParams,
}: {
  searchParams: PageProps<"/results">["searchParams"];
}) {
  const params = await searchParams;
  const mode: TravelMode = params.mode === "tinder" ? "tinder" : "specific";

  return <ResultsView criteria={parseCriteria(params)} initialMode={mode} />;
}
