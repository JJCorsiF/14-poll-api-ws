import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import z from "zod";

import { prisma } from "../../database";
import HttpStatusCode from "../http-status-code.enum";

export async function createPoll(app: FastifyInstance) {
    app.post("/polls", async (request: FastifyRequest, reply: FastifyReply) => {
        const { title, options } = z.object({ title: z.string(), options: z.array(z.string()) }).parse(request.body);

        const poll = await registerNewPoll(title, options);

        return reply.status(HttpStatusCode.Created).send({pollId: poll.id});
    });
}

async function registerNewPoll(title: string, options: string[]) {
    return await prisma.poll.create({
        data: {
            title,
            options: {
                createMany: {
                    data: options.map(option => ({
                        title: option
                    }))
                }
            }
        }
    });
}
