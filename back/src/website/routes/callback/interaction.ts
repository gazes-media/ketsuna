import { FastifyInstance, FastifyRequest as Request, FastifyReply as Response } from "fastify";
import Route from "../route.schema";
import { verifyKey } from "discord-interactions";
import { APIInteraction, APIInteractionResponse, InteractionResponseType, InteractionType, MessageFlags } from "discord.js";
import { bot } from "../../../main";
import CommandInteractionWebHook from "../../../bot/class/commandInteraction";
import AutocompleteInteractionWebHook from "../../../bot/class/autoCompleteInteraction";

export class InteractionCallback extends Route {
    constructor(app: FastifyInstance) {
        super(app, "/api/callback/interaction");
    }

    postHandler(req: Request, res: Response) {
        // check if Public Key is set
        let PUBLIC_KEY = process.env.DISCORD_PUBLIC_KEY;
        if (!PUBLIC_KEY) {
            console.error("No public key set!");
            return res.code(500).header('Content-Type', 'application/json; charset=utf-8').send({ error: "No public key set!" });
        }
        // verify if the request is from Discord
        // First check validity of headers sent by Discord
        let signature = req.headers["x-signature-ed25519"];
        let timestamp = req.headers["x-signature-timestamp"];
        if (!signature || !timestamp) {
            console.error("No signature or timestamp in headers");
            return res.code(401).header('Content-Type', 'application/json; charset=utf-8').send({ error: "No signature or timestamp in headers" });

        }

        // check if signature and timestamp are string and not array 
        if (Array.isArray(signature) || Array.isArray(timestamp)) {
            console.error("Signature or timestamp are arrays");
            return res.code(401).header('Content-Type', 'application/json; charset=utf-8').send({ error: "Signature or timestamp are arrays" });

        }

        try {
            const stringifiedBody = JSON.stringify(req.body) as string;
            let verify = verifyKey(stringifiedBody, signature, timestamp, PUBLIC_KEY);
            if (!verify) {
                console.error("Invalid request signature");
                return res.code(401).header('Content-Type', 'application/json; charset=utf-8').send({ error: "Invalid request signature" });
            }
            try {
                let body = req.body as APIInteraction;
                if (body.type === InteractionType.Ping) {
                    return res.code(200).header('Content-Type', 'application/json; charset=utf-8').send({ type: InteractionResponseType.Pong });
                } else if(body.type === InteractionType.ApplicationCommand) {
                    let client= bot.application?.client;
                    if (!client) {
                        console.error("No client");
                        return res.code(200).header('Content-Type', 'application/json; charset=utf-8').send({ type: InteractionResponseType.ChannelMessageWithSource, data: { content: "No client", flags: MessageFlags.Ephemeral } });
                    }
                    let interaction = new CommandInteractionWebHook(body, client, res);
                    bot.commands.get(interaction.command.commandName)?.run(interaction);
                } else if(body.type === InteractionType.ApplicationCommandAutocomplete) {
                    let client= bot.application?.client;
                    if (!client) {
                        console.error("No client");
                        let AutoErrorComplete: APIInteractionResponse = {
                            type: InteractionResponseType.ApplicationCommandAutocompleteResult,
                            data: {
                                choices: [{
                                    name: "No client",
                                    value: "No client"
                                }],
                                }
                            }
                        return res.code(200).header('Content-Type', 'application/json; charset=utf-8').send(AutoErrorComplete);
                    }
                    let interaction = new AutocompleteInteractionWebHook(body, client, res);
                    bot.commands.get(interaction.command.commandName)?.autocomplete?.(interaction);
                } else {
                    return res.code(200).header('Content-Type', 'application/json; charset=utf-8').send({ type: InteractionResponseType.ChannelMessageWithSource, data: { content: "Response Not Handled", flags: MessageFlags.Ephemeral } });
                }
            } catch (e) {
                console.error(e);
                console.error("Invalid body");
                return res.code(400).header('Content-Type', 'application/json; charset=utf-8').send({ error: "Invalid body" });
            }
        } catch (e) {
            console.error(e);
            console.error("Invalid body");
            return res.code(400).header('Content-Type', 'application/json; charset=utf-8').send({ error: "Invalid body" });
        }
    }
}