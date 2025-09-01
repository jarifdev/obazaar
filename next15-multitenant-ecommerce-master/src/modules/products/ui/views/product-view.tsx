"use client";

import Link from "next/link";
import Image from "next/image";
import { Fragment, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { useSuspenseQuery, useQuery } from "@tanstack/react-query";
import { RichText } from "@payloadcms/richtext-lexical/react";

import { useTRPC } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { StarRating } from "@/components/star-rating";
import { ReviewsList } from "@/components/reviews-list";
import { ReviewSidebar } from "@/modules/library/ui/components/review-sidebar";
import { formatCurrency, generateTenantURL } from "@/lib/utils";

// Small inline SVGs to avoid pulling lucide-react into hot client bundles
const CheckSvg = ({ className = "w-4 h-4 mr-2" }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
  >
    <path
      d="M20 6L9 17l-5-5"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const LinkSvg = ({ className = "w-4 h-4 mr-2" }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
  >
    <path
      d="M10 14a3 3 0 0 0 4.24 0l1.42-1.42a3 3 0 0 0 0-4.24L14.24 6.1a3 3 0 0 0-4.24 0"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M14 10a3 3 0 0 0-4.24 0L8.34 11.42a3 3 0 0 0 0 4.24"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const StarSvg = ({
  className = "size-4 fill-black",
}: {
  className?: string;
}) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
  >
    <path d="M12 .587l3.668 7.431L23.4 9.75l-5.7 5.556L19.335 24 12 19.897 4.665 24l1.635-8.694L.6 9.75l7.732-1.732L12 .587z" />
  </svg>
);

const CustomerCartButton = dynamic(
  () =>
    import("../components/customer-cart-button").then(
      (mod) => mod.CustomerCartButton
    ),
  {
    ssr: false,
    loading: () => (
      <Button disabled className="flex-1 bg-pink-400">
        Add to cart
      </Button>
    ),
  }
);

interface ProductViewProps {
  productId: string;
  tenantSlug: string;
}

export const ProductView = ({ productId, tenantSlug }: ProductViewProps) => {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(
    trpc.products.getOne.queryOptions({ id: productId })
  );

  const session = useQuery(trpc.auth.session.queryOptions());

  const [isCopied, setIsCopied] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div className="px-4 lg:px-12 py-10">
      <div className="border rounded-sm bg-white overflow-hidden">
        <div className="relative aspect-[3.9] border-b">
          <Image
            src={data.image?.url || "/placeholder.png"}
            alt={data.name}
            fill
            className="object-cover"
          />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-6">
          <div className="col-span-4">
            <div className="p-6">
              <h1 className="text-4xl font-medium">{data.name}</h1>
            </div>
            <div className="border-y flex">
              <div className="px-6 py-4 flex items-center justify-center border-r">
                <div className="px-2 py-1 border bg-[#fab803] w-fit">
                  <p className="text-base font-medium text-black">
                    {formatCurrency(data.price)}
                  </p>
                </div>
              </div>

              <div className="px-6 py-4 flex items-center justify-center lg:border-r">
                <Link
                  href={generateTenantURL(tenantSlug)}
                  className="flex items-center gap-2"
                >
                  {data.tenant.image?.url && (
                    <Image
                      src={data.tenant.image.url}
                      alt={data.tenant.name}
                      width={20}
                      height={20}
                      className="rounded-full border shrink-0 size-[20px]"
                    />
                  )}
                  <p className="text-base underline font-medium">
                    {data.tenant.name}
                  </p>
                </Link>
              </div>

              <div className="hidden lg:flex px-6 py-4 items-center justify-center">
                <div className="flex items-center gap-2">
                  <StarRating
                    rating={data.reviewRating}
                    iconClassName="size-4"
                  />
                  <p className="text-base font-medium">
                    {data.reviewCount} ratings
                  </p>
                </div>
              </div>
            </div>

            <div className="block lg:hidden px-6 py-4 items-center justify-center border-b">
              <div className="flex items-center gap-2">
                <StarRating rating={data.reviewRating} iconClassName="size-4" />
                <p className="text-base font-medium">
                  {data.reviewCount} ratings
                </p>
              </div>
            </div>

            <div className="p-6">
              {data.description ? (
                <RichText data={data.description} />
              ) : (
                <p className="font-medium text-muted-foreground italic">
                  No description provided
                </p>
              )}
            </div>
          </div>

          <div className="col-span-2">
            <div className="border-t lg:border-t-0 lg:border-l h-full">
              <div className="flex flex-col gap-4 p-4 border-b">
                <div className="space-y-2">
                  <CustomerCartButton
                    isPurchased={data.isPurchased}
                    productId={productId}
                    tenantSlug={tenantSlug}
                  />
                  <Button
                    className="w-full h-10"
                    variant="outline"
                    onClick={() => {
                      setIsCopied(true);
                      navigator.clipboard.writeText(window.location.href);
                      toast.success("URL copied to clipboard");

                      setTimeout(() => {
                        setIsCopied(false);
                      }, 1000);
                    }}
                    disabled={isCopied}
                  >
                    {isCopied ? (
                      <>
                        <CheckSvg className="w-4 h-4 mr-2" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <LinkSvg className="w-4 h-4 mr-2" />
                        Share Product
                      </>
                    )}
                  </Button>
                </div>

                <p className="text-center font-medium">
                  {data.refundPolicy === "no-refunds"
                    ? "No refunds"
                    : `${data.refundPolicy} money back guarantee`}
                </p>
              </div>

              <div className="p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-medium">Ratings</h3>
                  <div className="flex items-center gap-x-1 font-medium">
                    <StarSvg className="size-4 fill-black" />
                    <p>({data.reviewRating.toFixed(1)})</p>
                    <p className="text-base">{data.reviewCount} ratings</p>
                  </div>
                </div>
                <div className="grid grid-cols-[auto_1fr_auto] gap-3 mt-4">
                  {[5, 4, 3, 2, 1].map((stars) => {
                    const pct = Number(
                      (data.ratingDistribution &&
                        data.ratingDistribution[stars]) ??
                        0
                    );
                    return (
                      <Fragment key={stars}>
                        <div className="font-medium">
                          {stars} {stars === 1 ? "star" : "stars"}
                        </div>
                        <Progress value={pct} className="h-[1lh]" />
                        <div className="font-medium">{pct}%</div>
                      </Fragment>
                    );
                  })}
                </div>

                {/* Review form - only render the interactive review UI after client mount to avoid hydration mismatch */}
                {!isMounted || !session.data?.user ? (
                  <div className="mt-6 text-sm">
                    <p className="font-medium">
                      Log in to leave a rating or review.
                    </p>
                  </div>
                ) : (
                  <div className="mt-6">
                    <ReviewSidebar productId={productId} />
                  </div>
                )}

                {/* Reviews List Section */}
                <div className="mt-8 border-t pt-8">
                  <h3 className="text-lg font-medium mb-4">Customer Reviews</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <ReviewsList productId={productId} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ProductViewSkeleton = () => {
  return (
    <div className="px-4 lg:px-12 py-10">
      <div className="border rounded-sm bg-white overflow-hidden">
        <div className="relative aspect-[3.9] border-b">
          <Image
            src={"/placeholder.png"}
            alt="Placeholder"
            fill
            className="object-cover"
          />
        </div>
      </div>
    </div>
  );
};
