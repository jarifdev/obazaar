import { Suspense } from "react";
import { HydrationBoundary } from "@tanstack/react-query";

import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrateQueryClient, deserializeDehydratedState } from "@/trpc/query-client";

import { Navbar } from "@/modules/home/ui/components/navbar";
import { Footer } from "@/modules/home/ui/components/footer";
import { SearchFilters, SearchFiltersSkeleton } from "@/modules/home/ui/components/search-filters";

interface Props {
  children: React.ReactNode;
};

const Layout = async ({ children }: Props) => {
  const queryClient = getQueryClient();
  
  // Prefetch your data
  await queryClient.prefetchQuery(
    trpc.categories.getMany.queryOptions(),
  );
  
  // Dehydrate once, before the render using helper which serializes with superjson
  const dehydratedState = dehydrateQueryClient(queryClient);

  return ( 
    <div className="flex flex-col min-h-screen">
     <Navbar />
  <HydrationBoundary state={deserializeDehydratedState(dehydratedState)}>
      <Suspense fallback={<SearchFiltersSkeleton />}>
        <SearchFilters />
      </Suspense>
     </HydrationBoundary>
     <div className="flex-1 bg-[#F4F4F0]">
        {children}
      </div>
      <Footer />
    </div>
  );
}
 
export default Layout;