import fastify from 'fastify'
import usersRoute from './routes/usersRoute'
import fastifyCookie from '@fastify/cookie'
import mealsRoute from './routes/mealsRoute'

export const app = fastify()

app.get('/health', async (_, reply) => {
  return reply.send('Server is alive')
})

app.register(fastifyCookie)

app.register(usersRoute, {
  prefix: 'users',
})

app.register(mealsRoute, {
  prefix: 'meals',
})
