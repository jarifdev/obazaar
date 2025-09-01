"use client";

import { useParams, usePathname } from "next/navigation";
import { useSuspenseQuery } from "@tanstack/react-query";

import { useTRPC } from "@/trpc/client";

import { useProductFilters } from "@/modules/products/hooks/use-product-filters";

import { Categories } from "./categories";
import { SearchInput } from "./search-input";
import { DEFAULT_BG_COLOR } from "../../../constants";

export const SearchFilters = () => {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(trpc.categories.getMany.queryOptions());

  const [filters, setFilters] = useProductFilters();

  const params = useParams();
  const pathname = usePathname();

  // Define non-product pages where categories should be hidden
  const nonProductPages = ["/contact", "/features"];

  // Check if current page is a non-product page
  const isNonProductPage = nonProductPages.includes(pathname);

  return (
    <div
      className="px-4 lg:px-12 py-8 border-b flex flex-col gap-4 w-full"
      style={{
        backgroundColor: "#1c476f",
      }}
    >
      <SearchInput
        defaultValue={filters.search}
        onChange={(value) =>
          setFilters({
            search: value,
          })
        }
      />
      {!isNonProductPage && (
        <div className="hidden lg:block">
          <Categories data={data} />
        </div>
      )}
    </div>
  );
};

export const SearchFiltersSkeleton = () => {
  const pathname = usePathname();

  // Define non-product pages where categories should be hidden
  const nonProductPages = ["/contact", "/features"];

  // Check if current page is a non-product page
  const isNonProductPage = nonProductPages.includes(pathname);

  return (
    <div
      className="px-4 lg:px-12 py-8 border-b flex flex-col gap-4 w-full"
      style={{
        backgroundColor: "#1c476f",
      }}
    >
      <SearchInput disabled />
      {!isNonProductPage && (
        <div className="hidden lg:block">
          <div className="h-11" />
        </div>
      )}
    </div>
  );
};
