import { FastifyRequest } from 'fastify'
import { z } from 'zod'

const mealsRequestBodySchema = z.object({
  name: z.string(),
  description: z.string(),
  time: z.string(),
  is_diety: z.boolean(),
})

type MealsType = z.infer<typeof mealsRequestBodySchema>

export const mealParser = (request: FastifyRequest): MealsType => {
  return mealsRequestBodySchema.parse(request.body)
}
