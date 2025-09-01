"use client";

import { useEffect } from "react";
import { LoaderIcon } from "lucide-react";
import { useMutation } from "@tanstack/react-query";

import { useTRPC } from "@/trpc/client";

const Page = () => {
  const trpc = useTRPC();
  const { mutate: verify } = useMutation(
    trpc.checkout.verify.mutationOptions({
      onSuccess: (data) => {
        console.log("Stripe verify success:", data);
        window.location.href = data.url;
      },
      onError: (error) => {
        console.error("Stripe verify error:", error);
        window.location.href = "/";
      },
    })
  );

  useEffect(() => {
    console.log("Calling verify mutation...");
    verify();
  }, [verify]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <LoaderIcon className="animate-spin text-muted-foreground" />
    </div>
  );
};

export default Page;
