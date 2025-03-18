const Bull = require("bull");
const Redis = require("ioredis");

// Connect to Redis
const redisConnection = new Redis();

const reminderQueue = new Bull("reminderQueue", {
    redis: { host: "127.0.0.1", port: 6379 } // Use Redis cloud URL if needed
});

module.exports = { reminderQueue };
