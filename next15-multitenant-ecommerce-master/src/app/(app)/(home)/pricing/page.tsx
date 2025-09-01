// src/app/(app)/(home)/pricing/page.tsx
"use client";

import Link from "next/link";
import {
  Store,
  Rocket,
  Megaphone,
  CreditCard,
  Truck,
  PackageSearch,
  UsersRound,
  Sparkles,
  GraduationCap,
  HelpCircle,
  Boxes,
  ArrowRight,
} from "lucide-react";

const sellerFeatures = [
  { icon: Store, text: "Storefront inside Obazaar" },
  { icon: PackageSearch, text: "Unlimited product uploads" },
  { icon: CreditCard, text: "Secure payments handled by Obazaar" },
  { icon: Truck, text: "Delivery via partner couriers" },
  { icon: Megaphone, text: "Included in platform-wide marketing" },
  { icon: Megaphone, text: "No subscription — commission only" },
];

const ecosystemFeatures = [
  { icon: UsersRound, text: "Supplier access (curated)" },
  { icon: Sparkles, text: "Brand identity & highlighted placement" },
  { icon: Megaphone, text: "1 free monthly promotional boost" },
  { icon: GraduationCap, text: "Monthly seminars & webinars" },
  { icon: HelpCircle, text: "Free 1:1 business consultations" },
  { icon: Boxes, text: "Storage options (planned add-on)" },
];

export default function Page() {
  return (
    <div
      className="min-h-screen relative overflow-hidden bg-cover bg-center"
      style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,0.85), rgba(255,255,255,0.85)), url('/about-bg.png')`,
      }}
    >
      {/* subtle dark overlay to make background a bit darker */}
      <div aria-hidden className="absolute inset-0 bg-black/10" />
      <section className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-14">
        <div className="text-center">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Choose your plan
          </h1>
          <p className="mt-2 text-neutral-600">Start simple or unlock growth tools.</p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Seller Card */}
          <Card>
            <CardHeader
              title="Obazaar Seller"
              subtitle="List products — pay only when you sell"
              priceLabel="Free"
              priceNote="to join"
              badge=""
              icon={Store}
            />
            <FeatureList items={sellerFeatures} />
            <CardCta href="/auth/register?seller=true" variant="brand">
              Get started free
            </CardCta>
          </Card>

          {/* Ecosystem Card */}
          <Card className="ring-2 ring-black/5">
            <CardHeader
              title="Obazaar Ecosystem"
              subtitle="Growth toolkit & priority visibility"
              priceLabel="35 OMR"
              priceNote="per month"
              badge="Most Popular"
              icon={Rocket}
            />
            <FeatureList items={ecosystemFeatures} />
            <CardCta href="/auth/register?ecosystem=true" variant="brand">
              Start 14-day trial
            </CardCta>
          </Card>
        </div>
      </section>
    </div>
  );
}

/* ---------- UI primitives ---------- */

function Card({
  children,
  className = "",
}: React.PropsWithChildren<{ className?: string }>) {
  return (
    <div className={`rounded-2xl border bg-white shadow-sm ${className}`}>
      {children}
    </div>
  );
}

function CardHeader({
  title,
  subtitle,
  priceLabel,
  priceNote,
  badge,
  icon: Icon,
}: {
  title: string;
  subtitle: string;
  priceLabel: string;
  priceNote?: string;
  badge?: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="relative border-b p-6">
      {badge ? (
        <div className="absolute right-4 top-4 inline-flex items-center rounded-full bg-[#1c476f] px-2 py-1 text-xs font-medium text-white shadow">
          {badge}
        </div>
      ) : null}
      <div className="flex items-center gap-2">
        <Icon className="h-5 w-5" />
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      <p className="mt-1 text-sm text-neutral-600">{subtitle}</p>
      <div className="mt-6 flex items-baseline gap-2">
        <span className="text-3xl font-semibold">{priceLabel}</span>
        {priceNote ? <span className="text-sm text-neutral-500">{priceNote}</span> : null}
      </div>
    </div>
  );
}

function FeatureList({
  items,
}: {
  items: { icon: React.ComponentType<{ className?: string }>; text: string }[];
}) {
  return (
    <ul className="grid gap-3 p-6">
      {items.map(({ icon: Icon, text }) => (
        <li key={text} className="flex items-start gap-3">
          <div className="mt-0.5 rounded-full border bg-white p-1">
            <Icon className="h-4 w-4" />
          </div>
          <span className="text-sm">{text}</span>
        </li>
      ))}
    </ul>
  );
}

function CardCta({
  href,
  children,
  variant = "dark",
}: {
  href: string;
  children: React.ReactNode;
  variant?: "dark" | "brand";
}) {
  const base =
    "inline-flex w-full items-center justify-center rounded-lg px-4 py-2.5 transition";
  const styles =
    variant === "brand"
      ? "bg-[#1c476f] text-white hover:opacity-90"
      : "bg-black text-white hover:opacity-90";
  return (
    <div className="p-6 pt-0">
      <Link href={href} className={`${base} ${styles}`}>
        <span className="mr-2">{children}</span>
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
