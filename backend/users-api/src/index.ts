import express, { Express, Request, Response, NextFunction } from "express";

const app: Express = express();
const port = process.env.PORT || 5001;

app.get("/", (req: Request, res: Response, next: NextFunction) => {
  res.send("/ of Public API");
});

app.use(function (err: any, req: Request, res: Response, next: NextFunction) {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

app.listen(port, () => {
  console.log(`Public API is running at http://localhost:${port}`);
});
