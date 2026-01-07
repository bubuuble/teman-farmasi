// schemas/ebook.ts
export default {
  name: 'ebook',
  title: 'E-Books',
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
      rows: 4,
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'category',
      title: 'Category',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        list: [
          { title: 'Article', value: 'Article' },
          { title: 'Book', value: 'Book' },
          { title: 'Academic Writing', value: 'Academic Writing' },
          { title: 'Chemistry', value: 'Chemistry' },
          { title: 'Cosmetic Formulation', value: 'Cosmetic Formulation' },
          { title: 'Cosmetic Sciences', value: 'Cosmetic Sciences' },
          { title: 'Farmasetika', value: 'Farmasetika' },
          { title: 'Farmakologi', value: 'Farmakologi' },
          { title: 'Farmasi Klinik', value: 'Farmasi Klinik' },
          { title: 'International Programs', value: 'International Programs' },
          { title: 'Kimia Farmasi', value: 'Kimia Farmasi' },
          { title: 'Lainnya', value: 'Lainnya' },
          { title: 'Metodologi Penelitian', value: 'Metodologi Penelitian' },
          { title: 'Microbiology', value: 'Microbiology' },
          { title: 'Natural Products', value: 'Natural Products' },
          { title: 'Pharmacology', value: 'Pharmacology' },
          { title: 'Pharmapreneur', value: 'Pharmapreneur' },
          { title: 'Public Education', value: 'Public Education' },
          { title: 'R&D', value: 'R&D' },
          { title: 'Research', value: 'Research' },
          { title: 'Statistika', value: 'Statistika' },
        ],
      },
      validation: (Rule: any) => Rule.required().min(1),
    },
    {
      name: 'author',
      title: 'Author',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'coverImage',
      title: 'Cover Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'pdfFile',
      title: 'PDF File',
      type: 'file',
      options: {
        accept: '.pdf',
      },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'pages',
      title: 'Number of Pages',
      type: 'number',
    },
    {
      name: 'fileSize',
      title: 'File Size (MB)',
      type: 'string',
      description: 'e.g., "2.5 MB"',
    },
    {
      name: 'publishedAt',
      title: 'Published Year',
      type: 'number',
      validation: (Rule: any) => Rule.required().min(2000).max(2100),
      description: 'e.g., 2024',
    },
    {
      name: 'featured',
      title: 'Featured E-Book',
      type: 'boolean',
      initialValue: false,
    },
    {
      name: 'downloads',
      title: 'Download Count',
      type: 'number',
      initialValue: 0,
      readOnly: true,
    },
  ],
  preview: {
    select: {
      title: 'title',
      author: 'author',
      media: 'coverImage',
    },
    prepare(selection: any) {
      const { title, author } = selection;
      return {
        title: title,
        subtitle: `by ${author}`,
        media: selection.media,
      };
    },
  },
};
