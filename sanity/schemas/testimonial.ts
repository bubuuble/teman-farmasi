export default {
  name: 'testimonial',
  title: 'Testimonials',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'role',
      title: 'Role/Specialty',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'text',
      title: 'Testimonial',
      type: 'text',
      rows: 4,
      validation: (Rule: any) => Rule.required(),
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
      name: 'cardColor',
      title: 'Card Background Color',
      type: 'string',
      options: {
        list: [
          { title: 'Yellow', value: 'bg-brand-yellow' },
          { title: 'Pink', value: 'bg-brand-pink' },
          { title: 'Blue', value: 'bg-brand-blue' },
        ],
      },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'featured',
      title: 'Featured on Homepage',
      type: 'boolean',
      initialValue: false,
      description: 'Toggle to display this testimonial on the homepage',
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
