"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

import { CategoriesGetManyOutput } from "@/modules/categories/types";

import { SubcategoryMenu } from "./subcategory-menu";

interface Props {
  category: CategoriesGetManyOutput[1];
  isActive?: boolean;
  isNavigationHovered?: boolean;
}

export const CategoryDropdown = ({
  category,
  isActive,
  isNavigationHovered,
}: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const onMouseEnter = () => {
    if (category.subcategories) {
      setIsOpen(true);
    }
  };

  const onMouseLeave = () => setIsOpen(false);

  // TODO: Potentially improve mobile
  // const toggleDropdown = () => {
  //   if (category.subcategories?.docs?.length) {
  //     setIsOpen(!isOpen);
  //   }
  // };

  return (
    <div
      className="relative"
      ref={dropdownRef}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      // onClick={toggleDropdown}
    >
      <div className="relative">
        <Button
          variant="elevated"
          onClick={() => {
            const targetPath = `/${category.slug === "all" ? "" : category.slug}`;
            console.log(
              `Category clicked: ${category.name}, navigating to: ${targetPath}`
            );

            // Apply robust navigation for all categories
            try {
              if (category.slug === "all") {
                router.replace("/");
              } else {
                router.replace(targetPath);
              }

              // Fallback if router doesn't work
              setTimeout(() => {
                const expectedPath = category.slug === "all" ? "/" : targetPath;
                if (window.location.pathname !== expectedPath) {
                  window.location.href = expectedPath;
                }
              }, 100);
            } catch (error) {
              console.error("Router navigation failed:", error);
              const fallbackPath = category.slug === "all" ? "/" : targetPath;
              window.location.href = fallbackPath;
            }
          }}
          className={cn(
            "h-11 px-4 bg-transparent border-transparent rounded-full hover:bg-white hover:border-primary",
            { "text-[#fab803]": true },
            isActive && !isNavigationHovered && "bg-white border-primary",
            isOpen &&
              "bg-white border-primary shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -translate-x-[4px] -translate-y-[4px]"
          )}
        >
          {category.name}
        </Button>
        {category.subcategories && category.subcategories.length > 0 && (
          <div
            className={cn(
              "opacity-0 absolute -bottom-3 w-0 h-0 border-l-[10px] border-r-[10px] border-b-[10px] border-l-transparent border-r-transparent border-b-[#fab803] left-1/2 -translate-x-1/2",
              isOpen && "opacity-100"
            )}
          />
        )}
      </div>

      <SubcategoryMenu category={category} isOpen={isOpen} />
    </div>
  );
};
