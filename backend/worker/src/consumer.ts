// backend/worker/src/consumer.ts
import amqp, { Channel, Connection, ConsumeMessage } from 'amqplib';
// import { generateWithClaude } from './services/claude.service';
import { generateWithOpenAI } from './services/openai.service';
import { Generation, IGeneration } from '../../generations-api/src/models/generation.model.ts';
 
const QUEUE_NAME = 'ai-generation-jobs';
const MAX_RETRIES = 3;
 
interface JobMessage {
  jobId: string;
  type: 'full_description' | 'meta_only' | 'slug_only';
}
 
let channel: Channel;
 
export async function startConsumer(rabbitmqUrl: string): Promise<void> {
  // Connexion avec retry
  let connection: Connection | null = null;
  let retries = 0;
  
  while (!connection && retries < 10) {
    try {
      connection = await amqp.connect(rabbitmqUrl);
    } catch (error) {
      retries++;
      console.log(`⏳ RabbitMQ not ready, retry ${retries}/10...`);
      await new Promise(r => setTimeout(r, 2000));
    }
  }
  
  if (!connection) {
    throw new Error('Failed to connect to RabbitMQ');
  }
  
  channel = await connection.createChannel();
  
  // Créer la queue si elle n'existe pas
  await channel.assertQueue(QUEUE_NAME, { 
    durable: true  // Persiste même si RabbitMQ redémarre
  });
  
  // Prefetch: traiter 1 message à la fois par worker
  channel.prefetch(1);
  
  // Consommer les messages
  channel.consume(QUEUE_NAME, handleMessage, { noAck: false });
}

// Suite de consumer.ts
async function handleMessage(msg: ConsumeMessage | null): Promise<void> {
  if (!msg) return;
  
  const job: JobMessage = JSON.parse(msg.content.toString());
  console.log(`📥 Received job: ${job.jobId}`);
  
  try {
    // 1. Récupérer le job en base
    const generation = await Generation.findById(job.jobId);
    if (!generation) {
      console.error(`❌ Job not found: ${job.jobId}`);
      channel.ack(msg);
      return;
    }
    
    // 2. Marquer comme "processing"
    generation.status = 'processing';
    await generation.save();
    console.log(`⚙️ Processing: ${generation.productName}`);
    
    // 3. Générer le contenu
    const content = await generateContent(generation, job.type);
    
    // 4. Sauvegarder le résultat
    generation.status = 'completed';
    generation.content = content;
    generation.completedAt = new Date();
    await generation.save();
    
    console.log(`✅ Completed: ${generation.productName}`);
    channel.ack(msg);
    
  } catch (error) {
    await handleError(msg, job, error as Error);
  }
}

// Suite de consumer.ts
async function handleError(
  msg: ConsumeMessage, 
  job: JobMessage, 
  error: Error
): Promise<void> {
  console.error(`❌ Error processing ${job.jobId}:`, error.message);
  
  const generation = await Generation.findById(job.jobId);
  if (!generation) {
    channel.ack(msg);
    return;
  }
  
  generation.retryCount += 1;
  
  if (generation.retryCount < MAX_RETRIES) {
    // Retry: remettre dans la queue après un délai
    generation.status = 'pending';
    await generation.save();
    
    console.log(`🔄 Retry ${generation.retryCount}/${MAX_RETRIES} for ${job.jobId}`);
    
    // Nack avec requeue après délai
    setTimeout(() => {
      channel.nack(msg, false, true);
    }, 5000 * generation.retryCount); // Backoff exponentiel
    
  } else {
    // Max retries atteint: marquer comme failed
    generation.status = 'failed';
    generation.error = error.message;
    await generation.save();
    
    console.log(`💀 Job failed permanently: ${job.jobId}`);
    channel.ack(msg);
  }
}

 
type JobType = 'full_description' | 'meta_only' | 'slug_only';
 
async function generateContent(
  generation: IGeneration,
  type: JobType
): Promise<IGeneration['content']> {
  
  const input = {
    productName: generation.productName,
    keywords: generation.keywords
  };
  
  switch (type) {
    case 'full_description':
      // Claude pour les descriptions complètes (meilleure qualité)
      return await generateWithClaude(input);
      
    case 'meta_only':
    case 'slug_only':
      // OpenAI pour les meta tags (moins cher)
      const meta = await generateWithOpenAI(input);
      return {
        title: generation.productName,
        description: '',
        ...meta
      };
      
    default:
      return await generateWithClaude(input);
  }
}
