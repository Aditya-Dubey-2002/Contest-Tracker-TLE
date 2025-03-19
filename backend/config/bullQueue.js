const Bull = require("bull");
const Redis = require("ioredis");

// Connect to Redis
const redisConnection = new Redis();

const reminderQueue = new Bull("reminderQueue", {
    redis: { host: "127.0.0.1", port: 6379 }, // Use Redis cloud URL if needed
    defaultJobOptions: {
        removeOnComplete: false, // Keep completed jobs in the queue for visibility
        removeOnFail: false, // Keep failed jobs in the queue for debugging
        attempts: 25, // More attempts for longer delays
        backoff: {
            type: 'fixed',
            delay: 30000 // Check every 30 seconds
        }
    },
    settings: {
        lockDuration: 30000, // 30 seconds
        stalledInterval: 30000, // Check for stalled jobs every 30 seconds
        maxStalledCount: 1 // Fail job after 1 stalled attempt
    }
});

// Add error handling for the queue
reminderQueue.on('error', (error) => {
    console.error('Queue error:', error);
});

reminderQueue.on('failed', (job, error) => {
    if (error.message === 'NOT_YET_TIME') {
        console.log(`Job ${job.id} not ready yet, will retry in 30 seconds`);
        job.retry();
    } else {
        console.error(`Job ${job.id} failed:`, error);
    }
});

reminderQueue.on('completed', (job) => {
    console.log(`Job ${job.id} completed successfully`);
});

reminderQueue.on('stalled', (job) => {
    console.log(`Job ${job.id} has stalled and will be retried`);
});

// Clean old jobs periodically
async function cleanOldJobs() {
    try {
        // Clean jobs older than 24 hours
        await reminderQueue.clean(24 * 60 * 60 * 1000, 'completed');
        await reminderQueue.clean(24 * 60 * 60 * 1000, 'failed');
    } catch (error) {
        console.error('Error cleaning old jobs:', error);
    }
}

// Clean old jobs every 12 hours
setInterval(cleanOldJobs, 12 * 60 * 60 * 1000);

module.exports = { reminderQueue };
