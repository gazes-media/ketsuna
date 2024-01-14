import CommandsBase from "../baseCommands";
import {
  APIActionRowComponent,
  APIButtonComponent,
  AttachmentPayload,
  ButtonBuilder,
  ButtonStyle,
  Colors,
  CommandInteraction,
  CommandInteractionOptionResolver,
  EmbedBuilder,
  MessageEditOptions,
  MessageFlags,
  TextChannel,
  codeBlock,
} from "discord.js";
import {
  ImageGenerationInput,
  ModelGenerationInputPostProcessingTypes,
  ModelGenerationInputStableSamplers,
} from "@zeldafan0225/ai_horde";
import { bt } from "../../../main";
export default async function Imagine(
  command: CommandsBase,
  interaction: CommandInteraction,
) {
  let userDatabase = await command.client.database.users.findFirst({
    where: {
      id: interaction.user.id,
    },
    include: {
      horde_config: {
        include: {
          loras: true,
        }
      },
    },
  });

  let defaultToken = "0000000000";
  if (userDatabase) {
    defaultToken = command.client.decryptString(userDatabase.horde_token);
  }
  let timeout = command.client.timeouts.get(interaction.commandName);
  if (!timeout) {
    interaction.reply({
      content: bt.__({
        phrase: "An error occured, please try again later",
        locale: interaction.locale,
      }),
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  if (timeout.has(interaction.user.id)) {
    interaction.reply({
      content: bt.__({
        phrase:
          "You must wait the current generation before using this command again",
        locale: interaction.locale,
      }),
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  let ai = command.client.aiHorde;

  // get the option value
  let message = await interaction.deferReply();
  let modelMoreDemanded = await ai.getModels();
  let options = interaction.options;
  if (options instanceof CommandInteractionOptionResolver) {
    let image = options.getString("prompt") || "";
    // the model the more demanded is the one with the most count of Workers
    let model =
      options.getString("model") ||
      (userDatabase && userDatabase.horde_config.model) ||
      modelMoreDemanded.sort((a, b) => {
        return b.count - a.count;
      })[0].name;
    let negative_prompt =
      options.getString("negative_prompt") ||
      "";

    // first let's check if userDatabase is null, if it is, we set the default value to false
    let config = (userDatabase ? userDatabase.horde_config : null);
    let nsfw = options.getBoolean("nsfw") || (config.nsfw) || false;
    let loras = options.getString("loras") || (config.loras.length > 0 ? config.loras[0].loras_id : null) || null;
    let loras2 = options.getString("loras_2") || (config.loras.length > 1 ? config.loras[1].loras_id : null) || null;
    let loras3 = options.getString("loras_3") || (config.loras.length > 2 ? config.loras[2].loras_id : null) || null;
    let loras4 = options.getString("loras_4") || (config.loras.length > 3 ? config.loras[3].loras_id : null) || null;
    let loras5 = options.getString("loras_5") || (config.loras.length > 4 ? config.loras[4].loras_id : null) || null;
    let preprompt = options.getBoolean("preprompt") || (config.preprompt_loras) || false;
    if (image) {
      let textChannel =
        interaction.channel instanceof TextChannel ? interaction.channel : null;
      let nsfwchannel = true;
      if (textChannel) {
        nsfwchannel = textChannel.nsfw;
      }
      command.client.timeouts
        .get(interaction.commandName)
        ?.set(interaction.user.id, true);

      let predefinedPrompt = (config?.definedPrompt) || "{p}###{ng}deformed, blurry,[bad anatomy], disfigured, poorly drawn face, [[[mutation]]], mutated, [[[extra arms]]], extra legs, ugly, horror, out of focus, depth of field, focal blur, bad quality, double body, [[double torso]], equine, bovine,[[feral]], [duo], [[canine]], creepy fingers, extra fingers, bad breasts, bad butt, split breasts, split butt, Blurry textures, blurry everything, creepy arms, bad arm anatomy, bad leg anatomy, bad finger anatomy, poor connection of the body with clothing and other things, poor quality character, poor quality body, Bad clothes quality, bad underwear, bad ears, poor eyes quality, poor quality of the background, poor facial quality, text.";
      let prompt: ImageGenerationInput = {
        prompt: predefinedPrompt.replace("{p}", image).replace("{ng}", negative_prompt),
        params: {
          sampler_name: ModelGenerationInputStableSamplers.k_euler,
          cfg_scale: (userDatabase && userDatabase.horde_config.cfg_scale) || 7,
          height: (userDatabase && userDatabase.horde_config.height) || 512,
          width: (userDatabase && userDatabase.horde_config.width) || 512,
          post_processing: [
            (userDatabase && userDatabase.horde_config.upscaller) as ImageGenerationInput["params"]["post_processing"][0] || ModelGenerationInputPostProcessingTypes.RealESRGAN_x4plus,
          ],
          clip_skip: (userDatabase && userDatabase.horde_config.clip_skip) || 3,
          facefixer_strength: 1,
          steps: (userDatabase && userDatabase.horde_config.steps) || 25,
          n: (userDatabase && userDatabase.horde_config.gen_numbers) || 4,
        },
        censor_nsfw: nsfwchannel ? (nsfw ? false : true) : true,
        models: [model],
        nsfw: nsfwchannel ? (nsfw ? true : false) : false,
        shared: true,
      };

      let lorasList = [loras, loras2, loras3, loras4, loras5].filter((loras) => {
        return loras !== null;
      });
      if (lorasList.length > 0) {
        // if preprompt is selected, we get a random model, and a random image from this model to use as prompt
        if (preprompt) {
          try {
            let lorasDatas = await command.client.getLorasModel(lorasList[0]);
            let randomModelVersion =
              lorasDatas.modelVersions[
              Math.floor(Math.random() * lorasDatas.modelVersions.length)
              ];
            let randomMetaImage =
              randomModelVersion.images[
                Math.floor(Math.random() * randomModelVersion.images.length)
              ].meta;
            prompt.params.steps = randomMetaImage.steps;
            prompt.params.cfg_scale = randomMetaImage.cfgScale;
            prompt.prompt =
              randomMetaImage.prompt +
              image.substring(0, 1024) +
              "### " +
              randomMetaImage.negativePrompt;
          } catch (e) {
            console.log("Loras was not found");
          }
        }

        prompt.params.loras = lorasList.map((loras, index) => {
          return {
            name: loras,
            model: index,
            clip: index + 1,
            inject_trigger: "any",
          };
        });
      }
      if (model.toLowerCase().includes("sdxl")) {
        prompt.params.hires_fix = false;
      } else {
        prompt.params.hires_fix = true;
      }
      ai.postAsyncImageGenerate(prompt, {
        token: defaultToken,
      })
        .then(async (result) => {
          let id = result.id as string;
          let finished = 0;
          let collector = await message.createMessageComponentCollector({
            filter: (componentInteraction) => {
              return (
                componentInteraction.customId === "cancel" &&
                componentInteraction.user.id === interaction.user.id
              );
            },
            max: 1,
          });
          let interval: NodeJS.Timeout = setInterval(() => {
            if (id) {
              ai.getImageGenerationCheck(id, {
                force: true,
              }).then((stat) => {
                if (stat.is_possible) {
                  if (stat.done) {
                    clearInterval(interval);
                    collector.stop("done");
                    command.client.timeouts
                      .get(interaction.commandName)
                      ?.delete(interaction.user.id);
                    ai.getImageGenerationStatus(id).then((status) => {
                      console.log({
                        generations: status.generations.map((generation) => {
                          return {
                            url: generation.img,
                            workerName: generation.worker_name,
                            workerId: generation.worker_id,
                            model: generation.model,
                          }
                        }),
                        prompt: JSON.stringify(prompt),
                        guildName: interaction.guild?.name || "DM",
                      });
                      let generations = status.generations;
                      if (generations && generations.length > 0) {
                        interaction.editReply({
                          content: "",
                          files: generations.map((generation, i) => {
                            return {
                              attachment: generation.img as string,
                              name: "image" + i + ".webp",
                            };
                          }),
                          components: [],
                        });
                      }
                    });
                  } else {
                    let components: APIActionRowComponent<APIButtonComponent>[] =
                      [
                        {
                          type: 1,
                          components: [
                            new ButtonBuilder()
                              .setCustomId("cancel")
                              .setLabel(
                                bt.__({
                                  phrase: "Cancel",
                                  locale: interaction.locale,
                                }),
                              )
                              .setStyle(ButtonStyle.Danger)
                              .setEmoji("🚫")
                              .setDisabled(false)
                              .toJSON(),
                          ],
                        },
                      ];
                    // attachment
                    let wait_time = stat.wait_time || 1;
                    let files: AttachmentPayload[] = [];
                    let processed =
                      bt.__({
                        phrase: "Generation started..",
                        locale: interaction.locale,
                      }) + "\n";
                    if (stat.queue_position && stat.queue_position > 0) {
                      processed +=
                        bt.__(
                          {
                            phrase: "(Position in the queue: %s -",
                            locale: interaction.locale,
                          },
                          String(stat.queue_position),
                        ) + "\n";
                    }
                    if (stat.waiting && stat.waiting > 0) {
                      processed +=
                        bt.__(
                          {
                            phrase: "Waiting : %s",
                            locale: interaction.locale,
                          },
                          String(stat.waiting),
                        ) + "\n";
                    }
                    if (stat.finished && stat.finished > 0) {
                      processed +=
                        bt.__(
                          {
                            phrase: "Finished : %s",
                            locale: interaction.locale,
                          },
                          String(stat.finished),
                        ) + "\n";
                    }
                    if (stat.processing && stat.processing > 0) {
                      processed +=
                        bt.__(
                          {
                            phrase: "Processing : %s",
                            locale: interaction.locale,
                          },
                          String(stat.processing),
                        ) + "\n";
                      processed += bt.__(
                        {
                          phrase: "(Estimated waiting time: <t:%s:R>)",
                          locale: interaction.locale,
                        },
                        String(
                          parseInt(
                            ((Date.now() + wait_time * 1000) / 1000).toString(),
                          ),
                        ),
                      ) + "\n";
                    }
                    if (stat.kudos && stat.kudos > 0) {
                      processed += bt.__(
                        {
                          phrase: "Kudos used: %s",
                          locale: interaction.locale,
                        },
                        String(stat.kudos),
                      );
                    }
                    let message: MessageEditOptions = {
                      content: processed,
                      components: components,
                    };
                    if (stat.finished && stat.finished > finished) {
                      finished = stat.finished;
                      ai.getImageGenerationStatus(id).then((status) => {
                        if (
                          status.generations &&
                          status.generations.length > 0
                        ) {
                          status.generations.forEach((generation, i) => {
                            files.push({
                              attachment: generation.img as string,
                              name: "image" + i + ".webp",
                            });
                          });
                        }
                        if (files.length > 0) {
                          message.files = files;
                        }
                        interaction.editReply(message).catch((e) => {
                          clearInterval(interval);
                          collector.stop("cancel");
                          command.client.timeouts
                            .get(interaction.commandName)
                            ?.delete(interaction.user.id);
                          command.client.aiHorde.deleteImageGenerationRequest(
                            id,
                          );
                        });
                      });
                    } else {
                      interaction.editReply(message).catch((e) => {
                        clearInterval(interval);
                        collector.stop("cancel");
                        command.client.timeouts
                          .get(interaction.commandName)
                          ?.delete(interaction.user.id);
                        command.client.aiHorde.deleteImageGenerationRequest(id);
                      });
                    }
                  }
                } else {
                  clearInterval(interval);
                  command.client.timeouts
                    .get(interaction.commandName)
                    ?.delete(interaction.user.id);
                  interaction
                    .editReply({
                      content: bt.__({
                        phrase: "Request impossible, model not available",
                        locale: interaction.locale,
                      }),
                      components: [],
                    })
                    .catch((e) => {
                      clearInterval(interval);
                      collector.stop("cancel");
                      command.client.timeouts
                        .get(interaction.commandName)
                        ?.delete(interaction.user.id);
                      command.client.aiHorde.deleteImageGenerationRequest(id);
                    });
                }
              });
            }
          }, 5000);

          collector.on("collect", (componentInteraction) => {
            collector.stop("cancel");
            clearInterval(interval);
            command.client.timeouts
              .get(interaction.commandName)
              ?.delete(interaction.user.id);
            componentInteraction.update({
              content: bt.__({
                phrase: "Request canceled",
                locale: interaction.locale,
              }),
              components: [],
            });
            command.client.aiHorde.deleteImageGenerationRequest(id);
          });
        })
        .catch((err) => {
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
                        value: `${interaction.user.tag} (${interaction.user.id})`,
                      },
                      {
                        name: "Commande",
                        value: `${interaction.commandName}`,
                      },
                      {
                        name: "Options",
                        value: codeBlock("json", JSON.stringify(options)),
                      },
                    ])
                    .toJSON(),
                ],
              });
            });
          }
          command.client.timeouts
            .get(interaction.commandName)
            ?.delete(interaction.user.id);
          if (interaction.deferred) {
            interaction.editReply({
              content: bt.__({
                phrase:
                  "An error occured, content too long or too complex, or request too unethical to be processed.",
                locale: interaction.locale,
              }),
              components: [],
            });
          } else {
            interaction.editReply({
              content: bt.__({
                phrase:
                  "An error occured, content too long or too complex, or request too unethical to be processed.",
                locale: interaction.locale,
              }),
              components: [],
            });
          }
        });
    }
  }
}
