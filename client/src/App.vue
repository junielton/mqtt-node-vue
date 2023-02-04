<template>
  <img alt="Vue logo" src="./assets/logo.png" />
  here
  <p>{{ data }}</p>
</template>

<script>
import mqtt from "mqtt";

export default {
  data() {
    return {
      data: "",
      client: null,
    };
  },
  mounted() {
    this.client = mqtt.connect("mqtt://broker.emqx.io", {
      path: "/ws",
      port: 1883,
      clientId: `niel-${Math.random().toString(16).substr(2, 8)}`,
    });
    this.client.on("connect", () => {
      this.client.subscribe("mqttx_77b06fefjuni", (err) => {
        if (!err) {
          console.log("Subscribed to mqttx_77b06fefjuni");
        }
      });
    });
    this.client.on("message", (topic, message) => {
      if (topic === "mqttx_77b06fefjuni") {
        this.data = message.toString();
      }
    });

    console.log("this.data: ", this.client);
  },
  beforeUnmount() {
    this.client.end();
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
