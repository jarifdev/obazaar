// src/seed.ts
import { getPayload } from "payload";
import config from "@payload-config";

const categories = [
    {
    name: "All",
    slug: "all",
  },
  { name: "Flowers", slug: "flowers" },
  { name: "Food & Sweets", slug: "food-sweets" },

  {
    name: "Home & Living",
    slug: "home-living",
    subcategories: [
      { name: "Home Decor", slug: "home-decor" },
      { name: "Furniture", slug: "furniture" },
      { name: "Kitchen & Dining", slug: "kitchen-dining" },
      { name: "Bedding & Textiles", slug: "bedding-textiles" },
    ],
  },

  {
    name: "Fashion & Clothes",
    slug: "fashion-clothes",
    subcategories: [
      { name: "Women Clothing", slug: "women-clothing" },
      { name: "Men clothing", slug: "men-clothing" },
      { name: "Kids and Babies", slug: "kids-babies" },
      { name: "Islamic wear", slug: "islamic-wear" },
      { name: "Fashion Wearables", slug: "fashion-wearables" },
      { name: "Fashion Accessories", slug: "fashion-accessories" },
    ],
  },

  { name: "Office Supplies & Stationary", slug: "office-supplies-stationary" },
  { name: "Books", slug: "books" },

  {
    name: "Jewelry & Accessories",
    slug: "jewelry-accessories",
    subcategories: [
      { name: "Jewelry", slug: "jewelry" },
      { name: "Jewelry Accessories", slug: "jewelry-accessories-sub" },
    ],
  },

  {
    name: "Beauty & Personal Care",
    slug: "beauty-personal-care",
    subcategories: [
      { name: "Skin Care", slug: "skin-care" },
      { name: "Hair Care", slug: "hair-care" },
      { name: "Perfumes", slug: "perfumes" },
      { name: "Makeup", slug: "makeup" },
    ],
  },

  { name: "Handmade & Crafts", slug: "handmade-crafts" },
  { name: "Gifts & Occasions", slug: "gifts-occasions" },
  { name: "Cleaning & Household", slug: "cleaning-household" },

  {
    name: "Kids & Toys",
    slug: "kids-toys",
    subcategories: [
      { name: "Educational Toys", slug: "educational-toys" },
      { name: "Plush & Dolls", slug: "plush-dolls" },
      { name: "Creative Kits", slug: "creative-kits" },
    ],
  },

  {
    name: "Electronics & Gadgets",
    slug: "electronics-gadgets",
    subcategories: [
      { name: "Mobile Accessories", slug: "mobile-accessories" },
      { name: "Tech Wearables", slug: "tech-wearables" },
      { name: "Small Gadgets", slug: "small-gadgets" },
    ],
  },

  { name: "Shoes", slug: "shoes" },
  { name: "Health & Wellness", slug: "health-wellness" },
  { name: "Services & Digital Products", slug: "services-digital-products" },
];

const seed = async () => {
  const payload = await getPayload({ config });

  // Check if admin tenant already exists
  const existingAdminTenant = await payload.find({
    collection: "tenants",
    where: { slug: { equals: "admin" } },
  });

  let adminTenant;
  if (existingAdminTenant.docs.length === 0) {
    // Admin tenant (no Stripe)
    adminTenant = await payload.create({
      collection: "tenants",
      data: {
        name: "admin",
        slug: "admin",
        isBusinessRegistered: false,
        businessCRNumber: "",
        businessVerified: false,
        status: "approved", // or another valid status value
      },
    });
  } else {
    adminTenant = existingAdminTenant.docs[0];
  }

  // Check if admin user already exists
  const existingAdminUser = await payload.find({
    collection: "users",
    where: { email: { equals: "admin@demo.com" } },
  });

  if (existingAdminUser.docs.length === 0) {
    // Admin user
    await payload.create({
      collection: "users",
      data: {
        email: "admin@demo.com",
        password: "demo",
        roles: ["super-admin"],
        username: "admin",
        tenants: [{ tenant: adminTenant!.id }],
      },
    });
  }

  // Seed categories & subcategories
  for (const category of categories) {
    // Check if category already exists
    const existingCategory = await payload.find({
      collection: "categories",
      where: { slug: { equals: category.slug } },
    });

    let parentCategory;
    if (existingCategory.docs.length === 0) {
      parentCategory = await payload.create({
        collection: "categories",
        data: {
          name: category.name,
          slug: category.slug,
          color: (category as any).color, // optional; omitted in list
          parent: null,
        },
      });
    } else {
      parentCategory = existingCategory.docs[0];
    }

    for (const sub of (category as any).subcategories || []) {
      // Check if subcategory already exists
      const existingSubcategory = await payload.find({
        collection: "categories",
        where: { slug: { equals: sub.slug } },
      });

      if (existingSubcategory.docs.length === 0) {
        await payload.create({
          collection: "categories",
          data: {
            name: sub.name,
            slug: sub.slug,
            parent: parentCategory!.id,
          },
        });
      }
    }
  }
};

try {
  await seed();
  console.log("Seeding completed successfully");
  process.exit(0);
} catch (error) {
  console.error("Error during seeding:", error);
  process.exit(1);
}
