import express, { Application, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { loggerMiddleware } from "./middlewares/logger";
import { errorHandler } from "./middlewares/errorHandler";
import apiRoutes from "./routes";

const app: Application = express();

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(loggerMiddleware);

app.use("/api", apiRoutes);

app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({ message: "Welcome to the Yukti API Service" });
});

app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "Resource not found",
  });
});

app.use(errorHandler);

export default app;
