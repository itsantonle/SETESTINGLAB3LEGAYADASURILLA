import connectMongoDB from './config/mongoose'
import User from './models/user.model'
import { usersMock } from './userMockData'

const start = async () => {
  try {
    await connectMongoDB()
    // deletes all instance of users in the db if there is
    await User.deleteMany()
    const users = await User.create(usersMock)
    //node has a process called exit
    //process.exit(0) everythign went well
    console.log('success', users)
    process.exit(0)
  } catch (err) {
    console.log(err)
    process.exit(1)
  }
}
start()
