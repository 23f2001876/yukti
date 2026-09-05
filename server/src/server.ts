import "reflect-metadata";
import dotenv from "dotenv";

dotenv.config();

import app from "./app";
import { AppDataSource } from "./data-source";

const PORT = process.env.PORT || 5000;

AppDataSource.initialize()
  .then(() => {
    console.log("Data Source has been successfully initialized!");
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Error during Data Source initialization:", err);
  });
