import "dotenv/config";
import createApp from "./app";

const app = createApp();
const PORT = process.env.PORT || 5003;

app.listen(PORT, () => {
  console.log(`🚀 Shop API started on http://localhost:${PORT}`);
});
