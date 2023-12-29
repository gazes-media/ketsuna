import CommandsBase from "../baseCommands";
import { APIActionRowComponent, APIButtonComponent, AttachmentPayload, ButtonBuilder, ButtonStyle, CommandInteraction, CommandInteractionOptionResolver, MessageEditOptions, MessageFlags, TextChannel } from "discord.js";
import { ModelGenerationInputPostProcessingTypes, ModelGenerationInputStableSamplers } from "../../../internal_libs/aihorde";
export default async function Imagine(command: CommandsBase, interaction: CommandInteraction){
    
    let userDatabase = await command.client.database.users.findFirst({
        where: {
            id: interaction.user.id
        }
    });

    let defaultToken = "0000000000";
    if (userDatabase) {
        defaultToken = command.client.decryptString(userDatabase.horde_token);
    }
    let timeout = command.client.timeouts.get(interaction.commandName);
    if (!timeout) {
        interaction.reply({
            content: "Une erreur est survenue",
            flags: MessageFlags.Ephemeral
        });
        return;
    }
    if (timeout.has(interaction.user.id)) {
        interaction.reply({
            content: "Vous devez attendre la fin de la génération précédente avant de pouvoir en lancer une nouvelle",
            flags: MessageFlags.Ephemeral
        });
        return;
    }

    // get the option value
    let message = await interaction.deferReply()

    let options = interaction.options
    if (options instanceof CommandInteractionOptionResolver) {
        let image = options.getString("prompt") || "";
        let model = options.getString("model") || "Deliberate";
        let negative_prompt = options.getString("negative_prompt") || "deformed, blurry,[bad anatomy], disfigured, poorly drawn face, [[[mutation]]], mutated, [[[extra arms]]], extra legs, ugly, horror, out of focus, depth of field, focal blur, bad quality, double body, [[double torso]], equine, bovine,[[feral]], [duo], [[canine]], creepy fingers, extra fingers, bad breasts, bad butt, split breasts, split butt, Blurry textures, blurry everything, creepy arms, bad arm anatomy, bad leg anatomy, bad finger anatomy, poor connection of the body with clothing and other things, poor quality character, poor quality body, Bad clothes quality, bad underwear, bad ears, poor eyes quality, poor quality of the background, poor facial quality, text.";
        let nsfw = options.getBoolean("nsfw") || false;
        if (image) {
            let textChannel = (interaction.channel instanceof TextChannel ? interaction.channel : null);
            let nsfwchannel = true;
            if (textChannel) {
                nsfwchannel = textChannel.nsfw;
            }
            let ai = command.client.aiHorde;
            command.client.timeouts.get(interaction.commandName)?.set(interaction.user.id, true);
            ai.postAsyncImageGenerate({
                prompt: image + "### " + negative_prompt,
                params: {
                    "sampler_name": ModelGenerationInputStableSamplers.k_dpm_adaptive,
                    "cfg_scale": 7,
                    "denoising_strength": 0.75,
                    "height": 512,
                    "width": 512,
                    "post_processing": [
                        ModelGenerationInputPostProcessingTypes.RealESRGAN_x4plus,
                        ModelGenerationInputPostProcessingTypes.GFPGAN
                    ],
                    "karras": true,
                    "tiling": false,
                    "hires_fix": true,
                    "clip_skip": 3,
                    "facefixer_strength": 0.75,
                    "steps": 25,
                    "n": 4,
                },
                censor_nsfw: nsfwchannel ? (nsfw ? false : true) : true,
                models: [
                    model
                ],
                nsfw: nsfwchannel ? (nsfw ? true : false) : false,
                shared: true,
            }, {
                token: defaultToken,
            }).then(async (result) => {
                let id = result.id as string;
                let finished = 0;
                let collector = await message.createMessageComponentCollector({
                    filter: (componentInteraction) => {
                        return componentInteraction.customId === "cancel" && componentInteraction.user.id === interaction.user.id;
                    },
                    time: 1000 * 60 * 10,
                    dispose: true,
                });
                let interval: NodeJS.Timeout = setInterval(() => {
                    if (id) {
                        ai.getImageGenerationCheck(id, {
                            force: true
                        }).then((stat) => {
                            if (stat.is_possible) {

                                if (stat.done) {
                                    clearInterval(interval);
                                    collector.stop("done");
                                    command.client.timeouts.get(interaction.commandName)?.delete(interaction.user.id);
                                    ai.getImageGenerationStatus(id).then((status) => {
                                        let generations = status.generations;
                                        if (generations && generations.length > 0) {
                                            interaction.editReply({
                                                content: "",
                                                files: generations.map((generation, i) => {
                                                    return {
                                                        attachment: generation.img as string,
                                                        name: "image" + i + ".webp"
                                                    }
                                                }),
                                                components: []
                                            });

                                        }

                                    })
                                } else {
                                    let components: APIActionRowComponent<APIButtonComponent>[] = [
                                        {
                                            type: 1,
                                            components: [
                                                new ButtonBuilder()
                                                    .setCustomId("cancel")
                                                    .setLabel("Annuler")
                                                    .setStyle(ButtonStyle.Danger)
                                                    .setDisabled(false)
                                                    .toJSON()
                                            ]
                                        }
                                    ];
                                    // attachment
                                    let wait_time = stat.wait_time || 1;
                                    let files: AttachmentPayload[] = [];
                                    let processed = "";
                                    if (stat.queue_position && stat.queue_position > 0) {
                                        processed += ` (Position dans la file d'attente: ${stat.queue_position} -`;
                                    }
                                    if (stat.waiting && stat.waiting > 0) {
                                        processed += ` En attente: ${stat.waiting})\n`;
                                    }
                                    if (stat.processing && stat.processing > 0) {
                                        processed += `(En cours de traitement: ${stat.processing})\n`;
                                        processed += `(Temps d'attente estimé: <t:${parseInt((((Date.now() + (wait_time) * 1000)) / 1000).toString())}:R>)\n`;
                                    }
                                    if (stat.kudos && stat.kudos > 0) {
                                        processed += `(Kudos utilisés: ${stat.kudos})`;
                                    }
                                    let message: MessageEditOptions = {
                                        content: `En cours de génération...\n ${processed}`,
                                        components: components
                                    }
                                    if (stat.finished && stat.finished > finished) {
                                        finished = stat.finished;
                                        ai.getImageGenerationStatus(id).then((status) => {
                                            if (status.generations && status.generations.length > 0) {
                                                status.generations.forEach((generation, i) => {
                                                    files.push({
                                                        attachment: generation.img as string,
                                                        name: "image" + i + ".webp"
                                                    })
                                                })
                                            }
                                            if (files.length > 0) {
                                                message.files = files;
                                            }
                                            interaction.editReply(message).catch(e => { 
                                                clearInterval(interval);
                                                collector.stop("cancel");
                                                command.client.timeouts.get(interaction.commandName)?.delete(interaction.user.id);
                                                command.client.aiHorde.deleteImageGenerationRequest(id);
                                            });;
                                        })
                                    } else {
                                        interaction.editReply(message).catch(e => { 
                                            clearInterval(interval);
                                            collector.stop("cancel");
                                            command.client.timeouts.get(interaction.commandName)?.delete(interaction.user.id);
                                            command.client.aiHorde.deleteImageGenerationRequest(id);
                                        });
                                    }
                                }
                            } else {
                                clearInterval(interval);
                                command.client.timeouts.get(interaction.commandName)?.delete(interaction.user.id);
                                interaction.editReply({
                                    content: "Impossible de générer l'image, le model demandé n'est pas disponible",
                                    components: []
                                }).catch(e => { 
                                    clearInterval(interval);
                                    collector.stop("cancel");
                                    command.client.timeouts.get(interaction.commandName)?.delete(interaction.user.id);
                                    command.client.aiHorde.deleteImageGenerationRequest(id);
                                });;
                            }
                        })
                    }
                }, 5000);

                collector.on("collect", (componentInteraction) => {
                    collector.stop("cancel");
                    clearInterval(interval);
                    command.client.timeouts.get(interaction.commandName)?.delete(interaction.user.id);
                    componentInteraction.update({
                        content: "Génération annulée",
                        components: []
                    });
                    command.client.aiHorde.deleteImageGenerationRequest(id);
                });
            }).catch(() => {
                command.client.timeouts.get(interaction.commandName)?.delete(interaction.user.id);
                if (interaction.deferred) {
                    interaction.editReply({
                        content: "Une erreur est survenue, le contenu demandé est peut-être trop long ou trop complexe, ou la demande est trop non éthique pour être traitée.",
                        components: []
                    });
                } else {
                    interaction.editReply({
                        content: "Une erreur est survenue, le contenu demandé est peut-être trop long ou trop complexe, ou la demande est trop non éthique pour être traitée.",
                        components: []
                    });
                }
            })
        }
    }
}