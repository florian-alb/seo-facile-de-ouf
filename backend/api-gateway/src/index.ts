import express, { Express, NextFunction, Request, Response } from "express";

import { setupProxies } from "./proxy";
import { ROUTES } from "./routes";

const app: Express = express();
const port = process.env.PORT || 3000;

app.get("/", (_req: Request, res: Response, next: NextFunction) => {
  res.send("/ of API Gateway");
});

// Log resolved routes so we can verify environment variables and targets
console.log("API Gateway ROUTES:", JSON.stringify(ROUTES, null, 2));

setupProxies(app, ROUTES);

app.use(function (err: any, req: Request, res: Response, next: NextFunction) {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

app.listen(port, () => {
  console.log(`API Gateway is running at http://localhost:${port}`);
});
