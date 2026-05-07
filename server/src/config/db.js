import mongoose from 'mongoose'

export async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/splitwise-pro'

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    })
    console.log(`✅ MongoDB connected: ${mongoose.connection.host}`)
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message)
    // Don't exit — allow server to start with mock data
  }

  mongoose.connection.on('disconnected', () => {
    console.warn('⚠️  MongoDB disconnected. Retrying...')
  })
}

export default mongoose
