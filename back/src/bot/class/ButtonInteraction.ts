import { APIInteraction, Client } from "discord.js";
import InteractionBaseWebhook from "./interaction";
import { FastifyReply } from "fastify";
import MessageComponentWebhook from "./MessageComponent";

export default class ButtonInteractionWebhook extends MessageComponentWebhook {
    constructor(data: APIInteraction, client: Client<true>, res: FastifyReply) {
        super(data, client, res);
        if(this.componentActual !== "button") throw new Error("This is not a button interaction");
    }
}