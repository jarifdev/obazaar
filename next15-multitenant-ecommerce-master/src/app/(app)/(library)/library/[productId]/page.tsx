import { HydrationBoundary } from "@tanstack/react-query";

import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrateQueryClient, deserializeDehydratedState } from "@/trpc/query-client";

import { ProductView, ProductViewSkeleton } from "@/modules/library/ui/views/product-view";
import { Suspense } from "react";

interface Props {
  params: Promise<{
    productId: string;
  }>
}

export const dynamic = "force-dynamic";

const Page = async ({ params }: Props) => {
  const { productId } = await params;

  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(trpc.library.getOne.queryOptions({
    productId,
  }));

  void queryClient.prefetchQuery(trpc.reviews.getOne.queryOptions({
    productId,
  }));

  const dehydratedState = dehydrateQueryClient(queryClient);

  return (
    <HydrationBoundary state={deserializeDehydratedState(dehydratedState)}>
      <Suspense fallback={<ProductViewSkeleton />}>
        <ProductView productId={productId} />
      </Suspense>
    </HydrationBoundary>
  );
};
 
export default Page;
