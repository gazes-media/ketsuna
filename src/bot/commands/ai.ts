import {
  ApplicationCommandOptionChoiceData,
  AutocompleteInteraction,
  CommandInteraction,
  CommandInteractionOptionResolver,
  MessageFlags,
  SlashCommandBuilder,
} from "discord.js";
import Bot from "../index";
import CommandsBase from "./baseCommands";
import Login from "./ai/login";
import Imagine from "./ai/imagine";
import Help from "./ai/help";
import Info from "./ai/info";
import Ask from "./ai/ask";
import Logout from "./ai/logout";
import Interogate from "./ai/interogate";
import { ModelGenerationInputPostProcessingTypes, ModelGenerationInputStableSamplers } from "@zeldafan0225/ai_horde";
import Advanced from "./ai/advanced";
import Give from "./ai/give";
import { bt } from "../../main";
import Config from "./ai/config";

const commandData = new SlashCommandBuilder()
  .setName("ia")
  .setDescription("Commandes IA")
  .addSubcommand((subcommand) =>
    subcommand
      .setName("imagine")
      .setDescription("Create an image by AI")
      .setDescriptionLocalizations({
        fr: "Créer une image par IA",
      })
      .addStringOption((option) =>
        option
          .setName("prompt")
          .setDescription("A description of the image to create")
          .setRequired(true)
          .setDescriptionLocalizations({
            fr: "Une description de l'image à créer",
          })
          .setNameLocalizations({
            fr: "prompt",
          })
          .setMaxLength(1000),
      )
      .addStringOption((option) =>
        option
          .setName("loras")
          .setDescription("Loras to use")
          .setRequired(false)
          .setDescriptionLocalizations({
            fr: "Loras à utiliser",
          })
          .setNameLocalizations({
            fr: "loras",
          })
          .setAutocomplete(true),
      ).addStringOption((option) =>
        option.setName("loras_2").setDescription("Loras to use").setRequired(false).setDescriptionLocalizations({
          fr: "Loras à utiliser",
        }).setNameLocalizations({
          fr: "second_loras",
        }).setAutocomplete(true),
      ).addStringOption((option) =>
        option.setName("loras_3").setDescription("Loras to use").setRequired(false).setDescriptionLocalizations({
          fr: "Loras à utiliser",
        }).setNameLocalizations({
          fr: "third_loras",
        }).setAutocomplete(true),
      ).addStringOption((option) =>
        option.setName("loras_4").setDescription("Loras to use").setRequired(false).setDescriptionLocalizations({
          fr: "Loras à utiliser",
        }).setNameLocalizations({
          fr: "fourth_loras",
        }).setAutocomplete(true),
      ).addStringOption((option) =>
        option.setName("loras_5").setDescription("Loras to use").setRequired(false).setDescriptionLocalizations({
          fr: "Loras à utiliser",
        }).setNameLocalizations({
          fr: "fifth_loras",
        }).setAutocomplete(true),
      )
      .addBooleanOption((option) =>
        option
          .setName("preprompt")
          .setDescription("Inject a default prompt (when using Loras)")
          .setRequired(false)
          .setDescriptionLocalizations({
            fr: "Injecter un prompt par défaut (lors de l'utilisation de Loras)",
          }),
      )
      .addBooleanOption((option) =>
        option
          .setName("nsfw")
          .setDescription("Enable NSFW")
          .setRequired(false)
          .setDescriptionLocalizations({
            fr: "Activer le NSFW",
          }),
      )
      .addStringOption((option) =>
        option
          .setName("negative_prompt")
          .setDescription("Describe what the image should not be")
          .setRequired(false)
          .setNameLocalizations({
            fr: "prompt_negatif",
          })
          .setDescriptionLocalizations({
            fr: "Decrire ce que l'image ne doit pas être",
          }),
      )
      .addStringOption((option) =>
        option
          .setName("model")
          .setDescription("A style to choose for the image")
          .setRequired(false)
          .setDescriptionLocalizations({
            fr: "Un style à choisir pour l'image",
          })
          .setNameLocalizations({
            fr: "modèle",
          })
          .setAutocomplete(true),
      ),
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("login")
      .setDescription("Login to stablehorde.net")
      .setDescriptionLocalizations({
        fr: "Ce connecter à stablehorde.net",
      }),
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("help")
      .setDescription("Show IA help")
      .setDescriptionLocalizations({
        fr: "Afficher l'aide IA",
      }),
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("info")
      .setDescription("Show user informations")
      .setDescriptionLocalizations({
        fr: "Afficher les informations d'un utilisateur",
      })
      .addUserOption((option) =>
        option
          .setName("user")
          .setDescription("An user other than you")
          .setRequired(false)
          .setDescriptionLocalizations({
            fr: "Un autre utilisateur que vous",
          }),
      ),
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("logout")
      .setDescription("Logout to stablehorde.net")
      .setDescriptionLocalizations({
        fr: "Se déconnecter de stablehorde.net",
      }),
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("ask")
      .setDescription("Ask a question to the AI")
      .setDescriptionLocalizations({
        fr: "Poser une question à l'IA",
      })
      .addStringOption((option) =>
        option
          .setName("question")
          .setDescription("The question to ask")
          .setRequired(true)
          .setDescriptionLocalizations({
            fr: "La question à poser",
          })
          .setMaxLength(1024),
      )
      .addNumberOption((option) =>
        option
          .setName("temperature")
          .setDescription("The temperature of the answer")
          .setRequired(false)
          .setDescriptionLocalizations({
            fr: "La température de la réponse",
          }),
      )
      .addNumberOption((option) =>
        option
          .setName("top-p")
          .setDescription("The probability of the answer")
          .setRequired(false)
          .setDescriptionLocalizations({
            fr: "La probabilité de la réponse",
          }),
      )
      .addNumberOption((option) =>
        option
          .setName("frequency-penalty")
          .setDescription("The frequency penalty")
          .setRequired(false)
          .setDescriptionLocalizations({
            fr: "La pénalité de fréquence",
          }),
      ),
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("interogate")
      .setDescription("Interrogate the AI")
      .setDescriptionLocalizations({
        fr: "Interroger l'IA",
      })
      .addAttachmentOption((option) =>
        option
          .setName("image")
          .setDescription("The image to interrogate")
          .setRequired(true)
          .setDescriptionLocalizations({
            fr: "L'image à interroger",
          }),
      ),
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("give")
      .setDescription("Give kudos to an user")
      .setDescriptionLocalizations({
        fr: "Donner des kudos à un utilisateur",
      })
      .addUserOption((option) =>
        option
          .setName("user")
          .setDescription("The user")
          .setRequired(true)
          .setDescriptionLocalizations({
            fr: "L'utilisateur",
          }),
      )
      .addNumberOption((option) =>
        option
          .setName("amount")
          .setDescription("The number of kudos to give")
          .setRequired(false)
          .setDescriptionLocalizations({
            fr: "Le nombre de kudos à donner",
          }),
      ),
  )
  .addSubcommand((subcommand) =>
    subcommand.setName("config")
      .setDescription("Configure the AI")
      .setDescriptionLocalizations({
        fr: "Configurer l'IA",
      })
      .addBooleanOption((option) =>
        option.setName("loras_preprompt").setDescription("Whether to use Loras as preprompt").setRequired(false).setDescriptionLocalizations({
          fr: "Utiliser Loras comme preprompt",
        }).setNameLocalizations({
          fr: "loras_preprompt",
        })
      ).addNumberOption((option) =>
        option.setName("cfg_scale").setDescription("How much the IA should listen").setRequired(false).setDescriptionLocalizations({
          fr: "A quel point l'IA doit écouter",
        }).setNameLocalizations({
          fr: "cfg_scale",
        })
          .addChoices(
            {
              name: "0.10",
              value: 0.10,
            },
            {
              name: "0.25",
              value: 0.25,
            },
            {
              name: "0.50",
              value: 0.50,
            },
            {
              name: "0.75",
              value: 0.75,
            },
            {
              name: "1.00",
              value: 1.00,
            })
      )
      .addStringOption((option) =>
        option.setName("shared_key").setDescription("The shared key to use").setRequired(false).setDescriptionLocalizations({
          fr: "La clé partagée à utiliser",
        }).setNameLocalizations({
          fr: "shared_key",
        })
      )
      .addStringOption((option) =>
        option.setName("upscaler")
          .setDescription("The upscaller to use")
          .setRequired(false)
          .setDescriptionLocalizations({
            fr: "L'upscaller à utiliser",
          })
          .setNameLocalizations({
            fr: "upscaller",
          })
          .addChoices(
            {
              name: ModelGenerationInputPostProcessingTypes.RealESRGAN_x4plus,
              value: ModelGenerationInputPostProcessingTypes.RealESRGAN_x4plus,
            },
            {
              name: ModelGenerationInputPostProcessingTypes["4x_AnimeSharp"],
              value: ModelGenerationInputPostProcessingTypes["4x_AnimeSharp"],
            },
            {
              name: ModelGenerationInputPostProcessingTypes.CodeFormers,
              value: ModelGenerationInputPostProcessingTypes.CodeFormers,
            },
            {
              name: ModelGenerationInputPostProcessingTypes.GFPGAN,
              value: ModelGenerationInputPostProcessingTypes.GFPGAN,
            },
            {
              name: ModelGenerationInputPostProcessingTypes.NMKD_Siax,
              value: ModelGenerationInputPostProcessingTypes.NMKD_Siax,
            },
            {
              name: ModelGenerationInputPostProcessingTypes.RealESRGAN_x2plus,
              value: ModelGenerationInputPostProcessingTypes.RealESRGAN_x2plus,
            }, {
            name: ModelGenerationInputPostProcessingTypes.RealESRGAN_x4plus_anime_6B,
            value: ModelGenerationInputPostProcessingTypes.RealESRGAN_x4plus_anime_6B,
          }, {
            name: ModelGenerationInputPostProcessingTypes.strip_background,
            value: ModelGenerationInputPostProcessingTypes.strip_background,
          }
          )
      )
      .addStringOption((option) =>
        option
          .setName("loras")
          .setDescription("Loras to use")
          .setRequired(false)
          .setDescriptionLocalizations({
            fr: "Loras à utiliser",
          })
          .setNameLocalizations({
            fr: "loras",
          })
          .setAutocomplete(true),
      ).addStringOption((option) =>
        option.setName("loras_2").setDescription("Loras to use").setRequired(false).setDescriptionLocalizations({
          fr: "Loras à utiliser",
        }).setNameLocalizations({
          fr: "second_loras",
        }).setAutocomplete(true),
      ).addStringOption((option) =>
        option.setName("loras_3").setDescription("Loras to use").setRequired(false).setDescriptionLocalizations({
          fr: "Loras à utiliser",
        }).setNameLocalizations({
          fr: "third_loras",
        }).setAutocomplete(true),
      ).addStringOption((option) =>
        option.setName("loras_4").setDescription("Loras to use").setRequired(false).setDescriptionLocalizations({
          fr: "Loras à utiliser",
        }).setNameLocalizations({
          fr: "fourth_loras",
        }).setAutocomplete(true),
      ).addStringOption((option) =>
        option.setName("loras_5").setDescription("Loras to use").setRequired(false).setDescriptionLocalizations({
          fr: "Loras à utiliser",
        }).setNameLocalizations({
          fr: "fifth_loras",
        }).setAutocomplete(true),
      )
      .addStringOption((option) =>
        option
          .setName("preprompt")
          .setDescription("Write a default prompt to use : {p} for the prompt and {ng} for the negative prompt")
          .setRequired(false)
          .setDescriptionLocalizations({
            fr: "Écrire un prompt par défaut à utiliser : {p} pour le prompt et {ng} pour le prompt négatif",
          }),
      )
      .addBooleanOption((option) =>
        option
          .setName("nsfw")
          .setDescription("Enable NSFW")
          .setRequired(false)
          .setDescriptionLocalizations({
            fr: "Activer le NSFW",
          }),
      )
      .addStringOption((option) =>
        option
          .setName("model")
          .setDescription("A style to choose for the image")
          .setRequired(false)
          .setDescriptionLocalizations({
            fr: "Un style à choisir pour l'image",
          })
          .setNameLocalizations({
            fr: "modèle",
          })
          .setAutocomplete(true),
      )
      .addNumberOption((option) =>
        option
          .setName("step")
          .setDescription("The number of steps to perform")
          .setRequired(false)
          .setDescriptionLocalizations({
            fr: "Le nombre d'étapes à effectuer",
          })
          .setMinValue(1)
          .setMaxValue(500),
      )
      .addNumberOption((option) =>
        option
          .setName("width")
          .setDescription("The width of the image")
          .setRequired(false)
          .setDescriptionLocalizations({
            fr: "La largeur de l'image",
          })
          .setMinValue(64)
          .setMaxValue(3072),
      )
      .addNumberOption((option) =>
        option
          .setName("height")
          .setDescription("The height of the image")
          .setRequired(false)
          .setDescriptionLocalizations({
            fr: "La hauteur de l'image",
          })
          .setMinValue(64)
          .setMaxValue(3072),
      )
      .addStringOption((option) =>
        option
          .setName("sampler")
          .setDescription("The name of the sampler")
          .setRequired(false)
          .setDescriptionLocalizations({
            fr: "Le nom de l'échantillonneur",
          })
          .addChoices(
            {
              name: ModelGenerationInputStableSamplers.DDIM,
              value: ModelGenerationInputStableSamplers.DDIM,
            },
            {
              name: ModelGenerationInputStableSamplers.dpmsolver,
              value: ModelGenerationInputStableSamplers.dpmsolver,
            },
            {
              name: ModelGenerationInputStableSamplers.PLMS,
              value: ModelGenerationInputStableSamplers.PLMS,
            },
            {
              name: ModelGenerationInputStableSamplers.k_dpm_2,
              value: ModelGenerationInputStableSamplers.k_dpm_2,
            },
            {
              name: ModelGenerationInputStableSamplers.k_dpm_2_a,
              value: ModelGenerationInputStableSamplers.k_dpm_2_a,
            },
            {
              name: ModelGenerationInputStableSamplers.k_dpm_adaptive,
              value: ModelGenerationInputStableSamplers.k_dpm_adaptive,
            },
            {
              name: ModelGenerationInputStableSamplers.k_dpm_fast,
              value: ModelGenerationInputStableSamplers.k_dpm_fast,
            },
            {
              name: ModelGenerationInputStableSamplers.k_dpmpp_2m,
              value: ModelGenerationInputStableSamplers.k_dpmpp_2m,
            },
            {
              name: ModelGenerationInputStableSamplers.k_dpmpp_2s_a,
              value: ModelGenerationInputStableSamplers.k_dpmpp_2s_a,
            },
            {
              name: ModelGenerationInputStableSamplers.k_euler,
              value: ModelGenerationInputStableSamplers.k_euler,
            },
            {
              name: ModelGenerationInputStableSamplers.k_heun,
              value: ModelGenerationInputStableSamplers.k_heun,
            },
            {
              name: ModelGenerationInputStableSamplers.k_lms,
              value: ModelGenerationInputStableSamplers.k_lms,
            },
          ),
      )
      .addNumberOption((option) =>
        option
          .setName("clip_skip")
          .setDescription("The number of steps to skip")
          .setRequired(false)
          .setDescriptionLocalizations({
            fr: "Le nombre de pas à ignorer",
          })
          .setMaxValue(12)
          .setMinValue(1),
      )
      .addNumberOption((option) =>
        option
          .setName("numbers")
          .setDescription("The number of images to generate")
          .setRequired(false)
          .setDescriptionLocalizations({
            fr: "Le nombre d'image à générer",
          })
          .setMaxValue(10)
          .setMinValue(1),
      )
  )
  .addSubcommandGroup((subcommandGroup) =>
    subcommandGroup
      .setName("advanced")
      .setDescription("Advanced generation commands")
      .setDescriptionLocalizations({
        fr: "Commandes avancées de génération",
      })
      .addSubcommand((subcommand) =>
        subcommand
          .setName("imagine")
          .setDescription("Create an image by AI")
          .setDescriptionLocalizations({
            fr: "Créer une image par IA",
          })
          .addStringOption((option) =>
            option
              .setName("prompt")
              .setDescription("A description of the image to create")
              .setRequired(true)
              .setDescriptionLocalizations({
                fr: "Une description de l'image à créer",
              })
              .setNameLocalizations({
                fr: "prompt",
              })
              .setMaxLength(1000),
          )
          .addStringOption((option) =>
            option
              .setName("loras")
              .setDescription("Loras to use")
              .setRequired(false)
              .setDescriptionLocalizations({
                fr: "Loras à utiliser",
              })
              .setNameLocalizations({
                fr: "loras",
              })
              .setAutocomplete(true),
          )
          .addBooleanOption((option) =>
            option
              .setName("nsfw")
              .setDescription("Enable NSFW")
              .setRequired(false)
              .setDescriptionLocalizations({
                fr: "Activer le NSFW",
              }),
          )
          .addStringOption((option) =>
            option
              .setName("negative_prompt")
              .setDescription("Describe what the image should not be")
              .setRequired(false)
              .setNameLocalizations({
                fr: "prompt_negatif",
              })
              .setDescriptionLocalizations({
                fr: "Decrire ce que l'image ne doit pas être",
              }),
          )
          .addStringOption((option) =>
            option
              .setName("model")
              .setDescription("A style to choose for the image")
              .setRequired(false)
              .setDescriptionLocalizations({
                fr: "Un style à choisir pour l'image",
              })
              .setNameLocalizations({
                fr: "modèle",
              })
              .setAutocomplete(true),
          )
          .addNumberOption((option) =>
            option
              .setName("step")
              .setDescription("The number of steps to perform")
              .setRequired(false)
              .setDescriptionLocalizations({
                fr: "Le nombre d'étapes à effectuer",
              })
              .setMinValue(1)
              .setMaxValue(500),
          )
          .addNumberOption((option) =>
            option
              .setName("width")
              .setDescription("The width of the image")
              .setRequired(false)
              .setDescriptionLocalizations({
                fr: "La largeur de l'image",
              })
              .setMinValue(64)
              .setMaxValue(3072),
          )
          .addNumberOption((option) =>
            option
              .setName("height")
              .setDescription("The height of the image")
              .setRequired(false)
              .setDescriptionLocalizations({
                fr: "La hauteur de l'image",
              })
              .setMinValue(64)
              .setMaxValue(3072),
          )
          .addStringOption((option) =>
            option
              .setName("sampler_name")
              .setDescription("The name of the sampler")
              .setRequired(false)
              .setDescriptionLocalizations({
                fr: "Le nom de l'échantillonneur",
              })
              .addChoices(
                {
                  name: ModelGenerationInputStableSamplers.DDIM,
                  value: ModelGenerationInputStableSamplers.DDIM,
                },
                {
                  name: ModelGenerationInputStableSamplers.dpmsolver,
                  value: ModelGenerationInputStableSamplers.dpmsolver,
                },
                {
                  name: ModelGenerationInputStableSamplers.PLMS,
                  value: ModelGenerationInputStableSamplers.PLMS,
                },
                {
                  name: ModelGenerationInputStableSamplers.k_dpm_2,
                  value: ModelGenerationInputStableSamplers.k_dpm_2,
                },
                {
                  name: ModelGenerationInputStableSamplers.k_dpm_2_a,
                  value: ModelGenerationInputStableSamplers.k_dpm_2_a,
                },
                {
                  name: ModelGenerationInputStableSamplers.k_dpm_adaptive,
                  value: ModelGenerationInputStableSamplers.k_dpm_adaptive,
                },
                {
                  name: ModelGenerationInputStableSamplers.k_dpm_fast,
                  value: ModelGenerationInputStableSamplers.k_dpm_fast,
                },
                {
                  name: ModelGenerationInputStableSamplers.k_dpmpp_2m,
                  value: ModelGenerationInputStableSamplers.k_dpmpp_2m,
                },
                {
                  name: ModelGenerationInputStableSamplers.k_dpmpp_2s_a,
                  value: ModelGenerationInputStableSamplers.k_dpmpp_2s_a,
                },
                {
                  name: ModelGenerationInputStableSamplers.k_euler,
                  value: ModelGenerationInputStableSamplers.k_euler,
                },
                {
                  name: ModelGenerationInputStableSamplers.k_heun,
                  value: ModelGenerationInputStableSamplers.k_heun,
                },
                {
                  name: ModelGenerationInputStableSamplers.k_lms,
                  value: ModelGenerationInputStableSamplers.k_lms,
                },
              ),
          )
          .addNumberOption((option) =>
            option
              .setName("clip_skip")
              .setDescription("The number of steps to skip")
              .setRequired(false)
              .setDescriptionLocalizations({
                fr: "Le nombre de pas à ignorer",
              })
              .setMaxValue(12)
              .setMinValue(1),
          )
          .addNumberOption((option) =>
            option
              .setName("n")
              .setDescription("The number of images to generate")
              .setRequired(false)
              .setDescriptionLocalizations({
                fr: "Le nombre d'image à générer",
              })
              .setMaxValue(10)
              .setMinValue(1),
          ),
      ),
  )
  .toJSON();

