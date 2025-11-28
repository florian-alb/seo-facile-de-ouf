import dotenv from "dotenv";
import createApp from "./app";
import { connectDB } from "./lib/mongoose";

dotenv.config();

const PORT = process.env.PORT || 5002;

const startServer = async () => {
  await connectDB();

  const app = createApp();

  app.listen(PORT, () => {
    console.log(`🚀 Server started on http://localhost:${PORT}`);
  });
};

startServer();
