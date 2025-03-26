import supertest from 'supertest'
import { app, server } from '../index'
import mongoose from 'mongoose'
import { cleanUpMock } from '../cleanupMock'
import connectMongoDB from '../config/mongoose'
import { populateWithMock } from '../populate'

const signupRoute = '/api/auth/signup'
const request = supertest(app)
let users = []

beforeAll(async () => {
  try {
    users = await populateWithMock()
  } catch (err) {
    console.error('Error in beforeAll:', err)
  }
})

afterAll(async () => {
  try {
    await cleanUpMock()
    await mongoose.connection.close()
    console.log('MongoDB connection closed.')

    await new Promise((resolve, reject) => {
      server.close((err) => {
        if (err) return reject(err)
        console.log('Express server closed.')
        resolve()
      })
    })
  } catch (err) {
    console.error('Error in afterAll:', err)
  }
})

describe('TEST INVALID INPUTS', () => {
  describe('/api/auth/signup - MISSING INPUTS', () => {
    test('should respond with 400 Bad request', async () => {
      const response = await request
        .post(signupRoute)
        .send({ username: 'test' })
      expect(response.statusCode).toBe(400)
      console.log(users)
    })

    test('should specify content-type header', async () => {
      const response = await request
        .post(signupRoute)
        .send({ username: 'test' })
      expect(response.headers['content-type']).toContain('application/json')
    })
  })
})
