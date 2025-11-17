// queues/billProcessingQueue.js
const Queue = require('bull');

const billProcessingQueue = new Queue('bill-processing', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379
  },
  defaultJobOptions: {
    attempts: 3, // Retry 3 times if fails
    backoff: {
      type: 'exponential',
      delay: 5000 // Wait 5 sec, then 10 sec, then 20 sec
    },
    removeOnComplete: true,
    removeOnFail: false
  }
});

// Export queue instance
module.exports = billProcessingQueue;