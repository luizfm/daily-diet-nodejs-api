import { it, describe, beforeEach, beforeAll, afterAll, expect } from 'vitest'
import { execSync } from 'node:child_process'
import { app } from '../../src/app'
import request from 'supertest'

describe('Users routes test', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
  })

  it('should be able to create a user', async () => {
    await request(app.server)
      .post('/users')
      .send({
        name: 'Luiz Fernando',
        email: 'luiz.teste@gmail.com',
      })
      .expect(200)
  })

  it('should be able to get user metrics', async () => {
    const createUserResponse = await request(app.server)
      .post('/users')
      .send({
        name: 'Luiz Fernando',
        email: 'luiz.teste@gmail.com',
      })
      .expect(200)

    const cookies = createUserResponse.get('Set-Cookie')

    await request(app.server).post('/meals').set('Cookie', cookies).send({
      name: 'My meal 1',
      description: 'My description 1',
      time: '2023-07-11T18:33:38.490Z',
      is_diety: true,
    })

    await request(app.server).post('/meals').set('Cookie', cookies).send({
      name: 'My meal 2',
      description: 'My description 2',
      time: '2023-07-11T18:33:38.490Z',
      is_diety: false,
    })

    await request(app.server).post('/meals').set('Cookie', cookies).send({
      name: 'My meal 3',
      description: 'My description 3',
      time: '2023-07-11T18:33:38.490Z',
      is_diety: true,
    })

    const getUserMetricsResponse = await request(app.server)
      .get('/users/metrics')
      .set('Cookie', cookies)

    expect(getUserMetricsResponse.body).toEqual({
      metrics: expect.objectContaining({
        totalMealsRegistered: 3,
        totalMealsOnDiety: 2,
        totalMealsOutDiety: 1,
        bestDietyMealSequence: 1,
      }),
    })
  })
})
