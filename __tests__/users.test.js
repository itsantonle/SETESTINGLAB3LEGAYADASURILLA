import supertest from 'supertest'
import { app, server } from '../index'
import mongoose from 'mongoose'
import { cleanUpMock } from '../cleanupMock'
import { populateWithMock } from '../populate'
import User from '../models/user.model'

const signupRoute = '/api/auth/signup'
const signinRoute = '/api/auth/signin'
const request = supertest(app)
let users = []
let accessToken = ''
let invalidAccessToken = accessToken + 'invalid'
let testUser = {
  username: 'TestUser',
  email: 'testuser@test.com',
  password: 'testpassword',
}

beforeAll(async () => {
  try {
    await populateWithMock()
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

describe('TESTS FOR NON-PROTECTED ROUTES', () => {
  describe('TESTS FOR /api/auth/signup', () => {
    describe('HAPPY TESTS', () => {
      test('should create a user', async () => {
        const response = await request.post(signupRoute).send(testUser)
        expect(response.statusCode).toBe(201)
        expect(response.body.message).toBe('User created successfully')
      })

      test('should find the newly created user in the db', async () => {
        const testUserDB = await User.findOne({
          username: testUser.username,
        })
          .select('username -_id')
          .lean()
        expect(testUserDB).toEqual({ username: testUser.username })
      })
    })

    describe('SAD TESTS', () => {
      test('should return a return a 400 and validation error when there is a missing field upon submission', async () => {
        const response = await request
          .post(signupRoute)
          .send({ username: 'missing' })
        expect(response.statusCode).toBe(400)
        expect(response.body.message).toBe('Validation failed')
      })

      test('should return a 400 and validation error  where the email is invalid', async () => {
        const response = await request.post(signupRoute).send({
          username: 'InvalidEmail',
          email: 'invalid-email',
          password: 'testpassword',
        })
        expect(response.statusCode).toBe(400)
        expect(response.body.validation[0].path).toBe('email')
      })

      test('should return a 400 and validation error when the username is not at least 3 chars long', async () => {
        const response = await request.post(signupRoute).send({
          username: 'I',
          email: 'badusername@test.com',
          password: 'testpassword',
        })
        expect(response.statusCode).toBe(400)
        expect(response.body.validation[0].msg).toBe(
          'Username should be at least 3 chars long'
        )
        expect(response.body.validation[0].path).toBe('username')
      })

      test('should return a 400 and valiation error when the password is not at least 6 chars long', async () => {
        const response = await request.post(signupRoute).send({
          username: 'badtestuser',
          email: 'badusername@test.com',
          password: 'pass',
        })
        expect(response.statusCode).toBe(400)
        expect(response.body.validation[0].msg).toBe(
          'Password should be at least 6 chars long'
        )
        expect(response.body.validation[0].path).toBe('password')
      })
      test('should return a 500 internal server error when trying to create duplicate user', async () => {
        const response = await request.post(signupRoute).send(testUser)
        expect(response.statusCode).toBe(500)
        expect(response.body.message).toBe(
          'E11000 duplicate key error collection: PRODSELAB.users index: username_1 dup key: { username: "TestUser" }'
        )
      })
    })
  })

  describe('TESTS FOR /api/auth/signin', () => {
    describe('HAPPY TESTS', () => {
      test('should be able to successfully log in', async () => {
        const response = await request
          .post(signinRoute)
          .send({ email: testUser.email, password: testUser.password })
        expect(response.statusCode).toBe(200)
      })
      test('should have the cookie set in the response headers', async () => {
        const response = await request
          .post(signinRoute)
          .send({ email: testUser.email, password: testUser.password })
        expect()
      })
    })
    describe('SAD TESTS', () => {})
  })
  //   describe('Tests for /api/auth/signin', () => {
  //     //test happy test- provide correct credentials make sure to login 2 and above
  //     //test sad test -missing fields
  //     //test sad test -user not found
  //     //test sad test -invalid credentials
  //   })

  //   describe('Test for /api/auth/signout', () => {
  //     //test happy test - sucessful signout 1 of the 2
  //   })
  // })

  // describe('Tests for Protected Routes', () => {
  //   describe('Test for /api/users/update/:id', () => {
  //     //test happy test - succesful update
  //     //test sad test - can only update your own
  //     //test sad test - missing fields
  //     //test sad test - validation error not 6 chars long
  //     //test sad test - username not 3 chars long
  //     //test sad test - validation error not email
  //   })

  //   describe('Test for /api/users/delete/:id', () => {
  //     // test happy test - sucessful delete
  //     //test sad test - no access token
  //     //test sad test - your token is not valid (wrong JWT secret)
  //     // test sad test - can only delete your own user
  //     // test sad test - not valid mongodbid
  //   })
})

// describe('TEST INVALID INPUTS', () => {
//   describe('/api/auth/signup - MISSING INPUTS', () => {
//     test('should respond with 400 Bad request', async () => {
//       const response = await request
//         .post(signupRoute)
//         .send({ username: 'test' })
//       expect(response.statusCode).toBe(400)
//     })

//     test('should specify content-type header', async () => {
//       const response = await request
//         .post(signupRoute)
//         .send({ username: 'test' })
//       expect(response.headers['content-type']).toContain('application/json')
//     })
//   })
// })
