import { APIInteraction, APIInteractionResponse, APIInteractionResponseCallbackData, APIMessage, APIModalInteractionResponseCallbackData, AutocompleteInteraction, BaseInteraction, ButtonInteraction, CacheType, Client, InteractionResponseType, InteractionType, MessageComponentInteraction, RESTGetAPIWebhookWithTokenMessageResult, Routes } from "discord.js";
import { FastifyReply } from "fastify";
import AutocompleteInteractionWebHook from "./autoCompleteInteraction";
import CommandInteractionWebHook from "./commandInteraction";
import MessageComponentWebhook from "./MessageComponent";
import ModalInteraction from "./ModalInteraction";
import ModalCollector, { ModalCollectorOptions } from "./ModalCollector";
import Bot from "..";
import ComponentCollector, { ComponentCollectorOptions } from "./ComponentCollector";
export default class InteractionBaseWebhook extends BaseInteraction {
    http: FastifyReply;
    message?: APIMessage;
    customId?: string;
    bot: Bot;
    constructor(data: APIInteraction, bot: Bot, res: FastifyReply) {
        let client = bot.application?.client;
        if(!client) throw new Error("Client is not ready");
        super(client, data);
        this.http = res;
        this.bot = bot;
        if(data.message) {
            this.message = data.message;
        }
        if(data.data) {
            if(data.type === InteractionType.MessageComponent) {
                this.customId = data.data.custom_id;
            }
        }
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
    
    async getMessage() {
        if(this.message) {
            if(this.channel) {
                return await this.channel.messages.fetch(this.message.id);
            }
        }
        let APIMessage = await this.client.rest.get(Routes.webhookMessage(this.client.application.id, this.token)) as RESTGetAPIWebhookWithTokenMessageResult;
        if (this.channel) {
            return await this.channel.messages.fetch(APIMessage.id);
        }
    }

    createComponentCollector(options: ComponentCollectorOptions) {
        return new ComponentCollector(this.bot, options);
    }

    showModal(response: APIModalInteractionResponseCallbackData) {
        return this.json({
            type: InteractionResponseType.Modal,
            data: response
        });
    }

    awaitModalSubmit(options:ModalCollectorOptions ) {
        const collector = new ModalCollector(this.bot, options);
        return new Promise<ModalInteraction>((resolve, reject) => {
            collector.once("end", (collected, reason) => {
                if(reason === "time") reject("time");
                else{
                    let interaction = collected.first();
                    if(interaction && interaction.isModalSubmitWebhook()) resolve(interaction);
                    else reject("time");
                }
            });

            collector.once("collect", (interaction) => {
                if(interaction.isModalSubmitWebhook()) resolve(interaction);
                else reject("Not a ModalSubmitInteraction");
            });
        });
    }

    public isWebhookAutocomplete(): this is AutocompleteInteractionWebHook {
        return this.type === InteractionType.ApplicationCommandAutocomplete;
    }

    public isCommandWebhook(): this is CommandInteractionWebHook {
        return this.type === InteractionType.ApplicationCommand;
    }

    public isMessageComponentWebhook(): this is MessageComponentWebhook {
        return this.type === InteractionType.MessageComponent;
    }

    public isModalSubmitWebhook(): this is ModalInteraction {
        return this.type === InteractionType.ModalSubmit;
    }
}