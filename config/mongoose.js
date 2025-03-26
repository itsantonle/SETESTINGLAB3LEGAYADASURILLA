import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

const connectMongoDB = async () => {
  try {
    const mongoURI =
      process.env.NODE_ENV === 'test'
        ? process.env.TEST_MONGODB_URI
        : process.env.PROD_MONGODB_URI
    mongoose
      .connect(mongoURI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      .then(() => {
        console.log('Connected to MongoDB')
        console.log('Environment: ' + process.env.NODE_ENV)
      })
  } catch (err) {
    console.log(err)
  }
}

export default connectMongoDB
