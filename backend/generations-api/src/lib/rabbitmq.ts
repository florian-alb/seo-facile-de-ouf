// backend/generations-api/src/lib/rabbitmq.ts
import amqp, { Channel, Connection } from 'amqplib';
 
const QUEUE_NAME = 'ai-generation-jobs';
 
let connection: Connection | null = null;
let channel: Channel | null = null;
 
export async function connectRabbitMQ(): Promise<void> {
  const url = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
  
  // Retry logic
  let retries = 0;
  while (!connection && retries < 10) {
    try {
      connection = await amqp.connect(url);
      channel = await connection.createChannel();
      
      await channel.assertQueue(QUEUE_NAME, { durable: true });
      
      console.log('✅ Connected to RabbitMQ');
      
      // Reconnect on error
      connection.on('error', (err) => {
        console.error('RabbitMQ connection error:', err);
        connection = null;
        channel = null;
      });
      
    } catch (error) {
      retries++;
      console.log(`⏳ RabbitMQ not ready, retry ${retries}/10...`);
      await new Promise(r => setTimeout(r, 2000));
    }
  }
}
 
export interface JobPayload {
  jobId: string;
  type: 'full_description' | 'meta_only' | 'slug_only';
}
 
export async function publishJob(payload: JobPayload): Promise<boolean> {
  if (!channel) {
    throw new Error('RabbitMQ channel not initialized');
  }
  
  return channel.sendToQueue(
    QUEUE_NAME,
    Buffer.from(JSON.stringify(payload)),
    { persistent: true }  // Survive RabbitMQ restart
  );
}
 
export async function closeRabbitMQ(): Promise<void> {
  if (channel) await channel.close();
  if (connection) await connection.close();
}
