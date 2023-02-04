const fastify = require("fastify");
const mqtt = require("mqtt");
const app = fastify();

app.register(async function (fastify) {
  fastify.addHook("onClose", (instance, done) => {
    server.close(done);
  });

  const server = mqtt.createServer((client) => {
    client.on("connect", (packet) => {
      client.connack({ returnCode: 0 });
    });

    client.on("publish", (packet) => {
      for (let i = 0; i < client.subscriptions.length; i++) {
        const topic = client.subscriptions[i].topic;
        if (topicMatches(packet.topic, topic)) {
          client.publish({ topic: packet.topic, payload: packet.payload });
        }
      }
    });

    client.on("subscribe", (packet) => {
      const granted = [];
      for (let i = 0; i < packet.subscriptions.length; i++) {
        client.subscriptions.push(packet.subscriptions[i]);
        granted.push(packet.subscriptions[i].qos);
      }
      client.suback({ granted: granted, messageId: packet.messageId });
    });

    client.on("pingreq", (packet) => {
      client.pingresp();
    });

    client.on("disconnect", (packet) => {
      client.stream.end();
    });

    client.on("close", (err) => {
      client.subscriptions = [];
    });

    client.on("error", (err) => {
      client.stream.end();
    });
  });

  server.listen(1883);
});

app.listen(3333, "0.0.0.0", (err) => {
  if (err) {
    throw err;
  }
  console.log("MQTT server running on 0.0.0.0:3333");
});

function topicMatches(topic, subscription) {
  if (subscription === "#") {
    return true;
  }
  const parts = subscription.split("/");
  const topicParts = topic.split("/");
  for (let i = 0; i < parts.length; i++) {
    if (parts[i] !== topicParts[i] && parts[i] !== "+") {
      return false;
    }
  }
  return true;
}
