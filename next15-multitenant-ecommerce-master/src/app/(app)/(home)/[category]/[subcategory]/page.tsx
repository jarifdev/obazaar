import { SearchParams } from "nuqs/server";
import { HydrationBoundary } from "@tanstack/react-query";

import { DEFAULT_LIMIT } from "@/constants";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrateQueryClient, deserializeDehydratedState } from "@/trpc/query-client";

import { loadProductFilters } from "@/modules/products/search-params";
import { ProductListView } from "@/modules/products/ui/views/product-list-view";

interface Props {
  params: Promise<{
    subcategory: string;
  }>,
  searchParams: Promise<SearchParams>;
};

export const dynamic = "force-dynamic";

const Page = async ({ params, searchParams }: Props) => {
  const { subcategory } = await params;
  const filters = await loadProductFilters(searchParams);

  const queryClient = getQueryClient();
  void queryClient.prefetchInfiniteQuery(trpc.products.getMany.infiniteQueryOptions({
    ...filters,
    category: subcategory,
    limit: DEFAULT_LIMIT,
  }));

  const dehydratedState = dehydrateQueryClient(queryClient);

  return (
    <HydrationBoundary state={deserializeDehydratedState(dehydratedState)}>
      <ProductListView category={subcategory} />
    </HydrationBoundary>
  );
};

export default Page;
