import { FastifyInstance, FastifyRequest } from "fastify";
import z from "zod";

import { VoteOnPollMessage, voteOnPollPublisher } from "../vote-on-poll-publisher";

export async function openPollWebsocket(app: FastifyInstance) {
    app.get('/polls/:id/websocket', { websocket: true }, (socket, request: FastifyRequest) => {
        const { id } = z.object({ id: z.string().uuid() }).parse(request.params);

        voteOnPollPublisher.subscribe(id, (message: VoteOnPollMessage) => {
            socket.send(JSON.stringify(message));
        });
    });
}