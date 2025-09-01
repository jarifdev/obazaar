import { isSuperAdmin } from '@/lib/access'
import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    create: () => true,
    read: () => true,
    update: () => true,
    delete: ({ req }) => isSuperAdmin(req.user),
  },
  hooks: {
    beforeChange: [
      ({ req, data }) => {
        // If no tenant is assigned and user has at least one tenant
        if (!data.tenant && req.user?.tenants?.[0]?.tenant) {
          const tenant = req.user.tenants[0].tenant;
          data.tenant = typeof tenant === 'object' && 'id' in tenant ? tenant.id : tenant;
        }
        return data;
      }
    ]
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: false,
    }
  ],
  upload: {
    mimeTypes: ['image/*'],
  },
}
