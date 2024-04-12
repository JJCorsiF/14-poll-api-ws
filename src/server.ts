import cookie from "@fastify/cookie";
import websocket from "@fastify/websocket";
import fastify from "fastify";

import process from "process";
import { createPoll } from "./api/routes/create-poll";
import { getPoll } from "./api/routes/get-poll";
import { openPollWebsocket } from "./api/routes/open-poll-websocket";
import { voteOnPoll } from "./api/routes/vote-on-poll";

const app = fastify();

app.register(cookie, {
    secret: process.env.COOKIE_SECRET,
    hook: 'onRequest'
});
app.register(websocket);

app.register(createPoll);
app.register(getPoll);
app.register(voteOnPoll);
app.register(openPollWebsocket);

const port = process.env.PORT ? Number(process.env.PORT) : 3333;

app.listen({port}).then(() => {
    console.log(`HTTP server running on port ${port}`);
});
