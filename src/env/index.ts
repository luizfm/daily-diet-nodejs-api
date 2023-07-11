import { config } from 'dotenv'
import { z } from 'zod'

if (process.env.NODE_ENV === 'test') {
  config({ path: '.env.test' })
} else {
  config()
}

const envShape = z.object({
  NODE_ENV: z.enum(['test', 'development', 'production']).default('production'),
  DATABASE_URL: z.string(),
  DATABASE_CLIENT: z.string(),
  PORT: z.coerce.number().default(3333),
})

const _env = envShape.safeParse(process.env)

if (!_env.success) {
  console.log('Invalid enviroment variables', _env.error.format())

  throw new Error('Invalid enviroment variables')
}

export const env = _env.data