export class IaCommand extends CommandsBase {
  constructor(client: Bot) {
    super(client, commandData);
  }

  async run(interaction: CommandInteraction) {
    let options = interaction.options;
    if (options instanceof CommandInteractionOptionResolver) {
      let subcommand = options.getSubcommandGroup() ?? options.getSubcommand();
      switch (subcommand) {
        case "advanced":
          await Advanced(this, interaction);
          break;
        case "imagine":
          await Imagine(this, interaction);
          break;
        case "login":
          await Login(this, interaction);
          break;
        case "help":
          await Help(this, interaction);
          break;
        case "info":
          await Info(this, interaction);
          break;
        case "logout":
          await Logout(this, interaction);
          break;
        case "ask":
          await Ask(this, interaction);
          break;
        case "give":
          await Give(this, interaction);
        case "interogate":
          await Interogate(this, interaction);
          break;
        case "config":
          await Config(this, interaction);
          break;
        default:
          interaction.reply({
            content: "Une erreur est survenue",
            flags: MessageFlags.Ephemeral,
          });
          break;
      }
    } else {
      interaction.reply({
        content: bt.__({
          phrase: "An error occured",
          locale: interaction.locale,
        }),
        flags: MessageFlags.Ephemeral,
      });
    }
  }

  async autocomplete(interaction: AutocompleteInteraction): Promise<void> {
    let options = interaction.options;
    if (options instanceof CommandInteractionOptionResolver) {
      let autocomplete = options.getFocused(true);
      switch (autocomplete.name) {
        case "model":
          this.client.aiHorde.getModels().then((models) => {
            let modelsFiltereds = models;
            if (autocomplete.value.length > 0) {
              modelsFiltereds = models.filter((modelFilter) => {
                if (!modelFilter?.name) return false;
                return modelFilter?.name
                  .toLowerCase()
                  .includes(autocomplete.value.toLowerCase());
              });
            }
            modelsFiltereds = modelsFiltereds.slice(0, 24);
            let optionsMapped: ApplicationCommandOptionChoiceData[] =
              modelsFiltereds.map((model) => {
                return {
                  name: `${model.name} (Queue ${model.queued} - ${model.count} workers)`,
                  value: model.name as string,
                };
              });
            interaction.respond(optionsMapped);
          });
          break;
        case "loras":
          lorasLookup(autocomplete.value, interaction, this.client);
          break;
        case "loras_2":
          lorasLookup(autocomplete.value, interaction, this.client);
          break;
        case "loras_3":
          lorasLookup(autocomplete.value, interaction, this.client);
          break;
        case "loras_4":
          lorasLookup(autocomplete.value, interaction, this.client);
          break;
        case "loras_5":
          lorasLookup(autocomplete.value, interaction, this.client);
          break;
      }
    }
  }
}


function lorasLookup(value: string, interaction: AutocompleteInteraction, client: Bot) {
  if (!isNaN(Number(value))) {
    client.getLorasModel(value).then((Loras) => {
      interaction.respond([
        {
          name: Loras.name,
          value: String(Loras.id),
        }
      ]).catch((_) => { });
    }).catch((err) => {
      interaction.respond([{
        name: "No loras found",
        value: "0"
      }]).catch((_) => { });
    });
  } else {
    client.getLorasModels({
      name: value,
      limit: 5
    }).then((Loras) => {
      interaction
        .respond(
          Loras.items.map((model) => {
            return {
              name: model.name,
              value: String(model.id),
            };
          }),
        )
        .catch((_) => { });
    }).catch((err) => {
      interaction.respond([{
        name: "No loras found",
        value: "0"
      }]).catch((_) => { });
    });
  }
}