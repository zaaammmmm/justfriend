import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const privacyFields = {
  // Build gagal bila konten pribadi belum memiliki persetujuan.
  consent: z.literal(true),
  hidden: z.boolean().default(false),
  // Penanda konten seed sintetis; wajib diganti sebelum rilis.
  placeholder: z.boolean().default(false),
};

const members = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/members' }),
  schema: ({ image }) => z.object({
    name: z.string().min(1),
    nickname: z.string().min(1),
    fact: z.string().max(120),
    role: z.string().default('ANGGOTA'),
    quote: z.string().max(120),
    photo: image(),
    alt: z.string().min(5),
    signature: z.string().optional(),
    signaturePath: z.string().optional(),
    ...privacyFields,
  }),
});

const moments = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/moments' }),
  schema: ({ image }) => z.object({
    slug: z.string().regex(/^[a-z0-9-]+$/),
    date: z.string().regex(/^\d{4}(-\d{2})?(-\d{2})?$/),
    dateLabel: z.string().min(1),
    title: z.string().min(1),
    story: z.string().max(600),
    photo: image(),
    alt: z.string().min(5),
    showInTimeline: z.boolean().default(false),
    featured: z.boolean().default(false),
    caption: z.string().optional(),
    ...privacyFields,
  }),
});

const jokes = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/jokes' }),
  schema: z.object({
    quote: z.string().min(1).max(80),
    order: z.number().int().positive(),
    ...privacyFields,
  }),
});

const gallery = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/gallery' }),
  schema: ({ image }) => z.object({
    photo: image(),
    alt: z.string().min(5),
    caption: z.string().min(1).max(100),
    order: z.number().int().positive(),
    rotation: z.number().min(-5).max(5).default(0),
    ...privacyFields,
  }),
});

const videos = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/videos' }),
  schema: ({ image }) => z.object({
    slug: z.string().regex(/^[a-z0-9-]+$/),
    title: z.string().min(1),
    kind: z.enum(['ambient', 'story']),
    poster: image(),
    mp4: z.string().min(1),
    webm: z.string().optional(),
    aspect: z.string().default('16/9'),
    hasSpeech: z.boolean().default(false),
    transcript: z.string().optional(),
    captions: z.string().optional(),
    sourceReady: z.boolean().default(false),
    ...privacyFields,
  }).refine((video) => !video.hasSpeech || Boolean(video.transcript || video.captions), {
    message: 'Transkrip atau caption wajib bila video memiliki ucapan.',
    path: ['transcript'],
  }),
});

export const collections = { members, moments, jokes, gallery, videos };
