import supertest from 'supertest'
import { app, server } from '../index'
import mongoose from 'mongoose'
const signupRoute = '/api/auth/signup'
const request = supertest

// beforeAll(async () => {
//   // add the populate over here
// })

afterAll(async () => {
  await mongoose.connection.close() // Close the MongoDB connection
  server.close() // Close the Express server
})

describe('TEST INVALID INPUTS', () => {
  describe('/api/auth/signup - MISSING INPUTS', () => {
    //should respond with 400
    test('should respond with 400 Bad request', async () => {
      const response = await request(app)
        .post(signupRoute)
        .send({ username: 'test' })
      expect(response.statusCode).toBe(400)
    })
  })
})

//   describe('/api/auth/signup - INVALID EMAIL FORMAT', () => {})

//   describe('/api/auth/signin', 'MISSING INPUTS', () => {})
// })

// describe('TEST NOT FOUND', () => {
//   describe('/api/auth/signin', () => {})

//   describe('')
// })

// describe('UNAUTHROIZED', () => {
//   describe('/api/user/update/:id ', () => {})
// })
