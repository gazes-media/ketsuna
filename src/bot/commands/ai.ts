import { ApplicationCommandOptionChoiceData, AutocompleteInteraction, CommandInteraction, CommandInteractionOptionResolver, MessageFlags, SlashCommandBuilder } from "discord.js";
import Bot from "../index";
import CommandsBase from "./baseCommands";
import Login from "./ai/login";
import Imagine from "./ai/imagine";
import Help from "./ai/help";
import Info from "./ai/info";
import Ask from "./ai/ask";
import Logout from "./ai/logout";
import Interogate from "./ai/interogate";
import { ModelGenerationInputStableSamplers } from "../../internal_libs/aihorde";
import Advanced from "./ai/advanced";
import Give from "./ai/give";
import { bt } from "../../main";


const commandData = new SlashCommandBuilder()
    .setName("ia")
    .setDescription("Commandes IA")
    .addSubcommand(subcommand => subcommand
        .setName("imagine")
        .setDescription("Create an image by AI")
        .setDescriptionLocalizations({
            fr: "Créer une image par IA",
        })
        .addStringOption(option => option.setName("prompt").setDescription("A description of the image to create").setRequired(true).setDescriptionLocalizations({
            fr: "Une description de l'image à créer",
        }).setNameLocalizations({
            fr: "prompt",
        }).setMaxLength(1000))
        .addStringOption(option => option.setName("loras").setDescription("Loras to use").setRequired(false).setDescriptionLocalizations({
            fr: "Loras à utiliser",
        }).setNameLocalizations({
            fr: "loras"
        }).setAutocomplete(true))
        .addBooleanOption(option => option.setName("preprompt").setDescription("Inject a default prompt (when using Loras)").setRequired(false).setDescriptionLocalizations({
            fr: "Injecter un prompt par défaut (lors de l'utilisation de Loras)",
        }))
        .addBooleanOption(option => option.setName("nsfw").setDescription("Enable NSFW").setRequired(false).setDescriptionLocalizations({
            fr: "Activer le NSFW",
        }))
        .addStringOption(option => option.setName("negative_prompt").setDescription("Describe what the image should not be").setRequired(false).setNameLocalizations({
            fr: "prompt_negatif"
        }).setDescriptionLocalizations({
            fr: "Decrire ce que l'image ne doit pas être",
        }))
        .addStringOption(option => option.setName("model").setDescription("A style to choose for the image").setRequired(false).setDescriptionLocalizations({
            fr: "Un style à choisir pour l'image",
        }).setNameLocalizations({
            fr: "modèle"
        }).setAutocomplete(true))
    )
    .addSubcommand(subcommand => subcommand
        .setName("login")
        .setDescription("Login to stablehorde.net")
        .setDescriptionLocalizations({
            fr: "Ce connecter à stablehorde.net",
        })
    )
    .addSubcommand(subcommand => subcommand
        .setName("help")
        .setDescription("Show IA help")
        .setDescriptionLocalizations({
            fr: "Afficher l'aide IA",
        })
    )
    .addSubcommand(subcommand => subcommand
        .setName("info")
        .setDescription("Show user informations")
        .setDescriptionLocalizations({
            fr: "Afficher les informations d'un utilisateur",
        })
        .addUserOption(option => option.setName("user").setDescription("An user other than you").setRequired(false).setDescriptionLocalizations({
            fr: "Un autre utilisateur que vous",
        }))
    )
    .addSubcommand(subcommand => subcommand
        .setName("logout")
        .setDescription("Logout to stablehorde.net")
        .setDescriptionLocalizations({
            fr: "Se déconnecter de stablehorde.net",
        })
    )
    .addSubcommand(subcommand => subcommand
        .setName("ask")
        .setDescription("Ask a question to the AI")
        .setDescriptionLocalizations({
            fr: "Poser une question à l'IA",
        })
        .addStringOption(option => option.setName("question").setDescription("The question to ask").setRequired(true).setDescriptionLocalizations({
            fr: "La question à poser",
        }).setMaxLength(1024))
        .addNumberOption(option => option.setName("temperature").setDescription("The temperature of the answer").setRequired(false).setDescriptionLocalizations({
            fr: "La température de la réponse",
        }))
        .addNumberOption(option => option.setName("top-p").setDescription("The probability of the answer").setRequired(false).setDescriptionLocalizations({
            fr: "La probabilité de la réponse",
        }))
        .addNumberOption(option => option.setName("frequency-penalty").setDescription("The frequency penalty").setRequired(false).setDescriptionLocalizations({
            fr: "La pénalité de fréquence",
        }))
    ).addSubcommand(subcommand => subcommand
        .setName("interogate")
        .setDescription("Interrogate the AI")
        .setDescriptionLocalizations({
            fr: "Interroger l'IA",
        })
        .addAttachmentOption(option => option.setName("image").setDescription("The image to interrogate").setRequired(true).setDescriptionLocalizations({
            fr: "L'image à interroger",
        }))
    )
    .addSubcommand(subcommand => subcommand
        .setName("give")
        .setDescription("Give kudos to an user")
        .setDescriptionLocalizations({
            fr: "Donner des kudos à un utilisateur",
        })
        .addUserOption(option => option.setName("user").setDescription("The user").setRequired(true).setDescriptionLocalizations({
            fr: "L'utilisateur",
        }))
        .addNumberOption(option => option.setName("amount").setDescription("The number of kudos to give").setRequired(false).setDescriptionLocalizations({
            fr: "Le nombre de kudos à donner",
        }))
    )
    .addSubcommandGroup(subcommandGroup => subcommandGroup
        .setName("advanced")
        .setDescription("Advanced generation commands").setDescriptionLocalizations({
            fr: "Commandes avancées de génération"
        }).addSubcommand(subcommand => subcommand
            .setName("imagine")
            .setDescription("Create an image by AI")
            .setDescriptionLocalizations({
                fr: "Créer une image par IA",
            })
            .addStringOption(option => option.setName("prompt").setDescription("A description of the image to create").setRequired(true).setDescriptionLocalizations({
                fr: "Une description de l'image à créer",
            }).setNameLocalizations({
                fr: "prompt",
            }).setMaxLength(1000))
            .addStringOption(option => option.setName("loras").setDescription("Loras to use").setRequired(false).setDescriptionLocalizations({
                fr: "Loras à utiliser",
            }).setNameLocalizations({
                fr: "loras"
            }).setAutocomplete(true))
            .addBooleanOption(option => option.setName("nsfw").setDescription("Enable NSFW").setRequired(false).setDescriptionLocalizations({
                fr: "Activer le NSFW",
            }))
            .addStringOption(option => option.setName("negative_prompt").setDescription("Describe what the image should not be").setRequired(false).setNameLocalizations({
                fr: "prompt_negatif"
            }).setDescriptionLocalizations({
                fr: "Decrire ce que l'image ne doit pas être",
            }))
            .addStringOption(option => option.setName("model").setDescription("A style to choose for the image").setRequired(false).setDescriptionLocalizations({
                fr: "Un style à choisir pour l'image",
            }).setNameLocalizations({
                fr: "modèle"
            }).setAutocomplete(true))
            .addNumberOption(option => option.setName("step").setDescription("The number of steps to perform").setRequired(false).setDescriptionLocalizations({
                fr: "Le nombre d'étapes à effectuer",
            }).setMinValue(1).setMaxValue(500))
            .addNumberOption(option => option.setName("width").setDescription("The width of the image").setRequired(false).setDescriptionLocalizations({
                fr: "La largeur de l'image",
            }).setMinValue(64).setMaxValue(3072))
            .addNumberOption(option => option.setName("height").setDescription("The height of the image").setRequired(false).setDescriptionLocalizations({
                fr: "La hauteur de l'image",
            }).setMinValue(64).setMaxValue(3072))
            .addStringOption(option => option.setName("sampler_name").setDescription("The name of the sampler").setRequired(false).setDescriptionLocalizations({
                fr: "Le nom de l'échantillonneur",
            }).addChoices({
                name: ModelGenerationInputStableSamplers.DDIM,
                value: ModelGenerationInputStableSamplers.DDIM
            }, {
                name: ModelGenerationInputStableSamplers.dpmsolver,
                value: ModelGenerationInputStableSamplers.dpmsolver
            },{
                name: ModelGenerationInputStableSamplers.PLMS,
                value: ModelGenerationInputStableSamplers.PLMS
            },{
                name: ModelGenerationInputStableSamplers.k_dpm_2,
                value: ModelGenerationInputStableSamplers.k_dpm_2
            },{
                name: ModelGenerationInputStableSamplers.k_dpm_2_a,
                value: ModelGenerationInputStableSamplers.k_dpm_2_a
            },{
                name: ModelGenerationInputStableSamplers.k_dpm_adaptive,
                value: ModelGenerationInputStableSamplers.k_dpm_adaptive
            },{
                name: ModelGenerationInputStableSamplers.k_dpm_fast,
                value: ModelGenerationInputStableSamplers.k_dpm_fast
            },{
                name: ModelGenerationInputStableSamplers.k_dpmpp_2m,
                value: ModelGenerationInputStableSamplers.k_dpmpp_2m
            },{
                name: ModelGenerationInputStableSamplers.k_dpmpp_2s_a,
                value: ModelGenerationInputStableSamplers.k_dpmpp_2s_a
            },{
                name: ModelGenerationInputStableSamplers.k_euler,
                value: ModelGenerationInputStableSamplers.k_euler
            },{
                name: ModelGenerationInputStableSamplers.k_heun,
                value: ModelGenerationInputStableSamplers.k_heun
            },{
                name: ModelGenerationInputStableSamplers.k_lms,
                value: ModelGenerationInputStableSamplers.k_lms
            })).addNumberOption(option => option.setName("clip_skip").setDescription("The number of steps to skip").setRequired(false).setDescriptionLocalizations({
                fr: "Le nombre de pas à ignorer",
            }).setMaxValue(12).setMinValue(1))
            .addNumberOption(option => option.setName("n").setDescription("The number of images to generate").setRequired(false).setDescriptionLocalizations({
                fr: "Le nombre d'image à générer",
            }).setMaxValue(10).setMinValue(1))
        )
    )
    .toJSON();

