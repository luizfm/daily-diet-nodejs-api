import { Knex } from 'knex'

declare module 'knex/types/tables' {
  export interface Tables {
    users: {
      id: string
      name: string
      email: string
      created_at: string
    }
    meals: {
      id: string
      name: string
      description: string
      time: string
      is_diety: boolean
      created_at: string
      user_id: string
    }
  }
}
