import { FastifyReply } from "fastify";
import InteractionBaseWebhook from "./interaction";
import { APIInteraction, APIModalInteractionResponseCallbackData, InteractionResponseType } from "discord.js";
import Bot from "..";

export default class ModalInteraction extends InteractionBaseWebhook {
    constructor(data: APIInteraction, bot: Bot, res: FastifyReply) {
        super(data, bot, res);
    }

    submit(response: APIModalInteractionResponseCallbackData) {
        return this.json({
            type: InteractionResponseType.Modal,
            data: response
        });
    }
}