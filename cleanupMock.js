import User from './models/user.model.js'

import dotenv from 'dotenv'
dotenv.config()
export const cleanUpMock = async () => {
  try {
    if (process.env.NODE_ENV != 'test') {
      throw Error('Not in testing environment')
    }

    // Delete all users in the test database
    await User.deleteMany()
    const users = await User.find({})
    if (users.length === 0) {
      console.log('Cleaned up MockFiles from TestDB')
    } else {
      throw new Error('Unable to clean up tests')
    }
  } catch (err) {
    console.error('Error in cleanUpMock:', err)
  }
}
