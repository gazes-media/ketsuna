import { Collector, Snowflake, CollectorOptions } from "discord.js";
import Bot from "..";
import ModalInteraction from "./ModalInteraction";

export default class ModalCollector extends Collector<Snowflake,ModalInteraction, unknown[]> {
    max?: number;
    total: number = 0;
    constructor(bot: Bot, options: ModalCollectorOptions) {
        let client = bot.application?.client;
        if(!client) throw new Error("Client is not ready");
        super(client, options);        
        if(options.max) this.max = options.max;
        this.on("collect", (_) => {
            this.total += 1;
            if(this.max && this.total >= this.max) this.stop("max");
        });
        bot.onCustomInteraction(this.handleCollect);
        this.on("end", () => {
            bot.offCustomInteraction(this.handleDispose);
        })
        
    }
    
    public dispose(interaction: ModalInteraction): Snowflake| null {
        if(!interaction.isModalSubmitWebhook()) return null;
        return interaction.id;
    }
    public collect(interaction: ModalInteraction): Snowflake| null {
        if(!interaction.isModalSubmitWebhook()) return null;
        return interaction.id;
    }
}

export interface ModalCollectorOptions extends CollectorOptions<[ModalInteraction, ...unknown[]]>{
    max?: number;
}