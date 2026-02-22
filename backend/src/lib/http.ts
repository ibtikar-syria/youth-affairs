import type { Context } from 'hono'

export const parseJsonBody = async <T>(c: Context): Promise<T | null> => {
  try {
    return (await c.req.json()) as T
  } catch {
    return null
  }
}

export const badRequest = (c: Context, error: string) => c.json({ error }, 400)