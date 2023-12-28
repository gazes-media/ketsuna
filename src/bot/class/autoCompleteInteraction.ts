import { APICommandAutocompleteInteractionResponseCallbackData, APIInteraction, AutocompleteInteraction, Client, InteractionResponseType } from "discord.js";
import InteractionBaseWebhook from "./interaction";
import { FastifyReply } from "fastify";
import Bot from "..";

export default class AutocompleteInteractionWebHook extends InteractionBaseWebhook {
    command: AutocompleteInteraction;
    options: AutocompleteInteraction["options"];
    constructor(data: APIInteraction, bot: Bot, res: FastifyReply) {
        super(data, bot, res);
        this.command = new AutocompleteInteraction(this.client, data);
        this.options = this.command.options;
    }

    respond(response: APICommandAutocompleteInteractionResponseCallbackData) {
        return this.json({
            type: InteractionResponseType.ApplicationCommandAutocompleteResult,
            data: response
        });
    }
}