export class IaCommand extends CommandsBase {
    constructor(client: Bot) {
        super(client, commandData);
    }

    async run(interaction: CommandInteraction){
        let options = interaction.options
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
                default:
                    interaction.reply({
                        content: "Une erreur est survenue",
                        flags: MessageFlags.Ephemeral
                    });
                    break;
            }
        } else {
            interaction.reply({
                content: bt.__({ phrase: "An error occured", locale: interaction.locale }),
                flags: MessageFlags.Ephemeral
            });
        }
    }

    async autocomplete(interaction: AutocompleteInteraction): Promise<void> {
        let options = interaction.options;
        if (options instanceof CommandInteractionOptionResolver) {
            let autocomplete = options.getFocused(true);
            if (autocomplete.name === "model") {
                this.client.aiHorde.getModels().then((models) => {

                    let modelsFiltereds = models;
                    if (autocomplete.value.length > 0) {
                        modelsFiltereds = models.filter((modelFilter) => {
                            if (!modelFilter?.name) return false;
                            return modelFilter?.name.toLowerCase().includes(autocomplete.value.toLowerCase());
                        });
                    }
                    modelsFiltereds = modelsFiltereds.slice(0, 24);
                    let optionsMapped: ApplicationCommandOptionChoiceData[] = modelsFiltereds.map((model) => {
                        return {
                            name: `${model.name} (Queue ${model.queued} - ${model.count} workers)`,
                            value: model.name as string
                        }
                    })
                    interaction.respond(optionsMapped);
                });
            }else if(autocomplete.name === "loras"){
                this.client.aiHorde.getLorasModels(autocomplete.value).then((models) => {
                    interaction.respond(models.items.map((model) => {
                        return {
                            name: `${model.name.substring(0,60)} ${model.nsfw ? "(NSFW)" : ""}`,
                            value: model.name
                        }
                    })).catch((_) => {
                        // ignore Too Much Time passed
                    });
                });
            }
        }
    }
}