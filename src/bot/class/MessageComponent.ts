import { FastifyReply } from "fastify";
import InteractionBaseWebhook from "./interaction";
import { APIInteraction, APIInteractionResponseCallbackData, Client, InteractionResponseType } from "discord.js";
import Bot from "..";

export default class MessageComponentWebhook extends InteractionBaseWebhook {
    public componentActual: "button" | "selectMenu" | "unknown" = "unknown";
    constructor(data: APIInteraction, bot: Bot, res: FastifyReply) {
        super(data, bot, res);
    }
    defer() {
        return this.json({ type: InteractionResponseType.DeferredMessageUpdate });
    }

    async edit(response: APIInteractionResponseCallbackData) {
        return this.json({
            type: InteractionResponseType.UpdateMessage,
            data: response
        });
    }
}