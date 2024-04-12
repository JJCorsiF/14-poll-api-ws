import { randomUUID } from "crypto";
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import z from "zod";

import { redis } from "../../cache";
import { prisma } from "../../database";
import HttpStatusCode from "../http-status-code.enum";
import { voteOnPollPublisher } from "../vote-on-poll-publisher";

const NUMBER_OF_SECONDS_IN_A_DAY = 60 * 60 * 24;

export async function voteOnPoll(app: FastifyInstance) {
    app.post("/polls/:id/vote", async (request: FastifyRequest, reply: FastifyReply) => {
        const { id: pollId } = z.object({ id: z.string().uuid() }).parse(request.params);

        const { pollOptionId } = z.object({ pollOptionId: z.string().uuid() }).parse(request.body);

        let { sessionId } = request.cookies;

        if (!sessionId) {
            sessionId = generateSessionId();
            setSessionCookie(reply, sessionId);
        } else {
            const previousVoteOnPoll = await prisma.vote.findUnique({
                where: {
                    sessionId_pollId: {
                        sessionId,
                        pollId
                    }
                }
            });

            if (previousVoteOnPoll) {
                if (previousVoteOnPoll.pollOptionId === pollOptionId) {
                    return reply.status(400).send({ message: 'You already voted on this poll.' });
                }

                await deleteVote(previousVoteOnPoll);
            }
        }

        await registerVote(pollId, sessionId, pollOptionId);

        return reply.status(HttpStatusCode.Created).send();
    });
}

function generateSessionId() {
    let sessionId;

    while (!sessionId) {
        sessionId = randomUUID();
    }
    return sessionId;
}

async function deleteVote(previousVoteOnPoll: { id: number; sessionId: string; createdAt: Date; pollId: string; pollOptionId: string; }) {
    await prisma.vote.delete({
        where: {
            id: previousVoteOnPoll.id
        }
    });

    const votes = await redis.zincrby(previousVoteOnPoll.pollId, -1, previousVoteOnPoll.pollOptionId);

    const numberOfVotes = Number(votes);

    voteOnPollPublisher.publish(previousVoteOnPoll.pollId, {
        pollOptionId: previousVoteOnPoll.pollOptionId,
        numberOfVotes
    });
}

async function registerVote(pollId: string, sessionId: string, pollOptionId: string) {
    const lastVoteId = (await prisma.vote.findFirst({
        select: {
            id: true
        },
        orderBy: {
            id: 'desc'
        }
    }))?.id ?? 0;

    await prisma.vote.create({
        data: {
            id: (lastVoteId + 1),
            pollId,
            sessionId,
            pollOptionId
        }
    });

    const votes = await redis.zincrby(pollId, 1, pollOptionId);

    const numberOfVotes = Number(votes);

    voteOnPollPublisher.publish(pollId, {
        pollOptionId,
        numberOfVotes
    });
}

function setSessionCookie(reply: FastifyReply, sessionId: string) {
    reply.setCookie('sessionId', sessionId, {
        path: '/',
        maxAge: 30 * NUMBER_OF_SECONDS_IN_A_DAY,
        signed: true,
        httpOnly: true
    });
}
