// #!/usr/bin/env node

const cron = require('node-cron');
const express = require('express');
const amqp = require('amqplib/callback_api');
const XMLHttpRequest = require('xhr2');

const app = express();

async function get(url) {
  return new Promise((resolve) => {
      const xhr = new XMLHttpRequest();
      xhr.open("GET", url, true);
      xhr.responseType = "json";
      xhr.onload = () => resolve(xhr.response);
      xhr.send(null);
  });
}


// Schedule tasks to be run on the server.
cron.schedule('*/10 * * * *', function() {
      amqp.connect('amqp://localhost', function(error0, connection) {
        if (error0) {
            throw error0;
        }
        connection.createChannel(async function(error1, channel) {
            if (error1) {
                throw error1;
            }

            const url = `https://gbfs.citibikenyc.com/gbfs/en/station_information.json`;
            const stations = await get(url);
            const stations_stringify = JSON.stringify(stations);

            var queue = 'information';

            channel.assertQueue(queue, {
                durable: false
            });
            channel.sendToQueue(queue,  Buffer.from(stations_stringify));
            // console.log(" [x] Sent %s", stations_stringify);
            console.log("Information Send");
        });
        // setTimeout(function() {
        //     connection.close();
        //     process.exit(0);
        // }, 10000);
    });
    console.log('running a task every minute');
  });