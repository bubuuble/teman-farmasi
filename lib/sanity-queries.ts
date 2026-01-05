import { client } from './sanity';

export async function getAllBlogPosts() {
  const query = `*[_type == "blog"] | order(date desc) {
    _id,
    title,
    slug,
    date,
    category,
    excerpt,
    author,
    readTime,
    publishedAt,
    featured,
    image,
    content
  }`;
  return await client.fetch(query);
}

export async function getBlogPost(slug: string) {
  const query = `*[_type == "blog" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    date,
    category,
    excerpt,
    author,
    readTime,
    publishedAt,
    featured,
    image,
    content
  }`;
  return await client.fetch(query, { slug });
}

export async function getAllPrograms() {
  const query = `*[_type == "program"] | order(order asc) {
    _id,
    title,
    slug,
    description,
    rating,
    students,
    duration,
    sessions,
    features,
    price,
    tagColor,
    bgColor,
    image,
    featured,
    order
  }`;
  return await client.fetch(query);
}

export async function getProgram(slug: string) {
  const query = `*[_type == "program" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    description,
    rating,
    students,
    price,
    tagColor,
    image
  }`;
  return await client.fetch(query, { slug });
}

export async function getAllMentors() {
  const query = `*[_type == "mentor"] | order(order asc) {
    _id,
    name,
    slug,
    role,
    rating,
    reviews,
    cardColor,
    borderColor,
    expertise,
    image,
    bio,
    featured,
    order
  }`;
  return await client.fetch(query);
}

export async function getMentor(slug: string) {
  const query = `*[_type == "mentor" && slug.current == $slug][0] {
    _id,
    name,
    slug,
    role,
    rating,
    reviews,
    cardColor,
    image,
    bio
  }`;
  return await client.fetch(query, { slug });
}

export async function getAllTestimonials() {
  const query = `*[_type == "testimonial"] | order(order asc) {
    _id,
    name,
    role,
    text,
    image,
    cardColor,
    featured,
    order
  }`;
  return await client.fetch(query);
}

// Featured items for homepage
export async function getFeaturedBlogPosts() {
  const query = `*[_type == "blog" && featured == true] | order(date desc) [0...3] {
    _id,
    title,
    slug,
    date,
    category,
    excerpt,
    author,
    readTime,
    publishedAt,
    featured,
    image,
    content
  }`;
  return await client.fetch(query);
}

export async function getFeaturedPrograms() {
  const query = `*[_type == "program" && featured == true] | order(order asc) [0...4] {
    _id,
    title,
    slug,
    description,
    rating,
    students,
    duration,
    sessions,
    features,
    price,
    tagColor,
    bgColor,
    image,
    featured,
    order
  }`;
  return await client.fetch(query);
}

export async function getFeaturedMentors() {
  const query = `*[_type == "mentor" && featured == true] | order(order asc) [0...4] {
    _id,
    name,
    slug,
    role,
    rating,
    reviews,
    cardColor,
    borderColor,
    expertise,
    image,
    bio,
    featured,
    order
  }`;
  return await client.fetch(query);
}

export async function getFeaturedTestimonials() {
  const query = `*[_type == "testimonial" && featured == true] | order(order asc) [0...3] {
    _id,
    name,
    role,
    text,
    image,
    cardColor,
    featured,
    order
  }`;
  return await client.fetch(query);
}

export async function getHeroContent() {
  const query = `*[_type == "hero"][0] {
    _id,
    title,
    titleLine2,
    highlightedText,
    titleLine3,
    description,
    ctaText,
    emailPlaceholder,
    mainImage,
    secondaryImage,
    successRate,
    studentRating,
    footerNote
  }`;
  return await client.fetch(query);
}

// ============================================
// GALLERY QUERIES
// ============================================

export async function getAllGalleryItems() {
  const query = `*[_type == "gallery"] | order(publishedAt desc) {
    _id,
    title,
    instagramUrl,
    image,
    description,
    category,
    featured,
    publishedAt,
    order
  }`;
  return client.fetch(query);
}

export async function getFeaturedGalleryItems() {
  const query = `*[_type == "gallery" && featured == true] | order(publishedAt desc) [0...6] {
    _id,
    title,
    instagramUrl,
    image,
    description,
    category,
    featured,
    publishedAt
  }`;
  return client.fetch(query);
}

export async function getGalleryByCategory(category: string) {
  const query = `*[_type == "gallery" && category == $category] | order(publishedAt desc) {
    _id,
    title,
    instagramUrl,
    image,
    description,
    category,
    publishedAt
  }`;
  return client.fetch(query, { category });
}
