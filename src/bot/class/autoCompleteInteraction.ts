import { APICommandAutocompleteInteractionResponseCallbackData, APIInteraction, AutocompleteInteraction, Client, InteractionResponseType } from "discord.js";
import InteractionBaseWebhook from "./interaction";
import { FastifyReply } from "fastify";
import Bot from "..";

export default class AutocompleteInteractionWebHook extends InteractionBaseWebhook {
    command: AutocompleteInteraction;
    constructor(data: APIInteraction, bot: Bot, res: FastifyReply) {
        super(data, bot, res);
        this.command = new AutocompleteInteraction(this.client, data);
    }

    respond(response: APICommandAutocompleteInteractionResponseCallbackData) {
        return this.json({
            type: InteractionResponseType.ApplicationCommandAutocompleteResult,
            data: response
        });
    }
}