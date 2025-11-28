import dotenv from "dotenv";
import createApp from "./app";

dotenv.config();

const PORT = process.env.PORT ?? 5001;
const app = createApp();

app.listen(PORT, () => {
  console.log(`🚀 Server started on http://localhost:${PORT}`);
});
