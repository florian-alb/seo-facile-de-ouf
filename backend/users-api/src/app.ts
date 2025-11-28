import express, { Application } from "express";
import cors from "cors";
import userRouter from "./routes/user.routes";
import { errorHandler } from "./middlewares/error.middleware";

const createApp = (): Application => {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get("/", (req, res) => {
    res.json({
      status: "ok",
      message: "Users API",
      routes: [
        { url: "/users", method: "GET" },
        { url: "/users/:id", method: "GET" },
        { url: "/users", method: "POST" },
      ],
    });
  });

  app.use("/users", userRouter);

  app.use(errorHandler);

  return app;
};

export default createApp;
