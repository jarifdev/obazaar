import Link from "next/link";
import { useRouter } from "next/navigation";

import { Category } from "@/payload-types";

import { CategoriesGetManyOutput } from "@/modules/categories/types";

interface Props {
  category: CategoriesGetManyOutput[1];
  isOpen: boolean;
}

export const SubcategoryMenu = ({ category, isOpen }: Props) => {
  const router = useRouter();

  if (
    !isOpen ||
    !category.subcategories ||
    category.subcategories.length === 0
  ) {
    return null;
  }

  const backgroundColor = category.color || "#F5F5F5";

  return (
    <div
      className="absolute z-100"
      style={{
        top: "100%",
        left: 0,
      }}
    >
      {/* Invisible bridge to maintain hover */}
      <div className="h-3 w-60" />
      <div
        style={{ backgroundColor }}
        className="w-60 text-[#000000] rounded-md overflow-hidden border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -translate-x-[2px] -translate-y-[2px]"
      >
        <div>
          {category.subcategories?.map((subcategory: Category) => (
            <button
              key={subcategory.slug}
              onClick={() => {
                const subcategoryPath = `/${category.slug}/${subcategory.slug}`;
                console.log(
                  `Subcategory clicked: ${subcategory.name}, navigating to: ${subcategoryPath}`
                );

                try {
                  router.replace(subcategoryPath);
                  setTimeout(() => {
                    if (window.location.pathname !== subcategoryPath) {
                      window.location.href = subcategoryPath;
                    }
                  }, 100);
                } catch (error) {
                  console.error("Router navigation failed:", error);
                  window.location.href = subcategoryPath;
                }
              }}
              className="w-full text-left p-4 hover:bg-[#fab803] hover:text-white flex justify-between items-center underline font-medium bg-transparent border-0 cursor-pointer"
            >
              {subcategory.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
