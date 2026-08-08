import { createClient } from "redis";

const redis = createClient({
  url: "redis://localhost:6379",
});

redis.connect();

redis.on("connect", () => {
  console.log("Redis Connected");
});

redis.on("error", (err) => {
  console.log("Redis Error:", err);
});

export default redis;