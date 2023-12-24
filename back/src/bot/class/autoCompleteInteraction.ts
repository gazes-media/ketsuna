import { APICommandAutocompleteInteractionResponseCallbackData, APIInteraction, APIInteractionResponseCallbackData, AutocompleteInteraction, Client, InteractionResponseType } from "discord.js";
import InteractionBaseWebhook from "./interaction";
import { FastifyReply, FastifySchema, FastifyTypeProviderDefault, RawServerDefault, RouteGenericInterface } from "fastify";
import { IncomingMessage, ServerResponse } from "http";

export default class AutocompleteInteractionWebHook extends InteractionBaseWebhook {
    command: AutocompleteInteraction;
    constructor(data: APIInteraction, client: Client<true>, res: FastifyReply) {
        super(data, client, res);
        this.command = new AutocompleteInteraction(client, data);
    }

    respond(response: APICommandAutocompleteInteractionResponseCallbackData) {
        return this.json({
            type: InteractionResponseType.ApplicationCommandAutocompleteResult,
            data: response
        });
    }
}