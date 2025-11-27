import express, { Express, Request, Response, NextFunction } from "express";
import { initDb, createUser, addGenerationToUser } from "./db";

const app: Express = express();
const port = process.env.PORT || 5001;

app.use(express.json());

app.get("/", async (req: Request, res: Response) => {
  res.json({ message: "Users API root" });
});

app.post("/users", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email } = req.body;
    if (!name || !email) return res.status(400).json({ error: "name and email required" });
    const user = await createUser(name, email);
    res.status(201).json(user);
  } catch (err: any) {
    next(err);
  }
});

app.get("/test", async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json({ message: "Test endpoint is working!" });
  } catch (err: any) {
    next(err);
  }
});

app.post("/users/:id/generations", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: "invalid id" });
    const { generationId } = req.body;
    if (!generationId) return res.status(400).json({ error: "generationId required" });
    const user = await addGenerationToUser(id, generationId);
    if (!user) return res.status(404).json({ error: "not found" });
    res.json(user);
  } catch (err: any) {
    next(err);
  }
});

app.use(function (err: any, req: Request, res: Response, next: NextFunction) {
  console.error(err.stack);
  res.status(500).send({ error: err.message || "Something broke!" });
});

(async function start() {
  try {
    await initDb();
    app.listen(port, () => {
      console.log(`Users API is running at http://localhost:${port}`);
    });
  } catch (err) {
    console.error("Failed to start app:", err);
    process.exit(1);
  }
})();
