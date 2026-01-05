export default {
  name: 'gallery',
  title: 'Instagram Gallery',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'Judul atau caption singkat untuk post ini',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'instagramUrl',
      title: 'Instagram Post URL',
      type: 'url',
      description: 'URL lengkap Instagram post (contoh: https://www.instagram.com/p/ABC123/)',
      validation: (Rule: any) => Rule.required().uri({
        scheme: ['http', 'https']
      }),
    },
    {
      name: 'image',
      title: 'Thumbnail Image',
      type: 'image',
      description: 'Upload screenshot/thumbnail dari Instagram post',
      options: {
        hotspot: true,
      },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
      description: 'Deskripsi singkat atau highlight dari post',
    },
    {
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Event', value: 'event' },
          { title: 'Student Success', value: 'success' },
          { title: 'Tips & Tutorial', value: 'tips' },
          { title: 'Behind The Scenes', value: 'bts' },
          { title: 'Announcement', value: 'announcement' },
          { title: 'Other', value: 'other' },
        ],
      },
    },
    {
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      initialValue: false,
      description: 'Tampilkan di section featured gallery',
    },
    {
      name: 'publishedAt',
      title: 'Published Date',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    },
    {
      name: 'order',
      title: 'Display Order',
      type: 'number',
      initialValue: () => Math.floor(Date.now() / 1000),
      description: 'Urutan tampilan (otomatis berdasarkan waktu dibuat)',
    },
  ],
  preview: {
    select: {
      title: 'title',
      media: 'image',
      category: 'category',
    },
    prepare(selection: any) {
      const { title, category } = selection;
      return {
        title: title,
        subtitle: category ? `Category: ${category}` : 'No category',
        media: selection.media,
      };
    },
  },
};
