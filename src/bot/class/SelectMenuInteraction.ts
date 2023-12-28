import { FastifyReply } from "fastify";
import InteractionBaseWebhook from "./interaction";
import { APIInteraction } from "discord.js";
import Bot from "..";

export default class SelectMenuInteractionWebhook extends InteractionBaseWebhook {
    public componentActual: "button" | "selectMenu" | "unknown" = "unknown";
    values: string[];
    constructor(data: APIInteraction, bot: Bot, res: FastifyReply) {
        super(data, bot, res);
    }
}