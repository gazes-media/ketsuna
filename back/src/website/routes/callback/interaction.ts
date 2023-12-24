import { FastifyInstance, FastifyRequest as Request, FastifyReply as Response } from "fastify";
import Route from "../route.schema";
import { verifyKey } from "discord-interactions";
import { APIInteraction, APIInteractionResponse, InteractionResponseType, InteractionType, MessageFlags } from "discord.js";
import { bot } from "../../../main";
import CommandInteractionWebHook from "../../../bot/class/commandInteraction";
import AutocompleteInteractionWebHook from "../../../bot/class/autoCompleteInteraction";
import MessageComponentWebhook from "../../../bot/class/MessageComponent";
import ModalInteraction from "../../../bot/class/ModalInteraction";

interface ExtendedResponse extends Response {
    reply: (response: APIInteractionResponse) => void;
}
export class InteractionCallback extends Route {
    constructor(app: FastifyInstance) {
        super(app, "/api/callback/interaction");
    }

    postHandler(req: Request, res: ExtendedResponse) {
        // check if Public Key is set
        res.reply = function discordReply(response: APIInteractionResponse) {
            return res.code(200).header('Content-Type', 'application/json; charset=utf-8').send(response);
        }
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
                let errorResponse: APIInteractionResponse = {
                    type: InteractionResponseType.ChannelMessageWithSource,
                    data: {
                        content: "Error",
                        flags: MessageFlags.Ephemeral
                    }
                }
                if (body.type === InteractionType.Ping) {
                    return res.reply({ type: InteractionResponseType.Pong });
                } else if(body.type === InteractionType.ApplicationCommand) {
                    let interaction = new CommandInteractionWebHook(body, bot, res);
                    let command =  bot.commands.get(interaction.command.commandName);
                    if(command){
                        command.run(interaction);
                    }else{
                        return res.reply(errorResponse);
                    }
                } else if(body.type === InteractionType.ApplicationCommandAutocomplete) {
                    let AutoErrorComplete: APIInteractionResponse = {
                            type: InteractionResponseType.ApplicationCommandAutocompleteResult,
                            data: {
                                choices: [{
                                    name: "Error",
                                    value: "Error"
                                }],
                                }
                            }
                    let interaction = new AutocompleteInteractionWebHook(body, bot, res);
                    let command = bot.commands.get(interaction.command.commandName);
                    if(command){
                        command.autocomplete?.(interaction);
                    }else{
                        return res.reply(AutoErrorComplete);
                    }
                } else if(body.type === InteractionType.MessageComponent) {
                    let interaction = new MessageComponentWebhook(body, bot, res);
                    if(interaction.isMessageComponent()){
                        bot.emitCustomInteraction(interaction);
                    }else{
                        return res.reply(errorResponse);
                    }
                }else if(body.type === InteractionType.ModalSubmit){
                    let interaction = new ModalInteraction(body, bot, res);
                    if(interaction.isModalSubmit()){
                        bot.emitCustomInteraction(interaction);
                    }
                }else {
                    return res.reply(errorResponse);
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
