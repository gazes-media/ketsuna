import { ActivityType, Client, GatewayIntentBits, Partials } from "discord.js";

export default class Bot extends Client {
  constructor() {
    const isDev = process.env.NODE_ENV === "development";
    super({
        intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
        partials: [Partials.Channel, Partials.Message, Partials.GuildMember, Partials.User, Partials.Reaction],
        allowedMentions: { parse: ["users", "roles"], repliedUser: true },
        presence: { status: "online", activities: [{
            name: isDev ? "in development" : "Ketsuna is the Best Bot",
            type: ActivityType.Playing,
            state: "Ketsuna is the Best Bot",
        }]
      },
    });
    
  }

    public async init() {
      this.login(process.env.BOT_TOKEN);
        this.on("ready", () => {
            console.log("Bot is ready!");
        });
    }

    public async stop() {
        this.destroy();
    }
}