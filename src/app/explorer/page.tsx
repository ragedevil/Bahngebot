import type { Metadata } from "next";
import { Suspense } from "react";
import { parseBudget, parseCriteria } from "@/lib/criteria";
import { ExplorerView } from "./ExplorerView";

export const metadata: Metadata = {
  title: "Connection Explorer — bahngebot",
};

export default function ExplorerPage(props: PageProps<"/explorer">) {
  return (
    <Suspense fallback={null}>
      <ExplorerFromParams searchParams={props.searchParams} />
    </Suspense>
  );
}

async function ExplorerFromParams({
  searchParams,
}: {
  searchParams: PageProps<"/explorer">["searchParams"];
}) {
  const params = await searchParams;
  return (
    <ExplorerView
      criteria={parseCriteria(params)}
      budget={parseBudget(params)}
    />
  );
}
