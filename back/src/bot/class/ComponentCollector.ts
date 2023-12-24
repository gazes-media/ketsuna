import { Collector, Snowflake, CollectorOptions, Message } from "discord.js";
import MessageComponentWebhook from "./MessageComponent";
import Bot from "..";
import InteractionBaseWebhook from "./interaction";

export default class ComponentCollector extends Collector<Snowflake,MessageComponentWebhook, unknown[]> {
    message: Message<boolean>;
    public dispose(interaction: MessageComponentWebhook): Snowflake| null {
        if(!interaction.isMessageComponentWebhook()) return null;
        if(interaction.message?.id !== this.message.id) return null;
        if(this.message.channel.id !== interaction.channelId) return null;        
        return interaction.id;
    }
    public collect(interaction: MessageComponentWebhook): Snowflake| null {
        if(!interaction.isMessageComponentWebhook()) return null;
        if(interaction.message?.id !== this.message.id) return null;
        if(this.message.channel.id !== interaction.channelId) return null;
        return interaction.id;
    }

    constructor(bot: Bot, options: ComponentCollectorOptions) {
        let client = bot.application?.client;
        if(!client) throw new Error("Client is not ready");
        super(client, options);
        this.message = options.message;
        bot.onCustomInteraction(this.handleCollect);
        this.on("end", () => {
            bot.offCustomInteraction(this.handleCollect);
        })
    }
}

interface ComponentCollectorOptions extends CollectorOptions<[MessageComponentWebhook, ...unknown[]]>{
    message:Message;
}