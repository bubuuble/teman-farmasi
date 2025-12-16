export default {
  name: 'mentor',
  title: 'Mentors',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 96,
      },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'role',
      title: 'Role/Specialty',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'rating',
      title: 'Rating',
      type: 'number',
      validation: (Rule: any) => Rule.required().min(0).max(5),
    },
    {
      name: 'reviews',
      title: 'Number of Reviews',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'cardColor',
      title: 'Card Background Color',
      type: 'string',
      options: {
        list: [
          { title: 'Pink', value: 'bg-brand-pink' },
          { title: 'Blue', value: 'bg-brand-blue' },
          { title: 'Yellow', value: 'bg-brand-yellow' },
          { title: 'Purple', value: 'bg-brand-purple' },
          { title: 'Teal', value: 'bg-brand-teal' },
        ],
      },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'borderColor',
      title: 'Border Color Class',
      type: 'string',
      initialValue: 'border-white',
    },
    {
      name: 'expertise',
      title: 'Areas of Expertise',
      type: 'array',
      of: [{ type: 'string' }],
    },
    {
      name: 'image',
      title: 'Profile Image',
      type: 'image',
      options: {
        hotspot: true,
      },
    },
    {
      name: 'bio',
      title: 'Bio',
      type: 'text',
      rows: 4,
    },
    {
      name: 'featured',
      title: 'Featured on Homepage',
      type: 'boolean',
      initialValue: false,
      description: 'Toggle to display this mentor on the homepage',
    },
    {
      name: 'order',
      title: 'Display Order',
      type: 'number',
      initialValue: () => Math.floor(Date.now() / 1000),
      description: 'Auto-generated based on creation time. Can be manually adjusted.',
    },
  ],
  preview: {
    select: {
      title: 'name',
      media: 'image',
      subtitle: 'role',
    },
  },
};
