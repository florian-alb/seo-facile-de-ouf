import amqp, { Channel, Connection, ConsumeMessage } from "amqplib";
import {
  generateWithOpenAI,
  generateDescriptionWithOpenAI,
  generateCollectionDescriptionWithOpenAI,
  generateCollectionMetaWithOpenAI,
  LANGUAGE_MAP,
} from "./services/openai.service";
import { Generation, IGeneration } from "./models/generation.model";

const QUEUE_NAME = "ai-generation-jobs";
const MAX_RETRIES = 3;

type JobType =
  | "full_description"
  | "meta_only"
  | "slug_only"
  | "description"
  | "seoTitle"
  | "seoDescription";

interface JobMessage {
  jobId: string;
  type: JobType;
  entityType?: "product" | "collection";
}

let channel: Channel;

export async function startConsumer(rabbitmqUrl: string): Promise<void> {
  let connection: Connection | null = null;
  let retries = 0;

  while (!connection && retries < 10) {
    try {
      connection = await amqp.connect(rabbitmqUrl);
    } catch (error) {
      retries++;
      console.log(`RabbitMQ not ready, retry ${retries}/10...`);
      await new Promise((r) => setTimeout(r, 2000));
    }
  }

  if (!connection) {
    throw new Error("Failed to connect to RabbitMQ");
  }

  channel = await connection.createChannel();
  await channel.assertQueue(QUEUE_NAME, { durable: true });
  channel.prefetch(1);
  channel.consume(QUEUE_NAME, handleMessage, { noAck: false });
}

async function handleMessage(msg: ConsumeMessage | null): Promise<void> {
  if (!msg) return;

  const job: JobMessage = JSON.parse(msg.content.toString());
  console.log(`Received job: ${job.jobId}`);

  try {
    const generation = await Generation.findById(job.jobId);
    if (!generation) {
      console.error(`Job not found: ${job.jobId}`);
      channel.ack(msg);
      return;
    }

    generation.status = "processing";
    await generation.save();

    const entityName = generation.entityType === "collection"
      ? generation.collectionName
      : generation.productName;
    console.log(`Processing: ${entityName}`);

    generation.status = "completed";
    generation.content = await generateContent(generation, job.type);
    generation.completedAt = new Date();
    await generation.save();

    console.log(`Completed: ${entityName}`);
    channel.ack(msg);
  } catch (error) {
    await handleError(msg, job, error as Error);
  }
}

async function handleError(
  msg: ConsumeMessage,
  job: JobMessage,
  error: Error,
): Promise<void> {
  console.error(`Error processing ${job.jobId}:`, error.message);

  const generation = await Generation.findById(job.jobId);
  if (!generation) {
    channel.ack(msg);
    return;
  }

  generation.retryCount += 1;

  if (generation.retryCount < MAX_RETRIES) {
    generation.status = "pending";
    await generation.save();
    console.log(`Retry ${generation.retryCount}/${MAX_RETRIES} for ${job.jobId}`);
    setTimeout(() => {
      channel.nack(msg, false, true);
    }, 5000 * generation.retryCount);
  } else {
    generation.status = "failed";
    generation.error = error.message;
    await generation.save();
    console.log(`Job failed permanently: ${job.jobId}`);
    channel.ack(msg);
  }
}

function resolveLanguageName(generation: IGeneration): string {
  const lang = generation.storeSettings?.language || "fr";
  return LANGUAGE_MAP[lang] || "French";
}

interface EntityGenerators {
  generateDescription: () => Promise<string>;
  generateMeta: () => Promise<{ metaTitle: string; metaDescription: string; slug: string }>;
  entityName: string;
}

function getGenerators(generation: IGeneration): EntityGenerators {
  const languageName = resolveLanguageName(generation);

  if (generation.entityType === "collection") {
    const baseInput = {
      collectionName: generation.collectionName!,
      keywords: generation.keywords,
      languageName,
    };
    return {
      entityName: generation.collectionName!,
      generateDescription: () =>
        generateCollectionDescriptionWithOpenAI({
          ...baseInput,
          storeSettings: generation.storeSettings || null,
          collectionContext: generation.collectionContext || null,
        }),
      generateMeta: () => generateCollectionMetaWithOpenAI(baseInput),
    };
  }

  const baseInput = {
    productName: generation.productName!,
    keywords: generation.keywords,
    languageName,
  };
  return {
    entityName: generation.productName!,
    generateDescription: () =>
      generateDescriptionWithOpenAI({
        ...baseInput,
        storeSettings: generation.storeSettings || null,
        productContext: generation.productContext || null,
      }),
    generateMeta: () => generateWithOpenAI(baseInput),
  };
}

async function generateContent(
  generation: IGeneration,
  type: JobType,
): Promise<IGeneration["content"]> {
  const { entityName, generateDescription, generateMeta } = getGenerators(generation);

  switch (type) {
    case "description": {
      const descriptionHtml = await generateDescription();
      return {
        title: entityName,
        description: descriptionHtml,
        metaTitle: "",
        metaDescription: "",
        slug: "",
      };
    }

    case "seoTitle":
    case "seoDescription":
    case "meta_only":
    case "slug_only": {
      const meta = await generateMeta();
      return {
        title: entityName,
        description: "",
        ...meta,
      };
    }

    case "full_description":
    default: {
      const [descHtml, metaContent] = await Promise.all([
        generateDescription(),
        generateMeta(),
      ]);
      return {
        title: entityName,
        description: descHtml,
        ...metaContent,
      };
    }
  }
}
