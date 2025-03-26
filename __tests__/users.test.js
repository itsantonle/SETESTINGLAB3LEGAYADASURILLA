import supertest from 'supertest'
import { app, server } from '../index'
import mongoose from 'mongoose'
import { cleanUpMock } from '../cleanupMock'
import { populateWithMock } from '../populate'

const signupRoute = '/api/auth/signup'
const request = supertest(app)
let users = []
let accessToken = ''
let invalidAccessToken = ''

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

describe('Tests for Non-Protected Routes', () => {
  describe('Tests for /api/auth/signup', () => {
    // test happy test - which is correct format
    // test sad test - missing field
    // test sad test - invalid email
    // test sad test - username not 3 chars long
    // test sad test - password not 6 chars long
  })

  describe('Tests for /api/auth/signin', () => {
    //test happy test- provide correct credentials make sure to login 2 and above
    //test sad test -missing fields
    //test sad test -user not found
    //test sad test -invalid credentials
  })

  describe('Test for /api/auth/signout', () => {
    //test happy test - sucessful signout 1 of the 2
  })
})

describe('Tests for Protected Routes', () => {
  describe('Test for /api/users/update/:id', () => {
    //test happy test - succesful update
    //test sad test - can only update your own
    //test sad test - missing fields
    //test sad test - validation error not 6 chars long
    //test sad test - username not 3 chars long
    //test sad test - validation error not email
  })

  describe('Test for /api/users/delete/:id', () => {
    // test happy test - sucessful delete
    //test sad test - no access token
    //test sad test - your token is not valid (wrong JWT secret)
    // test sad test - can only delete your own user
    // test sad test - not valid mongodbid
  })
})

describe('')
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
