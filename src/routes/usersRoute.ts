import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import knex from '../database/config'
import { randomUUID } from 'crypto'
import checkUserIdExists from '../middlewares/check-user-id-exists'

export default async function usersRoute(app: FastifyInstance) {
  app.post('/', async (request, reply) => {
    const userBodySchema = z.object({
      name: z.string(),
      email: z.string(),
    })

    const { name, email } = userBodySchema.parse(request.body)
    const userId = randomUUID()

    reply.cookie('userId', userId, {
      path: '/',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    })

    await knex('users').insert({ id: userId, name, email })

    return reply.status(200).send()
  })

  app.get('/', async (_, reply) => {
    const users = await knex('users').select('*')

    return reply.status(200).send({ users })
  })

  app.get(
    '/metrics',
    { preHandler: [checkUserIdExists] },
    async (request, reply) => {
      const { userId } = request.cookies

      const userMeals = await knex('meals').where('user_id', userId).select('*')

      const { bestMealSequence } = userMeals.reduce(
        (acc, meal) => {
          if (meal.is_diety) {
            if (acc.counterMealSequence++ >= acc.bestMealSequence) {
              acc.bestMealSequence = acc.counterMealSequence
            }
          } else {
            acc.counterMealSequence = 0
          }

          return acc
        },
        { bestMealSequence: 0, counterMealSequence: 0 },
      )

      const metrics = {
        totalMealsRegistered: userMeals.length,
        totalMealsOnDiety: userMeals.filter((meal) => meal.is_diety).length,
        totalMealsOutDiety: userMeals.filter((meal) => !meal.is_diety).length,
        bestDietyMealSequence: bestMealSequence,
      }

      return reply.status(200).send({ metrics })
    },
  )
}
