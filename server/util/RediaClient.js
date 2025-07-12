// utils/redisClient.js
require("dotenv").config({ debug: true })
const redis = require('redis');

// Initialize the client with the Redis Cloud URL from your .env file
const redisClient = redis.createClient({
    url: process.env.REDIS_URL
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));

// Connect to Redis and export the client.
// The connect() call is handled here so you don't need to call it elsewhere.
(async () => {
    await redisClient.connect();
})();

module.exports = redisClient;
