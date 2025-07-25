import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    heroImage: z.string().optional(),
    author: z.string().default('Enes Sevinç'),
    tags: z.array(z.string()).default([]),
    category: z.enum(['ceza-hukuku', 'medeni-hukuk', 'idare-hukuku', 'anayasa-hukuku', 'genel']).default('genel'),
    readingTime: z.number().optional(),
    featured: z.boolean().default(false),
  }),
});

const arastirmalar = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    heroImage: z.string().optional(),
    author: z.string().default('Enes Sevinç'),
    tags: z.array(z.string()).default([]),
    category: z.enum(['ceza-hukuku', 'medeni-hukuk', 'idare-hukuku', 'anayasa-hukuku', 'genel']).default('genel'),
    readingTime: z.number().optional(),
    featured: z.boolean().default(false),
  }),
});

export const collections = { blog, arastirmalar };