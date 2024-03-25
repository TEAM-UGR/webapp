const { PubSub } = require("@google-cloud/pubsub");

const pub = async  (message,projectId, topicNameOrId, subscriptionName) => {
    const pubsub = new PubSub({ projectId });
    const topic = pubsub.topic(topicNameOrId);
    const subscription = pubsub.subscription(subscriptionName);
    subscription.on("message", (message) => {
      console.log("Received message:", message.data.toString());
    });
    subscription.on("error", (error) => {
      console.error("Received error:", error);
    });
    topic.publishMessage({ data: Buffer.from(message) });
  }
  
  module.exports = pub;