import app from "./app.js";
import { connectRedis } from "./config/redis.js";

const PORT = process.env.PORT || 3000;

const start = async () => {
    try {
        await connectRedis();

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (err) {
        console.error("Failed to start server:", err);
        process.exit(1);
    }
};

start();