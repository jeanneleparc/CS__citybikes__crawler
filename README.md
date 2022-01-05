Run RabbitMQ
`docker run -it --rm --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3.9-management`

<!-- then launch the crawler `npm run dev` -->

to send the station information `npm run information`
to send the station status `npm run status` (to be done once there are information in the db)

or `npm run dev` to launch the cron task