import CommandsBase from "../baseCommands";
import { APIActionRowComponent, APIButtonComponent, AttachmentPayload, ButtonBuilder, ButtonStyle, Colors, CommandInteraction, CommandInteractionOptionResolver, EmbedBuilder, MessageEditOptions, MessageFlags, TextChannel, codeBlock } from "discord.js";
import { GenerationInput, ModelGenerationInputPostProcessingTypes, ModelGenerationInputStableSamplers } from "../../../internal_libs/aihorde";
import { bt } from "../../../main";
export default async function Imagine(command: CommandsBase, interaction: CommandInteraction) {

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
            content: bt.__({ phrase: "An error occured, please try again later", locale: interaction.locale }),
            flags: MessageFlags.Ephemeral
        });
        return;
    }
    if (timeout.has(interaction.user.id)) {
        interaction.reply({
            content: bt.__({ phrase: "You must wait the current generation before using this command again", locale: interaction.locale }),
            flags: MessageFlags.Ephemeral
        });
        return;
    }
    let ai = command.client.aiHorde;

    // get the option value
    let message = await interaction.deferReply()
    let modelMoreDemanded = await ai.getModels();
    let options = interaction.options
    if (options instanceof CommandInteractionOptionResolver) {
        let image = options.getString("prompt") || "";
        // the model the more demanded is the one with the most count of Workers
        let model = options.getString("model") || modelMoreDemanded.sort((a, b) => {
            return b.count - a.count;
        })[0].name;
        let negative_prompt = options.getString("negative_prompt") || "deformed, blurry,[bad anatomy], disfigured, poorly drawn face, [[[mutation]]], mutated, [[[extra arms]]], extra legs, ugly, horror, out of focus, depth of field, focal blur, bad quality, double body, [[double torso]], equine, bovine,[[feral]], [duo], [[canine]], creepy fingers, extra fingers, bad breasts, bad butt, split breasts, split butt, Blurry textures, blurry everything, creepy arms, bad arm anatomy, bad leg anatomy, bad finger anatomy, poor connection of the body with clothing and other things, poor quality character, poor quality body, Bad clothes quality, bad underwear, bad ears, poor eyes quality, poor quality of the background, poor facial quality, text.";
        let nsfw = options.getBoolean("nsfw") || false;
        let loras = options.getString("loras") || null;
        let preprompt = options.getBoolean("preprompt") || false;
        if (image) {
            let textChannel = (interaction.channel instanceof TextChannel ? interaction.channel : null);
            let nsfwchannel = true;
            if (textChannel) {
                nsfwchannel = textChannel.nsfw;
            }
            command.client.timeouts.get(interaction.commandName)?.set(interaction.user.id, true);
            let prompt: GenerationInput = {
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
            }

            if (loras) {
                // if preprompt is selected, we get a random model, and a random image from this model to use as prompt
                if (preprompt) {
                    try {
                        let lorasDatas = await ai.getLorasModels(loras, {
                            limit: 1,
                            page: 1,
                        });
                        let firstItem = lorasDatas.items[0];
                        let randomModelVersion = firstItem.modelVersions[Math.floor(Math.random() * firstItem.modelVersions.length)];
                        let randomMetaImage = randomModelVersion.images[Math.floor(Math.random() * randomModelVersion.images.length)].meta;
                        prompt.params.steps = randomMetaImage.steps;
                        prompt.params.cfg_scale = randomMetaImage.cfgScale;
                        prompt.prompt = randomMetaImage.prompt + image.substring(0, 1024) + "### " + randomMetaImage.negativePrompt
                    } catch (e) {
                        console.log("Loras was not found")
                    }
                }

                prompt.params.loras = [
                    {
                        name: loras,
                        model: 1,
                        clip: 1,
                    }
                ]
            }
            if (model.toLowerCase().includes("sdxl")) {
                prompt.params.hires_fix = false;
            }
            ai.postAsyncImageGenerate(prompt, {
                token: defaultToken,
            }).then(async (result) => {
                let id = result.id as string;
                let finished = 0;
                let collector = await message.createMessageComponentCollector({
                    filter: (componentInteraction) => {
                        return componentInteraction.customId === "cancel" && componentInteraction.user.id === interaction.user.id;
                    },
                    max: 1,
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
                                                    .setLabel(bt.__({ phrase: "Cancel", locale: interaction.locale }))
                                                    .setStyle(ButtonStyle.Danger)
                                                    .setEmoji("🚫")
                                                    .setDisabled(false)
                                                    .toJSON()
                                            ]
                                        }
                                    ];
                                    // attachment
                                    let wait_time = stat.wait_time || 1;
                                    let files: AttachmentPayload[] = [];
                                    let processed = bt.__({ phrase: "Generation started..", locale: interaction.locale }) + "\n";
                                    if (stat.queue_position && stat.queue_position > 0) {
                                        processed += bt.__({ phrase: "(Position in the queue: %s -", locale: interaction.locale }, String(stat.queue_position));
                                    }
                                    if (stat.waiting && stat.waiting > 0) {
                                        processed += ` En attente: ${stat.waiting})\n`;
                                        processed += bt.__({ phrase: "Waiting : %s", locale: interaction.locale }, String(stat.waiting));
                                    }
                                    if (stat.processing && stat.processing > 0) {
                                        processed += bt.__({ phrase: "Processing : %s", locale: interaction.locale }, String(stat.processing));
                                        processed += bt.__({ phrase: "(Estimated waiting time: <t:%s:R>)", locale: interaction.locale }, String(parseInt((((Date.now() + (wait_time) * 1000)) / 1000).toString())));
                                    }
                                    if (stat.kudos && stat.kudos > 0) {
                                        processed += bt.__({ phrase: "Kudos used: %s", locale: interaction.locale }, String(stat.kudos));
                                    }
                                    let message: MessageEditOptions = {
                                        content: processed,
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
                                    content: bt.__({ phrase: "Request impossible, model not available", locale: interaction.locale }),
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
                        content: bt.__({ phrase: "Request canceled", locale: interaction.locale }),
                        components: []
                    });
                    command.client.aiHorde.deleteImageGenerationRequest(id);
                });
            }).catch((err) => {
                if (command.client.application.id === "1100859965616427068") {
                    command.client.users.fetch("243117191774470146").then((user) => {
                        user.send({
                            embeds: [
                                new EmbedBuilder()
                                    .setTimestamp(new Date())
                                    .setDescription(codeBlock("json", JSON.stringify(err)))
                                    .setTitle("Erreur lors de la génération d'une image")
                                    .setColor(Colors.Red)
                                    .addFields([
                                        {
                                            name: "Utilisateur",
                                            value: `${interaction.user.tag} (${interaction.user.id})`
                                        },
                                        {
                                            name: "Commande",
                                            value: `${interaction.commandName}`
                                        }, {
                                            name: "Options",
                                            value: codeBlock("json", JSON.stringify(options))
                                        }
                                    ])
                                    .toJSON()
                            ]
                        })
                    })
                }
                command.client.timeouts.get(interaction.commandName)?.delete(interaction.user.id);
                if (interaction.deferred) {
                    interaction.editReply({
                        content: bt.__({ phrase: "An error occured, content too long or too complex, or request too unethical to be processed.", locale: interaction.locale }),
                        components: []
                    });
                } else {
                    interaction.editReply({
                        content: bt.__({ phrase: "An error occured, content too long or too complex, or request too unethical to be processed.", locale: interaction.locale }),
                        components: []
                    });
                }
            })
        }
    }
}