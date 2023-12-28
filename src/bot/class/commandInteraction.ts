import { APIInteraction, ChatInputCommandInteraction, Client, CommandInteraction } from "discord.js";
import InteractionBaseWebhook from "./interaction";
import { FastifyReply } from "fastify";
import Bot from "..";

export default class CommandInteractionWebHook extends InteractionBaseWebhook {
    command: ChatInputCommandInteraction;
    options: CommandInteraction["options"];
    constructor(data: APIInteraction, bot: Bot, res: FastifyReply) {
        super(data, bot, res);
        this.command = new ChatInputCommandInteraction(this.client, data);
        this.options = this.command.options;
    }
    
}
