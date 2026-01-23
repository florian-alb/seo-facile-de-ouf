// backend/worker/src/index.ts
import 'dotenv/config';
import mongoose from 'mongoose';
import { startConsumer } from './consumer';
 
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/generations-db';
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
 
async function main() {
  console.log('🚀 Starting AI Generation Worker...');
  
  // Connexion MongoDB
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }
  
  // Démarrer le consumer RabbitMQ
  try {
    await startConsumer(RABBITMQ_URL);
    console.log('✅ RabbitMQ consumer started');
    console.log('👂 Waiting for jobs...');
  } catch (error) {
    console.error('❌ RabbitMQ connection failed:', error);
    process.exit(1);
  }
}
 
// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await mongoose.disconnect();
  process.exit(0);
});
 
main();
