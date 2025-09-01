"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useTRPC } from "@/trpc/client";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

interface NavbarItem {
  href: string;
  children: React.ReactNode;
}

interface Props {
  items: NavbarItem[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const NavbarSidebar = ({ items, open, onOpenChange }: Props) => {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const trpc = useTRPC();
  const session = useQuery(trpc.auth.session.queryOptions());
  const logout = useMutation(trpc.auth.logout.mutationOptions());
  const queryClient = useQueryClient();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="p-0 transition-none">
        <SheetHeader className="p-4 border-b">
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>
        <ScrollArea className="flex flex-col overflow-y-auto h-full pb-2">
          {items.map((item) => (
            <Button
              key={item.href}
              onClick={() => {
                onOpenChange(false);
                try {
                  router.push(item.href);
                  setTimeout(() => {
                    if (window.location.pathname !== item.href) {
                      window.location.href = item.href;
                    }
                  }, 100);
                } catch (error) {
                  console.error("Router navigation failed:", error);
                  window.location.href = item.href;
                }
              }}
              className="w-full text-left p-4 hover:bg-black hover:text-white text-black flex items-center text-base font-medium bg-transparent border-0 cursor-pointer"
            >
              {item.children}
            </Button>
          ))}

          <div className="border-t">
            {session.data?.user ? (
              <>
                {(session.data.user.roles?.includes("super-admin") ||
                  (session.data.user.tenants &&
                    session.data.user.tenants.length > 0)) && (
                  <Button
                    onClick={() => {
                      onOpenChange(false);
                      try {
                        router.push("/admin");
                        setTimeout(() => {
                          if (window.location.pathname !== "/admin") {
                            window.location.href = "/admin";
                          }
                        }, 100);
                      } catch (error) {
                        console.error("Router navigation failed:", error);
                        window.location.href = "/admin";
                      }
                    }}
                    className="w-full text-left p-4 hover:bg-black hover:text-white text-black flex items-center text-base font-medium bg-transparent border-0 cursor-pointer"
                  >
                    Dashboard
                  </Button>
                )}

                <Button
                  onClick={() => {
                    setIsLoggingOut(true);
                    try {
                      logout.mutate(undefined, {
                        onError: (error: any) => {
                          console.error("Logout failed:", error);
                          toast.error("Logout failed. Please try again.");
                          setIsLoggingOut(false);
                        },
                        onSuccess: async () => {
                          await queryClient.invalidateQueries(
                            trpc.auth.session.queryFilter()
                          );
                          toast.success("Logged out successfully.");
                          onOpenChange(false);
                          try {
                            router.replace("/");
                            setTimeout(() => {
                              if (window.location.pathname !== "/") {
                                window.location.href = "/";
                              }
                            }, 100);
                          } catch (error) {
                            console.error("Router navigation failed:", error);
                            window.location.href = "/";
                          }
                          setIsLoggingOut(false);
                        },
                      });
                    } catch (error) {
                      console.error("Error during logout:", error);
                      toast.error("An unexpected error occurred.");
                      setIsLoggingOut(false);
                    }
                  }}
                  disabled={isLoggingOut}
                  className="w-full text-left p-4 hover:bg-red-500 hover:text-white flex items-center text-base font-medium bg-transparent border-0 cursor-pointer disabled:opacity-50 text-black"
                >
                  {isLoggingOut ? "Logging out..." : "Log Out"}
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={() => {
                    onOpenChange(false);
                    try {
                      router.push("/sign-in");
                      setTimeout(() => {
                        if (window.location.pathname !== "/sign-in") {
                          window.location.href = "/sign-in";
                        }
                      }, 100);
                    } catch (error) {
                      console.error("Router navigation failed:", error);
                      window.location.href = "/sign-in";
                    }
                  }}
                  className="w-full text-left p-4 hover:bg-black hover:text-white flex items-center text-base font-medium bg-transparent border-0 cursor-pointer text-black"
                >
                  Log in
                </Button>

                <Button
                  onClick={() => {
                    onOpenChange(false);
                    try {
                      router.push("/sign-up-customer");
                      setTimeout(() => {
                        if (window.location.pathname !== "/sign-up-customer") {
                          window.location.href = "/sign-up-customer";
                        }
                      }, 100);
                    } catch (error) {
                      console.error("Router navigation failed:", error);
                      window.location.href = "/sign-up-customer";
                    }
                  }}
                  className="w-full text-left p-4 hover:bg-black hover:text-white flex items-center text-base font-medium bg-transparent border-0 cursor-pointer text-black"
                >
                  Join as Customer
                </Button>

                <Button
                  onClick={() => {
                    onOpenChange(false);
                    try {
                      router.push("/sign-up");
                      setTimeout(() => {
                        if (window.location.pathname !== "/sign-up") {
                          window.location.href = "/sign-up";
                        }
                      }, 100);
                    } catch (error) {
                      console.error("Router navigation failed:", error);
                      window.location.href = "/sign-up";
                    }
                  }}
                  className="w-full text-left p-4 hover:bg-black hover:text-white flex items-center text-base font-medium bg-transparent border-0 cursor-pointer text-black"
                >
                  Start selling
                </Button>
              </>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
