// #!/usr/bin/env node
const amqp = require("amqplib/callback_api");
const XMLHttpRequest = require("xhr2");

// Quick wrapper function for making a GET call.
async function get(url) {
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.responseType = "json";
    xhr.onload = () => resolve(xhr.response);
    xhr.send(null);
  });
}

const AMQP_URL = process.env.AMQP_URL || "amqp://localhost";

// connection to rabbitMQ and fetch data
amqp.connect(AMQP_URL, (error0, connection) => {
  if (error0) {
    throw error0;
  }
  connection.createChannel(async (error1, channel) => {
    if (error1) {
      throw error1;
    }

    const url = `https://gbfs.citibikenyc.com/gbfs/en/station_information.json`;
    const stations = await get(url);
    const stationsStringify = JSON.stringify(stations);

    const queue = "information";

    channel.assertQueue(queue, { durable: false });
    channel.sendToQueue(queue, Buffer.from(stationsStringify));
    console.log("Information Send");
  });
  setTimeout(() => {
    connection.close();
    process.exit(0);
  }, 10000);
});
