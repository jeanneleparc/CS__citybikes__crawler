// #!/usr/bin/env node

const cron = require("node-cron");
const amqp = require("amqplib/callback_api");
const XMLHttpRequest = require("xhr2");

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
const urlStations = `https://gbfs.citibikenyc.com/gbfs/en/station_information.json`;
const urlStatus = `https://gbfs.citibikenyc.com/gbfs/en/station_status.json`;

// fetch the information of the stations to fill the database
amqp.connect(AMQP_URL, (error0, connection) => {
  if (error0) {
    throw error0;
  }
  connection.createChannel(async (error1, channel) => {
    if (error1) {
      throw error1;
    }

    const stations = await get(urlStations);
    const stationsStringify = JSON.stringify(stations);

    const queue = "information";

    channel.assertQueue(queue, { durable: false });
    channel.sendToQueue(queue, Buffer.from(stationsStringify));
    console.log("Information Send");
  });
  setTimeout(() => {
    connection.close();
  }, 10000);
});

// schedule a cron task to fetch the information of the stations every 10min
cron.schedule("*/10 * * * *", () => {
  amqp.connect(AMQP_URL, (error0, connection) => {
    if (error0) {
      throw error0;
    }
    connection.createChannel(async (error1, channel) => {
      if (error1) {
        throw error1;
      }

      const stations = await get(urlStations);
      const stationsStringify = JSON.stringify(stations);

      const queue = "information";

      channel.assertQueue(queue, { durable: false });
      channel.sendToQueue(queue, Buffer.from(stationsStringify));
      console.log("Information Send");
    });
    setTimeout(() => {
      connection.close();
    }, 10000);
  });
  console.log("Fetch information");
});

// schedule a cron task to fetch the status of the stations every min
cron.schedule("* * * * *", () => {
  amqp.connect(AMQP_URL, (error0, connection) => {
    if (error0) {
      throw error0;
    }
    connection.createChannel(async (error1, channel) => {
      if (error1) {
        throw error1;
      }

      const status = await get(urlStatus);
      const stationsStringify = JSON.stringify(status);

      const queue = "status";

      channel.assertQueue(queue, { durable: false });
      channel.sendToQueue(queue, Buffer.from(stationsStringify));
      console.log("Status Send");
    });
    setTimeout(() => {
      connection.close();
    }, 10000);
  });
  console.log("Fetch status");
});
