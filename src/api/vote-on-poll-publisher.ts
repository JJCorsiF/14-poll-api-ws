import { Publisher } from "./publisher";

export type VoteOnPollMessage = { pollOptionId: string, numberOfVotes: number };

export const voteOnPollPublisher = new Publisher<VoteOnPollMessage>();
