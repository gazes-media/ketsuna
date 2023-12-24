import { APIInteraction, ChatInputCommandInteraction, Client, CommandInteraction } from "discord.js";
import InteractionBaseWebhook from "./interaction";
import { FastifyReply } from "fastify";

export default class CommandInteractionWebHook extends InteractionBaseWebhook {
    command: ChatInputCommandInteraction;
    constructor(data: APIInteraction, client: Client<true>, res: FastifyReply) {
        super(data, client, res);
        this.command = new ChatInputCommandInteraction(client, data);
    }
    
}
