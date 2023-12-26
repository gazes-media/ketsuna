import { FastifyReply } from "fastify";
import InteractionBaseWebhook from "./interaction";
import { APIInteraction, APIModalInteractionResponseCallbackData, InteractionResponseType } from "discord.js";
import Bot from "..";

export default class ModalInteraction extends InteractionBaseWebhook {
    constructor(data: APIInteraction, bot: Bot, res: FastifyReply) {
        super(data, bot, res);
    }

    getValue(key: string): string | null {
        let value = "";
        if(this.isModalSubmit()) {
            value = this.fields.getTextInputValue(key);
        }
        return value !== "" ? value : null;
    }
}