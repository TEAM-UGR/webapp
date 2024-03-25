const { PubSub } = require("@google-cloud/pubsub");

const pub = async  (message,projectId, topicNameOrId, subscriptionName) => {
    const pubsub = new PubSub({ projectId });
    const topic = pubsub.topic(topicNameOrId);
    const subscription = pubsub.subscription(subscriptionName);
    subscription.on("message", (message) => {
      console.log("1 Received message:", message.data.toString());
      // console.log(topicNameOrId)
      // console.log(subscriptionName)
      // console.log(pubsub)
    });
    subscription.on("error", (error) => {
      console.error("Received error:", error);
    });
    try {
      topic.publishMessage({ data: Buffer.from(message) });
      console.log("3 Received message:");
      
    } catch (error) {
      console.log("Sommme error occurred")
    }
    topic.publishMessage({ data: Buffer.from(message) });
    
  }
  
  module.exports = pub;