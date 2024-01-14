import {
    Colors,
    CommandInteraction,
    CommandInteractionOptionResolver,
    EmbedBuilder,
    codeBlock,
} from "discord.js";
import CommandsBase from "../baseCommands";
import { bt } from "../../../main";
import { ModelGenerationInputPostProcessingTypes, ModelGenerationInputStableSamplers } from "@zeldafan0225/ai_horde";

export default async function Config(
    command: CommandsBase,
    interaction: CommandInteraction,
) {
    if (interaction.isCommand()) {
        let options = interaction.options;
        if (options instanceof CommandInteractionOptionResolver) {
            // get every options from the command
            let model = options.getString("model") || "Anything Diffusion";
            let nsfw = options.getBoolean("nsfw") || false;
            let loras = options.getString("loras") || null;
            let loras2 = options.getString("loras_2") || null;
            let loras3 = options.getString("loras_3") || null;
            let loras4 = options.getString("loras_4") || null;
            let loras5 = options.getString("loras_5") || null;
            let definedPrompt = options.getString("preprompt") || "{p}###{ng}deformed, blurry,[bad anatomy], disfigured, poorly drawn face, [[[mutation]]], mutated, [[[extra arms]]], extra legs, ugly, horror, out of focus, depth of field, focal blur, bad quality, double body, [[double torso]], equine, bovine,[[feral]], [duo], [[canine]], creepy fingers, extra fingers, bad breasts, bad butt, split breasts, split butt, Blurry textures, blurry everything, creepy arms, bad arm anatomy, bad leg anatomy, bad finger anatomy, poor connection of the body with clothing and other things, poor quality character, poor quality body, Bad clothes quality, bad underwear, bad ears, poor eyes quality, poor quality of the background, poor facial quality, text.";
            let preprompt_loras = options.getBoolean("loras_preprompt") || false;
            let cfg_scale = options.getNumber("cfg_scale") || 7;
            let sampler = options.getString("sampler") || ModelGenerationInputStableSamplers.k_euler;
            let gen_numbers = options.getNumber("numbers") || 4;
            let steps = options.getNumber("step") || 25;
            let clip_skip = options.getNumber("clip_skip") || 3;
            let height = options.getNumber("height") || 512;
            let width = options.getNumber("width") || 512;
            let upscaller = options.getString("upscaler") || ModelGenerationInputPostProcessingTypes.RealESRGAN_x4plus;
            let sharedKey = options.getString("shared_key") || null;

            let message = await interaction.deferReply({
                ephemeral: true,
            });
            // let's create a User if it doesn't exist
            // we will create a new Horde config for the user
            let config = await command.client.database.aIHordeConfig.upsert({
                create: {
                    model,
                    nsfw,
                    sampler,
                    preprompt_loras,
                    cfg_scale,
                    definedPrompt,
                    gen_numbers,
                    steps,
                    clip_skip,
                    height,
                    width,
                    upscaller,
                    sharedKey,
                    user:{
                        connectOrCreate:{
                            where:{
                                id:interaction.user.id
                            },
                            create:{
                                id:interaction.user.id
                            }
                        }
                    }
                },
                update: {
                    model,
                    nsfw,
                    sampler,
                    preprompt_loras,
                    cfg_scale,
                    definedPrompt,
                    gen_numbers,
                    steps,
                    clip_skip,
                    height,
                    width,
                    upscaller,
                    sharedKey,
                    user:{
                        connectOrCreate:{
                            where:{
                                id:interaction.user.id
                            },
                            create:{
                                id:interaction.user.id
                            }
                        }
                    }
                },
                where: {
                    userId: interaction.user.id,
                },
            });
            // now we add loras if they are one at least
            let lorasArray = [loras, loras2, loras3, loras4, loras5];
            let lorasArrayFiltered = lorasArray.filter((loras) => loras !== null);
            if (lorasArrayFiltered.length > 0) {
                // now we delete the loras that are not in the array
                await command.client.database.loras.deleteMany({
                    where: {
                        aiHordeConfigId: config.id,
                    },
                });

                // now we create or update the loras that are in the array
                for (let loras of lorasArrayFiltered) {
                    await command.client.database.loras.upsert({
                        create: {
                            loras_id: loras,
                            aiHordeConfigId: config.id,
                        },
                        update: {
                            loras_id: loras,
                            aiHordeConfigId: config.id,
                        },
                        where: {
                            loras_id: loras,
                            aiHordeConfigId: config.id,
                        },
                    });
                }

            }

            // let's get loras from the database
            config = await command.client.database.aIHordeConfig.findUnique({
                where: {
                    userId: interaction.user.id,
                },
                include: {
                    loras: true,
                },
            });
            message.edit({
                content: bt.__({
                    phrase: "Config updated !",
                    locale: interaction.locale,
                }),
                embeds: [
                    new EmbedBuilder()
                        .setTitle(bt.__({
                            phrase: "Config updated !",
                            locale: interaction.locale,
                        }))
                        .setColor(Colors.Green)
                        .setDescription(codeBlock("json", JSON.stringify(config, null, 2)))
                ],
            });
        }
    }
}
