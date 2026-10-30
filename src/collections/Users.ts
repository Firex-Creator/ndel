import type { CollectionConfig } from 'payload'

import { hasRole, isAdmin, isAdminField } from '@/access'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'Staff user', plural: 'Staff users' },
  auth: {
    tokenExpiration: 60 * 60 * 8,
    maxLoginAttempts: 5,
    lockTime: 15 * 60 * 1000,
    cookies: { sameSite: 'Lax', secure: process.env.NODE_ENV === 'production' },
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'roles'],
    group: 'Administration',
  },
  access: {
    admin: ({ req: { user } }) => hasRole(user, 'admin') || hasRole(user, 'editor'),
    create: isAdmin,
    delete: isAdmin,
    // Staff can see colleagues (needed to assign enquiries); only admins edit others.
    read: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user }, id }) => hasRole(user, 'admin') || (user ? user.id === id : false),
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    {
      name: 'roles',
      type: 'select',
      hasMany: true,
      required: true,
      defaultValue: ['editor'],
      saveToJWT: true,
      options: [
        { label: 'Administrator', value: 'admin' },
        { label: 'Editor', value: 'editor' },
      ],
      access: { create: isAdminField, update: isAdminField },
      admin: {
        description:
          'Administrators manage everything, including staff accounts and all enquiries. Editors manage website content and only the enquiries assigned to them.',
      },
    },
  ],
}
