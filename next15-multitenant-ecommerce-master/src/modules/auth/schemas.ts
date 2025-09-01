import z from "zod";

export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be less than 20 characters")
    .regex(
      /^[a-z0-9-]+$/,
      "Username can only contain lowercase letters, numbers, and hyphens"
    ),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z
    .string()
    .min(8, "Phone number must be at least 8 digits")
    .regex(
      /^[\+]?[\d\s\-\(\)]{8,15}$/,
      "Please enter a valid phone number (8-15 digits, may include +, spaces, dashes, parentheses)"
    ),
  storeName: z.string().min(2, "Store name must be at least 2 characters"),
  isBusinessRegistered: z
    .boolean({
      required_error: "You must confirm your business registration status",
    })
    .refine((val) => val === true, {
      message: "You must have a registered business to create a vendor account",
    }),
  businessCRNumber: z
    .string()
    .regex(/^\d{6,12}$/, "CR Number must be 6-12 digits")
    .min(6, "CR Number must be at least 6 digits")
    .max(12, "CR Number must be at most 12 digits"),
});

// Simple customer registration schema
export const customerRegisterSchema = z.object({
  email: z.string().email("Invalid email address"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be less than 20 characters")
    .regex(
      /^[a-z0-9-]+$/,
      "Username can only contain lowercase letters, numbers, and hyphens"
    ),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z
    .string()
    .min(8, "Phone number must be at least 8 digits")
    .regex(
      /^[\+]?[\d\s\-\(\)]{8,15}$/,
      "Please enter a valid phone number (8-15 digits, may include +, spaces, dashes, parentheses)"
    ),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});
