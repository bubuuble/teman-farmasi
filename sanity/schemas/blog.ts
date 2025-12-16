export default {
  name: 'blog',
  title: 'Blog Posts',
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
      name: 'date',
      title: 'Date',
      type: 'date',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Tips', value: 'Tips' },
          { title: 'Stats', value: 'Stats' },
          { title: 'Journal', value: 'Journal' },
          { title: 'Methodology', value: 'Methodology' },
          { title: 'Writing', value: 'Writing' },
          { title: 'Publication', value: 'Publication' },
          { title: 'Lab Skills', value: 'Lab Skills' },
          { title: 'Wellness', value: 'Wellness' },
        ],
      },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      rows: 3,
    },
    {
      name: 'author',
      title: 'Author',
      type: 'string',
    },
    {
      name: 'readTime',
      title: 'Read Time (minutes)',
      type: 'number',
    },
    {
      name: 'publishedAt',
      title: 'Published Date',
      type: 'date',
    },
    {
      name: 'featured',
      title: 'Featured Post',
      type: 'boolean',
      initialValue: false,
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
      name: 'content',
      title: 'Content',
      type: 'array',
      of: [{ type: 'block' }],
    },
  ],
  preview: {
    select: {
      title: 'title',
      media: 'image',
      subtitle: 'category',
    },
  },
};
