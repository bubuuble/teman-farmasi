export default {
  name: 'hero',
  title: 'Hero Section',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Main Title',
      type: 'string',
      description: 'Main headline (e.g., "Private Coaching")',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'titleLine2',
      title: 'Title Line 2',
      type: 'string',
      description: 'Second line (e.g., "for")',
    },
    {
      name: 'highlightedText',
      title: 'Highlighted Text',
      type: 'string',
      description: 'Text with special styling (e.g., "Pharmacy")',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'titleLine3',
      title: 'Title Line 3',
      type: 'string',
      description: 'Last line (e.g., "Research")',
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
      description: 'Subtitle/description text below the title',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'ctaText',
      title: 'CTA Button Text',
      type: 'string',
      description: 'Call to action button text (e.g., "Start Now")',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'emailPlaceholder',
      title: 'Email Input Placeholder',
      type: 'string',
      description: 'Placeholder for email input',
      initialValue: 'Enter your email',
    },
    {
      name: 'mainImage',
      title: 'Main Hero Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'secondaryImage',
      title: 'Secondary Image (Optional)',
      type: 'image',
      options: {
        hotspot: true,
      },
    },
    {
      name: 'successRate',
      title: 'Success Rate',
      type: 'string',
      description: 'e.g., "98.5%"',
      initialValue: '98.5%',
    },
    {
      name: 'studentRating',
      title: 'Student Rating',
      type: 'string',
      description: 'e.g., "5.0/5.0"',
      initialValue: '5.0/5.0',
    },
    {
      name: 'footerNote',
      title: 'Footer Note',
      type: 'string',
      description: 'Small text at bottom (e.g., "* Largest Pharmacy Research Community...")',
    },
  ],
  preview: {
    select: {
      title: 'title',
      media: 'mainImage',
      subtitle: 'description',
    },
  },
};
