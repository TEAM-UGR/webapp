const { PubSub } = require("@google-cloud/pubsub");
const logger = require("../config/logger");

const pub = async (message, projectId, topicNameOrId, subscriptionName) => {
  const pubsub = new PubSub({ projectId });
  const topic = pubsub.topic(topicNameOrId);
  const subscription = pubsub.subscription(subscriptionName);
  subscription.on("message", (message) => {
    console.log("1 Received message:", message.data.toString());
    // console.log(topicNameOrId)
    // console.log(subscriptionName)
  });
  subscription.on("error", (error) => {
    console.error("Received error:", error);
    logger.error("Receiver error in pub sub", error);
  });
  try {
    topic.publishMessage({ data: Buffer.from(message) });
    console.log("in try block pubsub.js:");
  } catch (error) {
    // console.log("Sommme error occurred");
    console.error("Received error:", error);
  }
  logger.info("Sending message to topic",message)
  topic.publishMessage({ data: Buffer.from(message) });
  console.log("send message to topic",message);
  logger.info("Sent message to topic")
};

module.exports = pub;
