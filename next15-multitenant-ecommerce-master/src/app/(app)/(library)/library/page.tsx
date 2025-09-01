import { HydrationBoundary } from "@tanstack/react-query";

import { DEFAULT_LIMIT } from "@/constants";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrateQueryClient, deserializeDehydratedState } from "@/trpc/query-client";

import { LibraryView } from "@/modules/library/ui/views/library-view";

export const dynamic = "force-dynamic";

const Page = async () => {
  const queryClient = getQueryClient();
  void queryClient.prefetchInfiniteQuery(trpc.library.getMany.infiniteQueryOptions({
    limit: DEFAULT_LIMIT,
  }));

  const dehydratedState = dehydrateQueryClient(queryClient);

  return (
    <HydrationBoundary state={deserializeDehydratedState(dehydratedState)}>
      <LibraryView />
    </HydrationBoundary>
  );
};
 
export default Page;
