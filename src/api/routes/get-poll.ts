import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import z from "zod";

import { redis } from "../../cache";
import { prisma } from "../../database";

export async function getPoll(app: FastifyInstance) {
    app.get('/polls/:id', async (request: FastifyRequest, reply: FastifyReply) => {
        const { id } = z.object({ id: z.string().uuid() }).parse(request.params);

        const poll = await findPollById(id);

        if (!poll) {
            return reply.status(400).send({message: 'Poll not found.'});
        }

        const response = addScoresToPoll(poll);

        return reply.send({poll: response});
    });
}

async function addScoresToPoll(poll: { options: { id: string; title: string; }[]; } & { id: string; title: string; createdAt: Date; updatedAt: Date; }) {
    const votes = await getPollVotes(poll.id);

    return {
        id: poll.id,
        title: poll.title,
        options: poll.options.map((option: {id: string, title: string}) => ({
            id: option.id,
            title: option.title,
            score: (option.id in votes) ? votes[option.id] : 0
        }))
    };
}

async function findPollById(id: string) {
    return await prisma.poll.findUnique({
        where: {
            id
        },
        include: {
            options: {
                select: {
                    id: true,
                    title: true
                }
            }
        }
    });
}

async function getPollVotes(pollId: string) {
    const scores = await redis.zrange(pollId, 0, -1, 'WITHSCORES');

    return scores.reduce((prev, curr, index) => {
        if (index % 2 === 0) {
            const score = scores[index + 1];

            Object.assign(prev, { [curr]: Number(score) });
        }

        return prev;
    }, {} as Record<string, number>);
}
