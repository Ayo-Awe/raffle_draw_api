import dotenv from "dotenv";
import app from "./app";
dotenv.config();
import "./env";
import { redisClient } from "./config/redis.config";

const port = process.env.PORT || "8080";
app.listen(port, async () => {
  console.log(`Listening for requests on port ${port} ...`);
  await redisClient.connect();
  console.log("Successfully connected to redis");
});
