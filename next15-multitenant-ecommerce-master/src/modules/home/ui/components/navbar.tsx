"use client";

import { useState } from "react";
import Image from "next/image";
import { MenuIcon } from "lucide-react";
import { Poppins } from "next/font/google";
import { usePathname, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { NavbarSidebar } from "./navbar-sidebar";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["700"],
});

interface NavbarItemProps {
  href: string;
  children: React.ReactNode;
  isActive?: boolean;
  onClick?: () => void;
}

const NavbarItem = ({ href, children, isActive, onClick }: NavbarItemProps) => {
  return (
    <Button
      onMouseEnter={() => {
        // hint to next/link/router to prefetch page on hover for instant navigation
        try {
          if (typeof window !== "undefined" && (href || "")) {
            // use Next's prefetch via creating an anchor and calling prefetch if available
            const a = document.createElement('a');
            a.href = href;
            a.rel = 'prefetch';
            document.head.appendChild(a);
            setTimeout(() => a.remove(), 2000);
          }
        } catch {}
      }}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick?.();
      }}
      variant="outline"
      className={cn(
        "bg-transparent rounded-full border-transparent px-3.5 text-lg transition-colors",
        // hover -> #fab803 + white
        "hover:bg-[#fab803] hover:text-white",
        // active keeps black
        isActive && "bg-black text-white hover:bg-black hover:text-white"
      )}
    >
      {children}
    </Button>
  );
};

const navbarItems = [
  { href: "/", children: "Home" },
  { href: "/about", children: "About us" },
  { href: "/pricing", children: "Pricing" },
  { href: "/terms-and-conditions", children: "Terms & Conditions" },
];

export const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const trpc = useTRPC();
  const logout = useMutation(trpc.auth.logout.mutationOptions());
  const session = useQuery(trpc.auth.session.queryOptions());
  const queryClient = useQueryClient();

  return (
    <nav className="h-20 flex border-b justify-between font-medium bg-white">
      {/* Logo */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          try {
            router.replace("/");
            setTimeout(() => {
              if (window.location.pathname !== "/") window.location.href = "/";
            }, 100);
          } catch {
            window.location.href = "/";
          }
        }}
        className="pl-6 flex items-center bg-transparent border-0 cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <Image
            src="/2025-03-12-67d0edc2d777e.webp"
            alt="Obazaar"
            width={180}
            height={54}
            className="h-12 w-auto"
            priority
          />
        </div>
      </button>

      <NavbarSidebar
        items={navbarItems}
        open={isSidebarOpen}
        onOpenChange={setIsSidebarOpen}
      />

      {/* Desktop nav items */}
      <div className="items-center gap-4 hidden lg:flex">
        {navbarItems.map((item) => (
          <NavbarItem
            key={item.href}
            href={item.href}
            isActive={pathname === item.href}
            onClick={() => {
              try {
                if (item.href === "/") router.replace("/");
                else router.push(item.href);
                setTimeout(() => {
                  if (window.location.pathname !== item.href) {
                    window.location.href = item.href;
                  }
                }, 100);
              } catch {
                window.location.href = item.href;
              }
            }}
          >
            {item.children}
          </NavbarItem>
        ))}
      </div>

      {/* Authenticated */}
      {session.data?.user ? (
        // reserve auth area width to avoid layout shift when session resolves
        <div className="hidden lg:flex min-w-[420px] justify-end">
          {(session.data.user.roles?.includes("super-admin") ||
            (session.data.user.tenants &&
              session.data.user.tenants.length > 0)) && (
            <Button
              onClick={() => {
                try {
                  router.push("/admin");
                  setTimeout(() => {
                    if (window.location.pathname !== "/admin") {
                      window.location.href = "/admin";
                    }
                  }, 100);
                } catch {
                  window.location.href = "/admin";
                }
              }}
              className="border-l border-t-0 border-b-0 border-r-0 px-12 h-full rounded-none bg-black text-white hover:bg-[#fab803] hover:text-white transition-colors text-lg"
            >
              Dashboard
            </Button>
          )}
          <Button
            onClick={() => {
              setIsLoggingOut(true);
              try {
                logout.mutate(undefined, {
                  onError: () => {
                    toast.error("Logout failed. Please try again.");
                    setIsLoggingOut(false);
                  },
                  onSuccess: async () => {
                    await queryClient.invalidateQueries(
                      trpc.auth.session.queryFilter()
                    );
                    toast.success("Logged out successfully.");
                    try {
                      router.replace("/");
                      setTimeout(() => {
                        if (window.location.pathname !== "/") {
                          window.location.href = "/";
                        }
                      }, 100);
                    } catch {
                      window.location.href = "/";
                    }
                    setIsLoggingOut(false);
                  },
                });
              } catch {
                toast.error("An unexpected error occurred.");
                setIsLoggingOut(false);
              }
            }}
            disabled={isLoggingOut}
            className="border-l border-t-0 border-b-0 border-r-0 px-12 h-full rounded-none bg-red-500 text-white hover:bg-[#fab803] hover:text-white transition-colors text-lg"
          >
            {isLoggingOut ? "Logging out..." : "Log Out"}
          </Button>
        </div>
      ) : (
        <div className="hidden lg:flex min-w-[300px] justify-end">
          <Button
            onClick={() => {
              try {
                router.push("/sign-in");
                setTimeout(() => {
                  if (window.location.pathname !== "/sign-in") {
                    window.location.href = "/sign-in";
                  }
                }, 100);
              } catch {
                window.location.href = "/sign-in";
              }
            }}
            variant="secondary"
            className="border-l border-t-0 border-b-0 border-r-0 px-8 h-full rounded-none bg-white hover:bg-[#fab803] hover:text-white transition-colors text-lg"
          >
            Log in
          </Button>
          <Button
            onClick={() => {
              try {
                router.push("/sign-up-front");
                setTimeout(() => {
                  if (window.location.pathname !== "/sign-up-front") {
                    window.location.href = "/sign-up-front";
                  }
                }, 100);
              } catch {
                window.location.href = "/sign-up-front";
              }
            }}
            className="border-l border-t-0 border-b-0 border-r-0 px-8 h-full rounded-none bg-black text-white hover:bg-[#fab803] hover:text-white transition-colors text-lg"
          >
            Sign up
          </Button>
        </div>
      )}

      {/* Mobile toggle */}
      <div className="flex lg:hidden items-center justify-center">
        <Button
          variant="ghost"
          className="size-12 border-transparent bg-white"
          onClick={() => setIsSidebarOpen(true)}
        >
          <MenuIcon />
        </Button>
      </div>
    </nav>
  );
};