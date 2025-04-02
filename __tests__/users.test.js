import supertest from 'supertest'
import { app, server } from '../index'
import mongoose from 'mongoose'
import { cleanUpMock } from '../cleanupMock'
import { populateWithMock } from '../populate'
import User from '../models/user.model'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config()

// ROUTES
const signupRoute = '/api/auth/signup'
const signinRoute = '/api/auth/signin'
const signoutRoute = '/api/auth/signout'
const updateBaseRoute = '/api/user/update/'
const deleteBaseRoute = '/api/user/delete/'
const request = supertest(app)

//MOCK DATE - SOME ARE DYNAMICALLY ASSIGNED
let accessToken = ''
let otherTestusers = []
let otherDBTestuser = {}
let otherDBTestuserID = ''
let invalidAccessToken = jwt.sign(
  { id: '12345', username: 'fakeUser' },
  'wrong-secret',
  { expiresIn: '1h' }
)
let dBTestUser = {}
let dBTestUserID = ''
let testUser = {
  username: 'TestUser',
  email: 'testuser@test.com',
  password: 'testpassword',
}

// ACTUAL TESTING BLOOK
beforeAll(async () => {
  console.log('----- \n TEST SUITE RUNNING \n -----')
  try {
    otherTestusers = await populateWithMock()
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
        const uri = process.env.TEST_MONGODB_URI
        const dBNAme = uri.split('/').pop();
        const response = await request.post(signupRoute).send(testUser)
        expect(response.statusCode).toBe(500)
        expect(response.body.message).toBe(
          `E11000 duplicate key error collection: ${dBNAme}.users index: username_1 dup key: { username: "TestUser" }`
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
        expect(response.headers['set-cookie']).toBeDefined()
        accessToken = response.headers['set-cookie'][0]
        expect(accessToken).toContain('access_token')
      })
    })
    describe('SAD TESTS', () => {
      test('should give a status code of 400 and a validation error if there are missing fields', async () => {
        const response = await request
          .post(signinRoute)
          .send({ email: 'email@test.com' })
        expect(response.statusCode).toBe(400)
        expect(response.body.message).toBe('Validation failed')
        expect(response.body.validation[0].path).toBe('password')
        expect(response.body.validation[0].msg).toBe('Invalid value')
      })

      test('should give a status code of 404 when users is not found', async () => {
        const response = await request
          .post(signinRoute)
          .send({ email: 'nonexistentuser@none.com', password: 'nonepassword' })
        expect(response.statusCode).toBe(404)
      })
      test('should return a message of "user not found" when user is not found', async () => {
        const response = await request.post(signinRoute).send({
          email: 'nonexistentuser@none.com',
          password: 'nonepassword',
        })

        expect(response.body.message).toBe('User not found')
      })

      test('should return a status code of 401 when the wrong user credential is given', async () => {
        const response = await request.post(signinRoute).send({
          email: testUser.email,
          password: 'wrongpass',
        })
        expect(response.statusCode).toBe(401)
      })

      test('should return a message of "wrong credentials" when user is not found', async () => {
        const response = await request.post(signinRoute).send({
          email: testUser.email,
          password: 'wrongpass',
        })

        expect(response.body.message).toBe('wrong credentials')
      })
    })
  })

  describe('TESTS FOR /api/auth/signout', () => {
    describe('HAPPY TESTS', () => {
      test('should return a status code of 200 when signout is successful', async () => {
        const response = await request.get(signoutRoute)
        expect(response.statusCode).toBe(200)
        expect(response.text).toBe('"Signout success!"')
      })
    })
  })
})

