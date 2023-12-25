import { FastifyReply } from "fastify";
import InteractionBaseWebhook from "./interaction";
import { APIInteraction, Client } from "discord.js";
import Bot from "..";

export default class MessageComponentWebhook extends InteractionBaseWebhook {
    public componentActual: "button" | "selectMenu" | "unknown" = "unknown";
    constructor(data: APIInteraction, bot: Bot, res: FastifyReply) {
        super(data, bot, res);
    }
}