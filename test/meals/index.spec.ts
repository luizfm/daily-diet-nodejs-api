import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { app } from '../../src/app'
import { execSync } from 'child_process'
import request from 'supertest'

describe('Meals route tests', () => {
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

  it('should be able to create a meal', async () => {
    const createUserResponse = await request(app.server).post('/users').send({
      name: 'Luiz Fernando',
      email: 'luiz.teste@gmail.com',
    })

    const cookies = createUserResponse.get('Set-Cookie')

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookies)
      .send({
        name: 'My meal 1',
        description: 'My description 1',
        time: '2023-07-11T18:33:38.490Z',
        is_diety: true,
      })
      .expect(201)
  })

  it('should be able to edit a meal', async () => {
    const createUserResponse = await request(app.server).post('/users').send({
      name: 'Luiz Fernando',
      email: 'luiz.teste@gmail.com',
    })

    const cookies = createUserResponse.get('Set-Cookie')

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookies)
      .send({
        name: 'My meal 1',
        description: 'My description 1',
        time: '2023-07-11T18:33:38.490Z',
        is_diety: true,
      })
      .expect(201)

    const getMealResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies)

    const mealId = getMealResponse.body.meals[0].id

    await request(app.server)
      .put(`/meals/${mealId}`)
      .set('Cookie', cookies)
      .send({
        name: 'My meal 1 - Edited',
        description: 'My description 1 - Edited',
        time: '2023-07-11T18:33:38.490Z',
        is_diety: true,
      })
      .expect(201)
  })

  it('should be able to delete a meal', async () => {
    const createUserResponse = await request(app.server).post('/users').send({
      name: 'Luiz F',
      email: 'luiz.teste@gmail.com',
    })

    const cookies = createUserResponse.get('Set-Cookie')

    await request(app.server).post('/meals').set('Cookie', cookies).send({
      name: 'My meal 1',
      description: 'My description 1',
      time: '2023-07-11T18:33:38.490Z',
      is_diety: true,
    })

    const getAllMealsByUserResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies)

    const mealId = getAllMealsByUserResponse.body.meals[0].id

    await request(app.server)
      .del(`/meals/${mealId}`)
      .set('Cookie', cookies)
      .expect(204)
  })

  it('should be able to get meal by id.', async () => {
    const createUserResponse = await request(app.server).post('/users').send({
      name: 'Luiz F',
      email: 'luiz.teste@gmail.com',
    })

    const cookies = createUserResponse.get('Set-Cookie')

    await request(app.server).post('/meals').set('Cookie', cookies).send({
      name: 'My meal 1',
      description: 'My description 1',
      time: '2023-07-11T18:33:38.490Z',
      is_diety: true,
    })

    const getAllMealsByUserResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies)

    const mealId = getAllMealsByUserResponse.body.meals[0].id

    const getMealByIdResponse = await request(app.server)
      .get(`/meals/${mealId}`)
      .set('Cookie', cookies)
      .expect(200)

    expect(getMealByIdResponse.body).toEqual({
      meal: expect.objectContaining({
        name: expect.any(String),
        description: expect.any(String),
        time: expect.any(String),
        is_diety: expect.any(Number),
      }),
    })
  })
})
