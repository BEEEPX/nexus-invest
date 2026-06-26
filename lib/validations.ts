import { z } from 'zod';

const LANG_REGEX = /^[a-z]{2}(-[A-Z]{2})?$/;
const CATEGORY_VALUES = ['markets', 'stocks', 'crypto', 'economy', 'real-estate', 'general'] as const;

export const newsQuerySchema = z.object({
  category: z.enum(CATEGORY_VALUES).optional().default('general'),
  lang: z.string().regex(LANG_REGEX).default('pt'),
  page: z.coerce.number().int().min(1).max(100).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(12),
  q: z.string().max(100).optional(),
  translate: z.enum(['true', 'false']).transform((v) => v === 'true').default('true'),
});

export const translateSchema = z.object({
  text: z.string().min(1).max(5000),
  from: z.string().regex(LANG_REGEX).optional(),
  to: z.string().regex(LANG_REGEX),
});

export type NewsQueryInput = z.infer<typeof newsQuerySchema>;
export type TranslateInput = z.infer<typeof translateSchema>;
