import { ActivityType, Awaitable, Client, Events, GatewayIntentBits, Partials } from "discord.js";
import AIHorde from "../internal_libs/aihorde";
import * as commandList from "./list.commands";
import CommandsBase from "./commands/baseCommands";
import ComponentCollector from "./class/ComponentCollector";
import InteractionBaseWebhook from "./class/interaction";
export default class Bot extends Client {
  timeouts: Map<string, Map<string, boolean>> = new Map<string, Map<string, boolean>>();
  aiHorde: AIHorde = new AIHorde({
    cache_interval: 1000 * 10,
    cache: {
      generations_check: 1000 * 30,
    },
    client_agent: "Ketsuna;Discordbot;1.0.1;",
    default_token: "0000000000"
  })
  commands: Map<string, CommandsBase> = new Map<string, CommandsBase>();
  componentsCollectors: Map<string, ComponentCollector> = new Map<string, ComponentCollector>();
  constructor() {
    const isDev = process.env.NODE_ENV === "development";
    super({
      intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
      partials: [Partials.Channel, Partials.Message, Partials.GuildMember, Partials.User, Partials.Reaction],
      allowedMentions: { parse: ["users", "roles"], repliedUser: true },
      presence: {
        status: "online", activities: [{
          name: isDev ? "in development" : "Ketsuna is here to help you!",
          type: ActivityType.Playing,
          state: "Ketsuna is the Best Bot",
        }]
      },
    });
  }

  public async init() {
    console.log("Bot is starting...");
    this.login(process.env.DISCORD_TOKEN);
    this.on("ready", () => {
      console.log("Bot is ready!");
      this.loadCommands();
    });
  }

  public loadCommands() {
    for (const command of Object.values(commandList)) {
      const cmd = new command(this);
      this.commands.set(cmd.name, cmd);
      this.timeouts.set(cmd.name, new Map<string, boolean>());
    }
  }

  emitCustomInteraction(data: InteractionBaseWebhook) {
    return this.emit("customInteraction", data);
  }

  onCustomInteraction(listener: (data: InteractionBaseWebhook) => Awaitable<void>) {
    return this.on("customInteraction", listener);
  }

  offCustomInteraction(listener: (data: InteractionBaseWebhook) => Awaitable<void>) {
    return this.off("customInteraction", listener);
  }

}


