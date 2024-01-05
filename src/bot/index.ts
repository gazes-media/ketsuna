import {
  ActivityType,
  Client,
  Events,
  GatewayIntentBits,
  Partials,
} from "discord.js";
import { AIHorde } from "@zeldafan0225/ai_horde";
import * as commandList from "./list.commands";
import CommandsBase from "./commands/baseCommands";
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";
import { CivitAIModels, GetLorasOptions } from "./types/civitai";

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
    if (this.application.id === "1100859965616427068") {
      this.on(Events.EntitlementCreate, async (entitlement) => {
        let user = await entitlement.fetchUser()
        // send message on support server
        this.channels.fetch("1174557566773252146").then((channel) => {
          if(!channel.isTextBased()) return;
          channel.send({
            content: `<@${entitlement.userId}> (${user.tag}) has purchased Ketsuna Premium!`,
          });
        });

        // send dm to user
        user.send({
          content: `If you are not yet in the support server, please join it here: https://discord.gg/wqvBzHe8YQ \n\n This way we can give you your Rewards for suscribing to Ketsuna Premium!`,
          embeds: [
              {
                title: "Join the Support Server",
                url: "https://discord.gg/wqvBzHe8YQ",
                description: `Thank you for purchasing Ketsuna Premium! You need to be Logged in to the bot to use it.\nPlease use </ai login:${this.commands.get("ai").command.id} to login to the bot.`
              }
            ]
        })
      });
    }
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

  /**
 *
 * @param {string} name - The name of the model to search for
 * @param {number} page - The page to search for (12 per page max)
 * @returns
 */
  async getLorasModels(
    options: GetLorasOptions = {},
  ): Promise<CivitAIModels | null> {
    let CivitURL = new URL("https://civitai.com/api/v1/models");
    CivitURL.searchParams.append("types", "LORA");
    CivitURL.searchParams.append("primaryFileOnly", "true");
    if (options.limit) CivitURL.searchParams.append("limit", options.limit.toString());
    if (options.page) CivitURL.searchParams.append("page", options.page.toString());
    if (options.name) CivitURL.searchParams.append("query", encodeURIComponent(options.name));

    const req = await fetch(CivitURL.toString());
    const res = await req.json()
    if (res.error) return null;
    return res as CivitAIModels;
  }

  async getLorasModel(id: string) {
    let CivitURL = new URL(`https://civitai.com/api/v1/models/${id}`);
    const req = await fetch(CivitURL.toString());
    const res = await req.json()
    if (res.error) return null;
    return res as CivitAIModels["items"][0];
  }
}
