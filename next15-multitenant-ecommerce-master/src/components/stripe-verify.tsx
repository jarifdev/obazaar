"use client";

import { Button, Link, useAuth } from "@payloadcms/ui";
import { isSuperAdmin } from "@/lib/access";

export const StripeVerify = () => {
  const { user } = useAuth();

  // Only show admin buttons to super-admins
  if (!user || !isSuperAdmin(user)) {
    return null;
  }

  return (
    <div style={{ display: "flex", gap: "0.5rem" }}>
      <Link href="/admin/collections/tenants?where[status][equals]=pending">
        <Button size="small">Pending Tenants</Button>
      </Link>
      <Link href="/admin/collections/tenants">
        <Button size="small" buttonStyle="secondary">
          All Tenants
        </Button>
      </Link>
      {/* Manage Payouts button hidden - not necessary */}
      {false && (
        <Link href="/admin/payouts">
          <Button size="small" buttonStyle="secondary">
            Manage Payouts
          </Button>
        </Link>
      )}
    </div>
  );
};
