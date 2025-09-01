import type { SearchParams } from "nuqs/server";
import { HydrationBoundary } from "@tanstack/react-query";

import { DEFAULT_LIMIT } from "@/constants";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrateQueryClient, deserializeDehydratedState } from "@/trpc/query-client";

import { loadProductFilters } from "@/modules/products/search-params";
import { ProductListView } from "@/modules/products/ui/views/product-list-view";

interface Props {
  searchParams: Promise<SearchParams>;
}

const Page = async ({ searchParams }: Props) => {
  const filters = await loadProductFilters(searchParams);

  const queryClient = getQueryClient();

  // Consider using await here to ensure prefetch completes
  await queryClient.prefetchInfiniteQuery(
    trpc.products.getMany.infiniteQueryOptions({
      ...filters,
      limit: DEFAULT_LIMIT,
    })
  );

  // Dehydrate ONCE before the return statement
  const dehydratedState = dehydrateQueryClient(queryClient);

  return (
  <HydrationBoundary state={deserializeDehydratedState(dehydratedState)}>
      <ProductListView />
    </HydrationBoundary>
  );
};

export default Page;
