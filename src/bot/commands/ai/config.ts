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
import { addLoras, createOrUpdateUserWithConfig, createUser, getUser, removeLoras } from "../../functions/database";
import { create } from "domain";
import { Prisma } from "@prisma/client";

export default async function Config(
    command: CommandsBase,
    interaction: CommandInteraction,
) {
    if (interaction.isCommand()) {
        let options = interaction.options;
        if (options instanceof CommandInteractionOptionResolver) {
            // get every options from the command
            let model = options.getString("model")
            let nsfw = options.getBoolean("nsfw")
            let loras = options.getString("loras")
            let loras2 = options.getString("loras_2")
            let loras3 = options.getString("loras_3")
            let loras4 = options.getString("loras_4")
            let loras5 = options.getString("loras_5")
            let definedPrompt = options.getString("preprompt")
            let negative_prompt = options.getString("negative_prompt")
            let preprompt_loras = options.getBoolean("loras_preprompt")
            let cfg_scale = options.getNumber("cfg_scale")
            let sampler = options.getString("sampler")
            let gen_numbers = options.getNumber("numbers")
            let steps = options.getNumber("step")
            let clip_skip = options.getNumber("clip_skip")
            let height = options.getNumber("height")
            let width = options.getNumber("width")
            let upscaller = options.getString("upscaler")
            let sharedKey = options.getString("shared_key")
            let remove_loras = options.getBoolean("remove_loras") || false;

            let message = await interaction.deferReply({
                ephemeral: true,
            });

            let user = await getUser(interaction.user.id, command.client.database);
            // let's create a User if it doesn't exist
            // we will create a new Horde config for the user

            let finalPrompt = "{p}###{ng}"
            if(user.horde_config === null && definedPrompt === null && negative_prompt === null) {
                definedPrompt = "{p}###{ng}"
            }else{
                if(definedPrompt !== null && negative_prompt !== null) {
                    definedPrompt = finalPrompt.replace("{ng}", negative_prompt + "{ng}").replace("{p}", definedPrompt + "{p}")
                }else if(definedPrompt === null && negative_prompt !== null) {
                    finalPrompt = user.horde_config.definedPrompt
                    finalPrompt = finalPrompt.replace("{ng}", negative_prompt + "{ng}")
                    definedPrompt = finalPrompt
                }else if(definedPrompt !== null && negative_prompt === null) {
                    finalPrompt = user.horde_config.definedPrompt
                    definedPrompt = finalPrompt.replace("{p}", definedPrompt + "{p}")
                }
            }
            
            // we will now create an Object with non null values
            let configObject: Prisma.AIHordeConfigCreateInput = {
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
            }

            // now we will filter the datas
            let filteredDatas = Object.keys(configObject).filter((data) => configObject[data as keyof string] !== null);
            let filteredConfigObject: Prisma.AIHordeConfigCreateInput = {};
            for (let data of filteredDatas) {
                filteredConfigObject[data as keyof string] = configObject[data as keyof string];
            }

            let config = await createOrUpdateUserWithConfig(interaction.user.id, filteredConfigObject, command.client.database);
            // now we add loras if they are one at least
            let lorasArray = [loras, loras2, loras3, loras4, loras5];
            let lorasArrayFiltered = lorasArray.filter((loras) => loras !== null);
            if (lorasArrayFiltered.length > 0) {
                // now we delete the loras that are not in the array
                await removeLoras(config.id, command.client.database);

                // now we create or update the loras that are in the array
                for (let loras of lorasArrayFiltered) {
                    await addLoras(config.id, loras, command.client.database);
                }

            }else if (remove_loras) {
                // now we delete every loras
                await removeLoras(config.id, command.client.database);
            }

            // let's get loras from the database
            user = await getUser(interaction.user.id, command.client.database);
            message.edit({
                embeds: [
                    new EmbedBuilder()
                        .setTitle(bt.__({
                            phrase: "Config updated !",
                            locale: interaction.locale,
                        }))
                        .setColor(Colors.Green)
                        .setDescription(codeBlock("json", JSON.stringify(user.horde_config, null, 2)))
                ],
            });
        }
    }
}
