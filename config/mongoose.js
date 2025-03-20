import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

const connectMongoDB = async () => {
  try {
    mongoose
      .connect('mongodb://localhost:27017/' || process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      .then(() => {
        console.log('Connected to MongoDB')
      })
  } catch (err) {
    console.log(err)
  }
}

export default connectMongoDB
