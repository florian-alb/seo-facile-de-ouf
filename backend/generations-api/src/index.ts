import express, { Express, Request, Response } from "express";
import generationRouter from "@app/routes/generation.routes";

const app: Express = express();
const port = process.env.PORT || 5002;

app.get("/", (req: Request, res: Response) => {
  res.send("/ of Generations API");
});

app.use("/", generationRouter);

app.use(function (err: Error, _req: Request, res: Response) {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

app.listen(port, () => {
  console.log(`Generation API is running at http://localhost:${port}`);
});
