const { ServiceBusClient } = require("@azure/service-bus");

module.exports = async function (context, req) {
    const connectionString = req.headers["x-sbconnectionstring"];
    const subject = req.headers["x-subject"]
    const topic = req.headers["x-topic"]

    if (!connectionString || !subject || !topic) {
        context.res = {
            status: 400,
            body: "Please pass a connection string (x-connectionstring), a subject (x-subject) and a topic (x-topic) in the request header"
        };
        return;
    }

    const { body } = req

    const sbClient = new ServiceBusClient(connectionString);
    const sender = sbClient.createSender(topic);

    try {

        await sender.sendMessages({
            body,
            contentType: "application/json",
            subject
        });

    } catch (err) {
        context.res = {
            status: 500,
            body: err.message
        };
        return;
    } finally {
        await sender.close();
        await sbClient.close();
    }

    context.res = {
        body: "ok"
    };
}