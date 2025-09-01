import { Suspense } from "react";

import { getQueryClient, trpc } from "@/trpc/server";
import { HydrationBoundary } from "@tanstack/react-query";
import { dehydrateQueryClient, deserializeDehydratedState } from "@/trpc/query-client";

import { Footer } from "@/modules/tenants/ui/components/footer";
import { Navbar as TenantNavbar, NavbarSkeleton } from "@/modules/tenants/ui/components/navbar";
import { Navbar as HomeNavbar } from "@/modules/home/ui/components/navbar";

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

const Layout = async ({ children, params }: LayoutProps) => {
  const { slug } = await params;

  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(trpc.tenants.getOne.queryOptions({
    slug,
  }));
  // Dehydrate state for client hydration
  const dehydratedState = dehydrateQueryClient(queryClient);

  return (
    <div className="min-h-screen bg-[#F4F4F0] flex flex-col">
  <HydrationBoundary state={deserializeDehydratedState(dehydratedState)}>
        <Suspense fallback={<NavbarSkeleton />}>
          {/* Show the site topbar (home navbar) first so product pages display the top menu */}
          <HomeNavbar />
          <TenantNavbar slug={slug} />
        </Suspense>
      </HydrationBoundary>
      <div className="flex-1">
        <div className="max-w-(--breakpoint-xl) mx-auto">
          {children}
        </div>
      </div>
      <Footer />
    </div>
  );
};
 
export default Layout;
