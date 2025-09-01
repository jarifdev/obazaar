import Stripe from "stripe";

// Stripe is now OPTIONAL - only for payment processing, not vendor verification
// You can leave this commented out if not using Stripe at all
/*
export const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-03-31.basil",
      typescript: true,
    })
  : null;
*/

// For now, export null to prevent errors
export const stripe = null;