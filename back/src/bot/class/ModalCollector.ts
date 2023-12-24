import { Collector, Snowflake, CollectorOptions } from "discord.js";
import Bot from "..";
import ModalInteraction from "./ModalInteraction";
import InteractionBaseWebhook from "./interaction";

export default class ModalCollector extends Collector<Snowflake,ModalInteraction, unknown[]> {
    public dispose(interaction: ModalInteraction): Snowflake| null {
        if(!interaction.isModalSubmitWebhook()) return null;
        return interaction.id;
    }
    public collect(interaction: ModalInteraction): Snowflake| null {
        if(!interaction.isModalSubmitWebhook()) return null;
        return interaction.id;
    }

    constructor(bot: Bot, options: ModalCollectorOptions) {
        let client = bot.application?.client;
        if(!client) throw new Error("Client is not ready");
        super(client, options);
        bot.onCustomInteraction(this.handleCollect);
        this.on("end", () => {
            bot.offCustomInteraction(this.handleCollect);
        })
        
    }
}

export interface ModalCollectorOptions extends CollectorOptions<[ModalInteraction, ...unknown[]]>{
}