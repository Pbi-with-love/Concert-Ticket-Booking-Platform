import { createClient } from "redis";

const redis = createClient({
    url: process.env.REDIS_URL || "redis://localhost:6379",
});

redis.on("error", (err) => {
    console.error("Redis Client Error", err);
});

export const connectRedis = async () => {
    if (!redis.isOpen) {
        await redis.connect();
        console.log("Redis connected");
    }
};

export default redis;