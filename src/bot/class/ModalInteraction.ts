import { FastifyReply } from "fastify";
import InteractionBaseWebhook from "./interaction";
import { APIInteraction, ComponentType, ModalSubmitFields, ModalSubmitInteraction, TextInputComponent } from "discord.js";
import Bot from "..";

export default class ModalInteraction extends InteractionBaseWebhook {
    fields: ModalSubmitFields;
    constructor(data: APIInteraction, bot: Bot, res: FastifyReply) {
        super(data, bot, res);
    }

    getValue(key: string): string | null {
        let field = this.components.find((c) => {
            return c.type === ComponentType.ActionRow && c.components.find((c) => {
                return c.type === ComponentType.TextInput && c.custom_id === key;
            });
        }).components.find((c) => {
            return c.type === ComponentType.TextInput && c.custom_id === key;
        });
        return field ? (field.value) : null;
    }
}