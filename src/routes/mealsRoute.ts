import { FastifyInstance } from 'fastify'
import checkUserIdExists from '../middlewares/check-user-id-exists'
import knex from '../database/config'
import { randomUUID } from 'crypto'
import { mealParser } from '../utils/parsers/meal-parser'
import checkUserIdMatches from '../middlewares/check-user-id-matches'

export default async function mealsRoute(app: FastifyInstance) {
  app.addHook('preHandler', checkUserIdExists)
  app.post('/', async (request, reply) => {
    const { name, description, is_diety: isDiety, time } = mealParser(request)

    const { userId } = request.cookies

    await knex('meals').insert({
      id: randomUUID(),
      name,
      description,
      time,
      is_diety: isDiety,
      user_id: userId,
    })

    return reply.status(201).send()
  })

  app.put<{ Params: { id: string } }>(
    '/:id',
    { preHandler: [checkUserIdMatches] },
    async (request, reply) => {
      const { id } = request.params
      const { name, description, is_diety: isDiety, time } = mealParser(request)

      await knex('meals').where('id', id).update({
        name,
        description,
        time,
        is_diety: isDiety,
      })

      return reply.status(201).send()
    },
  )

  app.get('/', async (request, reply) => {
    const { userId } = request.cookies

    const meals = await knex('meals').where('user_id', userId).select('*')

    return reply.status(200).send({ meals })
  })

  app.get<{ Params: { id: string } }>(
    '/:id',
    { preHandler: [checkUserIdMatches] },
    async (request, reply) => {
      const { id } = request.params

      const meal = await knex('meals').where('id', id).select('*').first()

      return reply.status(200).send({ meal })
    },
  )

  app.delete<{ Params: { id: string } }>(
    '/:id',
    { preHandler: [checkUserIdMatches] },
    async (request, reply) => {
      const { id } = request.params

      await knex('meals').where('id', id).delete()

      return reply.status(204).send()
    },
  )
}
