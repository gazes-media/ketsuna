import { APIInteraction, APIInteractionResponse, APIInteractionResponseCallbackData, APIMessage, APIModalComponent, APIModalInteractionResponseCallbackData, AutocompleteInteraction, BaseInteraction, ButtonInteraction, CacheType, Client, Component, InteractionReplyOptions, InteractionResponseType, InteractionType, InteractionWebhook, Message, MessageComponentInteraction, MessagePayload, MessageResolvable, ModalSubmitActionRowComponent, RESTGetAPIWebhookWithTokenMessageResult, Routes, WebhookMessageEditOptions } from "discord.js";
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
    components: ModalSubmitActionRowComponent[] = [];
    webhook: InteractionWebhook;
    timeCreated: number = Date.now();
    constructor(data: APIInteraction, bot: Bot, res: FastifyReply) {
        let client = bot.application?.client;
        if(!client) throw new Error("Client is not ready");
        super(client, data);
        this.http = res;
        this.bot = bot;
        this.webhook = new InteractionWebhook(client, this.applicationId, this.token);
        if(data.message) {
            this.message = data.message;
        }
        if(data.data) {
            if(data.type === InteractionType.MessageComponent) {
                this.customId = data.data.custom_id;
            }
            if(data.type === InteractionType.ModalSubmit) {
                this.components = data.data.components;
                this.customId = data.data.custom_id;
            }
        }
    }

    json(data: APIInteractionResponse){
        return this.http.code(200).header('Content-Type', 'application/json; charset=utf-8').send(data);
    }
    /*
    * Checks if the interaction is expired or not (15 minutes)
    */
    checkIfExpired() {
        return Date.now() - this.timeCreated > (15 * 60 * 1000);
    }

    reply(response: APIInteractionResponseCallbackData) {
        this.json({  
            type: InteractionResponseType.ChannelMessageWithSource,
            data: response
        });
        return new Promise<Message>(async (resolve, reject) => {
            try{
                let message = await this.webhook.fetchMessage("@original");
                resolve(message);
            }catch(e) {
                reject(e);
            }
        });
    }

    premiumReply() {
        return this.json({
            type: InteractionResponseType.PremiumRequired,
        });
    }
    
    
    async followUp(response: APIInteractionResponseCallbackData) {
        return this.json({
            type: InteractionResponseType.DeferredChannelMessageWithSource,
            data: response
        });
    }

    async editReply(options: string | MessagePayload | WebhookMessageEditOptions){
        if(this.checkIfExpired()) throw new Error("Interaction is expired");
        return this.webhook.editMessage("@original", options);
    }

    async getMessage() {
       if(this.checkIfExpired()) throw new Error("Interaction is expired");
       return await this.webhook.fetchMessage("@original");
    }

    async deleteReply() {
        return this.webhook.deleteMessage("@original");
    }

    async createMessage(options: string | MessagePayload | InteractionReplyOptions) {
        return await this.webhook.send(options);
    }

    async createComponentCollector(options: Omit<ComponentCollectorOptions,"message">) {
        let message = await this.getMessage();
        if(!message) throw new Error("Message is not found");
        return new ComponentCollector(this.bot, {
            ...options,
            message
        });
    }

    showModal(response: APIModalInteractionResponseCallbackData) {
        return this.json({
            type: InteractionResponseType.Modal,
            data: response
        });
    }

    awaitModalSubmit(options:ModalCollectorOptions ) {
        return new Promise<ModalInteraction>((resolve, reject) => {
            const collector = new ModalCollector(this.bot, options);
            collector.once("collect", (interaction) => {
                console.log(interaction);
                resolve(interaction);
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