import {
  ActivityType,
  Client,
  ContextMenuCommandInteraction,
  Events,
  GatewayIntentBits,
  MessageContextMenuCommandInteraction,
  ModalSubmitInteraction,
  Partials,
} from "discord.js";
import AIHorde from "../internal_libs/aihorde";
import * as commandList from "./list.commands";
import CommandsBase from "./commands/baseCommands";
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";
export default class Bot extends Client {
  timeouts: Map<string, Map<string, boolean>> = new Map<
    string,
    Map<string, boolean>
  >();
  aiHorde: AIHorde = new AIHorde({
    cache_interval: 1000 * 10,
    cache: {
      generations_check: 1000 * 30,
    },
    client_agent: "Ketsuna;Discordbot;1.0.1;",
    default_token: "0000000000",
  });
  commands: Map<string, CommandsBase> = new Map<string, CommandsBase>();
  database: PrismaClient;
  security_key: Buffer;
  constructor() {
    const isDev = process.env.NODE_ENV === "development";
    super({
      intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
      partials: [
        Partials.Channel,
        Partials.Message,
        Partials.GuildMember,
        Partials.User,
        Partials.Reaction,
      ],
      allowedMentions: { parse: ["users", "roles"], repliedUser: true },
      presence: {
        status: "online",
        activities: [
          {
            name: isDev
              ? "in development"
              : process.env.DISCORD_STATUS_NAME || "Ketsuna is the Best Bot",
            type: ActivityType.Playing,
            state:
              process.env.DISCORD_STATUS_STATE || "Ketsuna is the Best Bot",
          },
        ],
      },
    });
    let key = process.env.SECURITY_KEY || "R5U8X/A?D(G+KbPeShVmYq3t6w9z$C&F";
    this.security_key = Buffer.from(key, "utf-8");
  }

  public async init() {
    console.log("Bot is starting...");
    this.login(process.env.DISCORD_TOKEN);
    this.on("ready", () => {
      console.log("Bot is ready!");
      this.loadCommands();
      setTimeout(() => {
        this.application.commands.fetch().then((commands) => {
          commands.forEach((command) => {
            if (!this.commands.has(command.name)) {
              command
                .delete()
                .then(() => {
                  console.log(`[ApplicationCommand] ${command.name} deleted`);
                })
                .catch((err) => {
                  console.log(
                    `[ApplicationCommand] ${command.name} not deleted`,
                  );
                  console.log(err);
                });
            }
          });
        });
      }, 1000 * 5);
    });

    this.on(Events.InteractionCreate, async (interaction) => {
      if (interaction.isCommand()) {
        let command = this.commands.get(interaction.commandName);
        if (command) {
          command.run(interaction);
        }
      } else if (interaction.isAutocomplete()) {
        let command = this.commands.get(interaction.commandName);
        if (command && command.autocomplete) {
          command.autocomplete(interaction);
        }
      }
    });
  }

  public loadCommands() {
    for (const command of Object.values(commandList)) {
      const cmd = new command(this);
      this.commands.set(cmd.name, cmd);
      this.timeouts.set(cmd.name, new Map<string, boolean>());
    }
  }

  decryptString(hash: string) {
    if (!hash.includes(":")) return hash;
    if (!this.security_key) return undefined;
    const iv = Buffer.from(hash.split(":")[1]!, "hex");
    const encryptedText = Buffer.from(hash.split(":")[0]!, "hex");
    const decipher = crypto.createDecipheriv(
      "aes-256-cbc",
      this.security_key,
      iv,
    );
    const decrpyted = Buffer.concat([
      decipher.update(encryptedText),
      decipher.final(),
    ]);
    return decrpyted.toString("utf-8");
  }

  encryptString(text: string) {
    if (!this.security_key) return undefined;
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv("aes-256-cbc", this.security_key, iv);
    const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
    return encrypted.toString("hex") + ":" + iv.toString("hex");
  }
}