describe('TESTS FOR PROTECTED ROUTES', () => {
  describe('TEST FOR /api/users/update/:id', () => {
    describe('HAPPY TESTS', () => {
      test('should return 200 when there the headers have valid auth token in res.cookie', async () => {
        dBTestUser = await User.findOne({
          username: testUser.username,
        }).lean()

        dBTestUserID = dBTestUser._id.toString()
        const response = await request
          .post(updateBaseRoute + dBTestUserID)
          .send({
            username: 'UpdatedTestUser',
          })
          .set('Cookie', accessToken)
        expect(response.statusCode).toBe(200)
      })
    })

    describe('SAD TESTS', () => {
      test('should return a 401 when no token', async () => {
        const response = await request
          .post(updateBaseRoute + dBTestUserID)
          .send({
            username: 'UpdatedTestUser',
          })

        expect(response.statusCode).toBe(401)
      })

      test('should indicate unauthorized in both headers and body when no token', async () => {
        const response = await request
          .post(updateBaseRoute + dBTestUserID)
          .send({
            username: 'UpdatedTestUser',
          })

        expect(response.unauthorized).toBe(true)
        expect(response.body.message).toBe('You are not authenticated!')
      })

      test('should return a 403 when the access token is not valid', async () => {
        const response = await request
          .post(updateBaseRoute + dBTestUserID)
          .send({
            username: 'UpdatedTestUser',
          })
          .set('Cookie', `access_token=${invalidAccessToken}`)
        expect(response.statusCode).toBe(403)
      })

      test('should return a 400 when the user does not exist or invalid user_id in params', async () => {
        const response = await request
          .post(updateBaseRoute + dBTestUserID + 'invalid')
          .send({
            username: 'UpdatedTestUser',
          })
          .set('Cookie', accessToken)
        expect(response.statusCode).toBe(400)
      })
      test('should return a 400 and a validation error when invalid email is provided', async () => {
        const response = await request
          .post(updateBaseRoute + dBTestUserID)
          .send({ email: 'invalid-email' })
          .set('Cookie', accessToken)
        expect(response.statusCode).toBe(400)
        expect(response.body.validation[0].msg).toBe('Invalid value')
        expect(response.body.validation[0].path).toBe('email')
      })
      test('should return a 400 and a validation error when password is not at least 6 chars long', async () => {
        const response = await request
          .post(updateBaseRoute + dBTestUserID)
          .send({ password: 'no' })
          .set('Cookie', accessToken)
        expect(response.statusCode).toBe(400)
        expect(response.body.validation[0].msg).toBe(
          'Password should be at least 6 chars long'
        )
        expect(response.body.validation[0].path).toBe('password')
      })
      test('should return a 400 and a validation error when username is not at least 3 chars long', async () => {
        const response = await request
          .post(updateBaseRoute + dBTestUserID)
          .send({ username: 'u' })
          .set('Cookie', accessToken)
        expect(response.statusCode).toBe(400)
        expect(response.body.validation[0].msg).toBe(
          'Username should be at least 3 chars long'
        )
        expect(response.body.validation[0].path).toBe('username')
      })
    })
  })

  describe('TESTS for /api/users/delete/:id', () => {
    describe('HAPPY TEST', () => {
      test('should be able to delete the user of the specified id when the auth token is present', async () => {
        const response = await request
          .delete(deleteBaseRoute + dBTestUserID)
          .set('Cookie', accessToken)
        expect(response.statusCode).toBe(200)
      })

      test('should verify that deleted user should not be in the db', async () => {
        const deletedUser = await User.find({ _id: dBTestUserID })
        expect(deletedUser.length).toBe(0)
      })
    })

    describe('SAD TEST', () => {
      test('should return 401 when the user is not authorized', async () => {
        otherDBTestuser = otherTestusers[0]
        otherDBTestuserID = otherDBTestuser._id.toString()

        const response = await request.delete(
          deleteBaseRoute + otherDBTestuserID
        )
        expect(response.statusCode).toBe(401)
      })
      test('should return a "you are not authenticated" msg when the user does not have access token in cookies', async () => {
        otherDBTestuser = otherTestusers[0]
        otherDBTestuserID = otherDBTestuser._id.toString()

        const response = await request.delete(
          deleteBaseRoute + otherDBTestuserID
        )
        expect(response.unauthorized).toBe(true)
        expect(response.body.message).toBe('You are not authenticated!')
      })

      test('should return 403 if not when the user does not have a valid access token', async () => {
        const response = await request
          .delete(deleteBaseRoute + otherDBTestuserID)
          .set('Cookie', `access_token=${invalidAccessToken}`)
        expect(response.statusCode).toBe(403)
      })

      // this feature bases off of the valid auth token
      // the auth token used is still valid but is does not belong to DBTestuser

      test('should return a 401 when another user tries to delete another users account', async () => {
        const response = await request
          .delete(deleteBaseRoute + otherDBTestuserID)
          .set('Cookie', accessToken)
        expect(response.status).toBe(401)
      })

      test('should return a message "You can delete only your account!"', async () => {
        const response = await request
          .delete(deleteBaseRoute + otherDBTestuserID)
          .set('Cookie', accessToken)
        expect(response.body.message).toBe('You can delete only your account!')
      })
    })
  })
})
