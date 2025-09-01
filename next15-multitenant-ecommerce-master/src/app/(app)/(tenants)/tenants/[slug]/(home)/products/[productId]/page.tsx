import { Suspense } from "react";
import { HydrationBoundary } from "@tanstack/react-query";

import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrateQueryClient, deserializeDehydratedState } from "@/trpc/query-client";

import { ProductView, ProductViewSkeleton } from "@/modules/products/ui/views/product-view";

interface Props {
  params: Promise<{ productId: string; slug: string }>;
};

export const dynamic = "force-dynamic";

const Page = async ({ params }: Props) => {
  const { productId, slug } = await params;

  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(trpc.tenants.getOne.queryOptions({
    slug,
  }));
  // Dehydrate after prefetch
  const dehydratedState = dehydrateQueryClient(queryClient);

  return (
  <HydrationBoundary state={deserializeDehydratedState(dehydratedState)}>
      <Suspense fallback={<ProductViewSkeleton />}>
        <ProductView productId={productId} tenantSlug={slug} />
      </Suspense>
    </HydrationBoundary>
  );
}
 
export default Page;
