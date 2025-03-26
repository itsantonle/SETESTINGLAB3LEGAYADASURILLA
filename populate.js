import User from './models/user.model'
import { usersMock } from './userMockData'
import dotenv from 'dotenv'
dotenv.config()

export const populateWithMock = async () => {
  try {
    if (process.env.NODE_ENV != 'test') {
      throw Error('Not in testing environment')
    }
    // always call delete in order to clear instances
    await User.deleteMany()
    const users = await User.create(usersMock)

    if (users.length === 0) {
      throw new Error('Unable to populate')
    } else {
      // console.log('success', users)
      return users
    }
  } catch (err) {
    console.error('Error in populate.js', err)
  }
}
