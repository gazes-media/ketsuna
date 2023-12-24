import { APIInteraction, APIInteractionResponse, APIInteractionResponseCallbackData, BaseInteraction, Client, InteractionResponseType, RESTGetAPIWebhookWithTokenMessageResult, Routes } from "discord.js";
import { FastifyReply } from "fastify";
export default class InteractionBaseWebhook extends BaseInteraction {
    http: FastifyReply;
    constructor(data: APIInteraction, client: Client<true>, res: FastifyReply) {
        super(client, data);
        this.http = res;
    }

    json(data: APIInteractionResponse){
        return this.http.code(200).header('Content-Type', 'application/json; charset=utf-8').send(data);
    }

    reply(response: APIInteractionResponseCallbackData) {
        this.json({  
            type: InteractionResponseType.ChannelMessageWithSource,
            data: response
        });
        return this.getMessage();
    }

    premiumReply() {
        return this.json({
            type: InteractionResponseType.PremiumRequired,
        });
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

    async delete() {
        return this.json({
            type: InteractionResponseType.DeferredMessageUpdate
        });
    }

    async followUpEdit(response: APIInteractionResponseCallbackData) {
        return this.json({
            type: InteractionResponseType.UpdateMessage,
            data: response
        });
    }

    async getMessage() {
        let APIMessage = await this.client.rest.get(Routes.webhookMessage(this.client.application.id, this.token)) as RESTGetAPIWebhookWithTokenMessageResult;
        if (this.channel) {
            return await this.channel.messages.fetch(APIMessage.id);
        }
    }

}