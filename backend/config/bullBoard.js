const { createBullBoard } = require("@bull-board/api");
const { BullAdapter } = require("@bull-board/api/bullAdapter");
const { ExpressAdapter } = require("@bull-board/express");
const { reminderQueue } = require("./bullQueue"); // Import Bull queue

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath("/admin/queues");

createBullBoard({
    queues: [new BullAdapter(reminderQueue)],
    serverAdapter,
});

module.exports = serverAdapter;
