import { APIInteraction } from "discord.js";
import { FastifyReply } from "fastify";
import MessageComponentWebhook from "./MessageComponent";
import Bot from "..";

export default class ButtonInteractionWebhook extends MessageComponentWebhook {
    constructor(data: APIInteraction, client: Bot, res: FastifyReply) {
        super(data, client, res);
        if(this.componentActual !== "button") throw new Error("This is not a button interaction");
    }
}