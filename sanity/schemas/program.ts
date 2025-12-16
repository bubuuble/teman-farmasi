export default {
  name: 'program',
  title: 'Programs',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'rating',
      title: 'Rating',
      type: 'number',
      validation: (Rule: any) => Rule.required().min(0).max(5),
    },
    {
      name: 'students',
      title: 'Students Enrolled',
      type: 'number',
    },
    {
      name: 'duration',
      title: 'Duration',
      type: 'string',
    },
    {
      name: 'sessions',
      title: 'Number of Sessions',
      type: 'number',
    },
    {
      name: 'features',
      title: 'Features',
      type: 'array',
      of: [{ type: 'string' }],
    },
    {
      name: 'price',
      title: 'Price',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'bgColor',
      title: 'Background Color Class',
      type: 'string',
      options: {
        list: [
          { title: 'Yellow', value: 'bg-brand-yellow' },
          { title: 'Pink', value: 'bg-brand-pink' },
          { title: 'Blue', value: 'bg-brand-blue' },
        ],
      },
    },
    {
      name: 'tagColor',
      title: 'Tag Color',
      type: 'string',
      options: {
        list: [
          { title: 'Pink', value: 'bg-brand-pink' },
          { title: 'Blue', value: 'bg-brand-blue' },
          { title: 'Yellow', value: 'bg-brand-yellow' },
          { title: 'Purple', value: 'bg-brand-purple' },
          { title: 'Teal', value: 'bg-brand-teal' },
          { title: 'White', value: 'bg-brand-white' },
        ],
      },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'image',
      title: 'Featured Image',
      type: 'image',
      options: {
        hotspot: true,
      },
    },
    {
      name: 'featured',
      title: 'Featured on Homepage',
      type: 'boolean',
      initialValue: false,
      description: 'Toggle to display this program on the homepage',
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
      title: 'title',
      media: 'image',
      subtitle: 'price',
    },
  },
};
