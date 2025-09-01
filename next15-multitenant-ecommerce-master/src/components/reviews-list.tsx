"use client";

import { useSuspenseInfiniteQuery, useQuery } from "@tanstack/react-query";
import { InboxIcon } from "lucide-react";
import { useState, useEffect } from "react";

import { useTRPC } from "@/trpc/client";
import { DEFAULT_LIMIT } from "@/constants";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { StarRating } from "@/components/star-rating";
import type { Review, User } from "@/payload-types";

interface ReviewsListProps {
  productId: string;
}

// Use the actual Payload types with user populated
type ReviewWithPopulatedUser = Review & {
  user: User;
};

const ReviewItem = ({ review }: { review: ReviewWithPopulatedUser }) => {
  const displayName = review.user.username || review.user.email;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Card className="w-full bg-white shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full">
              <span className="text-sm font-medium text-white">
                {displayName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="font-medium text-sm text-gray-900">{displayName}</p>
              <p className="text-xs text-gray-500">
                {formatDate(review.createdAt)}
              </p>
            </div>
          </div>
          <StarRating rating={review.rating} iconClassName="w-4 h-4" />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-gray-700 leading-relaxed">{review.description}</p>
      </CardContent>
    </Card>
  );
};

// Create a separate component for the actual reviews data
const ReviewsContent = ({ productId }: ReviewsListProps) => {
  const trpc = useTRPC();

  // Check authentication status
  const session = useQuery(trpc.auth.session.queryOptions());

  const { data, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useSuspenseInfiniteQuery(
      trpc.reviews.getMany.infiniteQueryOptions(
        {
          productId,
          limit: DEFAULT_LIMIT,
          direction: "forward",
        },
        {
          getNextPageParam: (lastPage) => {
            return lastPage.docs.length > 0 ? lastPage.nextPage : undefined;
          },
        }
      )
    );

  if (data.pages?.[0]?.docs.length === 0) {
    return (
      <div className="border border-dashed border-gray-300 flex items-center justify-center p-8 flex-col gap-y-4 bg-white w-full rounded-lg">
        <InboxIcon className="w-8 h-8 text-gray-400" />
        <p className="text-base font-medium text-gray-600">No reviews yet</p>
        <p className="text-sm text-gray-500">Be the first to leave a review!</p>
        {!session.data?.user && (
          <p className="text-sm text-blue-600 font-medium">
            Sign in to leave the first review
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        {data?.pages
          .flatMap((page) => page.docs)
          .map((review) => (
            <ReviewItem
              key={review.id}
              review={review as ReviewWithPopulatedUser}
            />
          ))}
      </div>

      {hasNextPage && (
        <div className="flex justify-center pt-4">
          <Button
            disabled={isFetchingNextPage}
            onClick={() => {
              try {
                fetchNextPage();
              } catch (error) {
                console.error("Failed to fetch next page:", error);
              }
            }}
            variant="outline"
            className="font-medium bg-white hover:bg-gray-50"
          >
            {isFetchingNextPage ? "Loading..." : "Load more reviews"}
          </Button>
        </div>
      )}
    </div>
  );
};

// Create a simple skeleton component for loading state
const ReviewsListSkeleton = () => {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <Card key={i} className="w-full bg-white animate-pulse">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                <div>
                  <div className="w-24 h-4 bg-gray-300 rounded"></div>
                  <div className="w-20 h-3 bg-gray-200 rounded mt-1"></div>
                </div>
              </div>
              <div className="flex gap-1">
                {[...Array(5)].map((_, j) => (
                  <div key={j} className="w-4 h-4 bg-gray-300 rounded"></div>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              <div className="w-full h-4 bg-gray-300 rounded"></div>
              <div className="w-3/4 h-4 bg-gray-300 rounded"></div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export const ReviewsList = ({ productId }: ReviewsListProps) => {
  const [isHydrated, setIsHydrated] = useState(false);

  // Fix hydration mismatch by ensuring component is hydrated
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Show loading state during hydration
  if (!isHydrated) {
    return <ReviewsListSkeleton />;
  }

  try {
    return <ReviewsContent productId={productId} />;
  } catch (error) {
    console.error("Error rendering reviews list:", error);
    return (
      <div className="border border-dashed border-red-300 flex items-center justify-center p-8 flex-col gap-y-4 bg-red-50 w-full rounded-lg">
        <InboxIcon className="w-8 h-8 text-red-400" />
        <p className="text-base font-medium text-red-600">
          Failed to load reviews
        </p>
        <p className="text-sm text-red-500">Please try again later</p>
      </div>
    );
  }
};
