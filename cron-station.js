// #!/usr/bin/env node

const cron = require('node-cron');
const amqp = require('amqplib/callback_api');
const XMLHttpRequest = require('xhr2');

async function get(url) {
  return new Promise((resolve) => {
      const xhr = new XMLHttpRequest();
      xhr.open("GET", url, true);
      xhr.responseType = "json";
      xhr.onload = () => resolve(xhr.response);
      xhr.send(null);
  });
}
const AMQP_URL = process.env.AMQP_URL || 'amqp://localhost';
const url_stations = `https://gbfs.citibikenyc.com/gbfs/en/station_information.json`;
const url_status = `https://gbfs.citibikenyc.com/gbfs/en/station_status.json`;

// fetch the information of the stations to fill the database
amqp.connect(AMQP_URL, function(error0, connection) {
    if (error0) { throw error0; }
    connection.createChannel(async function(error1, channel) {
        if (error1) { throw error1; }

        const stations = await get(url_stations);
        const stations_stringify = JSON.stringify(stations);

        var queue = 'information';

        channel.assertQueue(queue, { durable: false });
        channel.sendToQueue(queue,  Buffer.from(stations_stringify));
        console.log("Information Send");
    });
    setTimeout(function() { connection.close(); }, 10000);
});

// schedule a cron task to fetch the information of the stations every 10min
cron.schedule('*/10 * * * *', function() {
    amqp.connect(AMQP_URL, function(error0, connection) {
        if (error0) { throw error0; }
        connection.createChannel(async function(error1, channel) {
            if (error1) { throw error1; }
    
            const stations = await get(url_stations);
            const stations_stringify = JSON.stringify(stations);
    
            var queue = 'information';
    
            channel.assertQueue(queue, { durable: false });
            channel.sendToQueue(queue,  Buffer.from(stations_stringify));
            console.log("Information Send");
        });
        setTimeout(function() { connection.close(); }, 10000);
    });
    console.log('Fetch information');
  });

// schedule a cron task to fetch the status of the stations every min
cron.schedule('* * * * *', function() {
    amqp.connect(AMQP_URL, function(error0, connection) {
        if (error0) { throw error0; }
        connection.createChannel(async function(error1, channel) {
            if (error1) { throw error1; }

            const status = await get(url_status);
            const status_stringify = JSON.stringify(status);

            var queue = 'status';

            channel.assertQueue(queue, { durable: false });
            channel.sendToQueue(queue,  Buffer.from(status_stringify));
            console.log("Status Send");
        });
        setTimeout(function() { connection.close(); }, 10000);
    });
    console.log('Fetch status');
  });