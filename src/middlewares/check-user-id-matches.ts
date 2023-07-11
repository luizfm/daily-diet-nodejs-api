import { FastifyReply, FastifyRequest } from 'fastify'
import knex from '../database/config'

type RequestParams = {
  id: string
}

export default async function checkUserIdMatches(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { id } = request.params as RequestParams
  const { userId } = request.cookies

  const mealUserId = await knex('meals').where('id', id).select('user_id')

  if (userId !== mealUserId[0].user_id) {
    return reply.status(404).send('Meal not found')
  }
}
