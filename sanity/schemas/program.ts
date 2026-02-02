// schemas/program.ts
export default {
  name: 'program',
  title: 'Programs',
  type: 'document',
  fields: [
    { name: 'title', title: 'Title', type: 'string', validation: (Rule: any) => Rule.required() },
    { name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title' }, validation: (Rule: any) => Rule.required() },
    {
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'PharmaCore Class', value: 'pharmacore' },
          { title: 'Pharma Research Mentoring', value: 'research' },
          { title: 'PharmaPublish Academy', value: 'publish' },
          { title: 'Pharma Impact', value: 'impact' },
          { title: 'OBATIN Class', value: 'obatin' },
        ],
      },
      validation: (Rule: any) => Rule.required()
    },
    { name: 'description', title: 'Description', type: 'text', rows: 4 },
    {
      name: 'subjects',
      title: 'Subjects / Course List',
      type: 'array',
      of: [{ type: 'string' }],
      hidden: ({ document }: any) => document?.category !== 'pharmacore'
    },
    
    {
      name: 'tiers',
      title: 'Pricing Tiers',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          { name: 'name', title: 'Tier Name', type: 'string' },
          { name: 'price', title: 'Price', type: 'string' },
          { name: 'features', title: 'Tier Features', type: 'array', of: [{ type: 'string' }] }
        ]
      }],
      // Tiers muncul untuk kategori 'research', 'publish', dan 'impact'
      hidden: ({ document }: any) => !['research', 'publish', 'impact'].includes(document?.category)
    },
    
    {
      name: 'benefits',
      title: 'Benefits (untuk OBATIN Class)',
      type: 'array',
      of: [{ type: 'string' }],
      hidden: ({ document }: any) => document?.category !== 'obatin'
    },
    
    { name: 'price', title: 'Starting Price (Label)', type: 'string' },
    { name: 'rating', title: 'Rating', type: 'number', initialValue: 5 },
    { name: 'students', title: 'Students Enrolled', type: 'number' },
  ],
};