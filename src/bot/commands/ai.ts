import { ApplicationCommandOptionChoiceData, AutocompleteInteraction, CommandInteraction, CommandInteractionOptionResolver, MessageFlags, SlashCommandBuilder } from "discord.js";
import Bot from "../index";
import CommandsBase from "./baseCommands";
import Login from "./ai/login";
import Imagine from "./ai/imagine";
import Help from "./ai/help";
import Info from "./ai/info";


const commandData = new SlashCommandBuilder()
    .setName("ia")
    .setDescription("Commandes IA")
    .addSubcommand(subcommand => subcommand
        .setName("imagine")
        .setDescription("Créer une image par IA")
        .setDescriptionLocalizations({
            fr: "Créer une image par IA",
            "en-GB": "Create an image by AI",
            "en-US": "Create an image by AI"
        })
        .addStringOption(option => option.setName("prompt").setDescription("L'image à créer").setRequired(true).setDescriptionLocalizations({
            fr: "Une description de l'image à créer",
            "en-GB": "A description of the image to create",
            "en-US": "A description of the image to create"
        }).setNameLocalizations({
            fr: "prompt",
            "en-GB": "prompt",
            "en-US": "prompt"
        }).setMaxLength(1000))
        .addBooleanOption(option => option.setName("nsfw").setDescription("Activer le NSFW").setRequired(false).setDescriptionLocalizations({
            fr: "Activer le NSFW",
            "en-GB": "Enable NSFW",
            "en-US": "Enable NSFW"
        }))
        .addStringOption(option => option.setName("negative_prompt").setDescription("Decrire ce que l'image ne doit pas être").setRequired(false).setNameLocalizations({
            fr: "prompt_negatif"
        }).setDescriptionLocalizations({
            fr: "Decrire ce que l'image ne doit pas être",
            "en-GB": "Describe what the image should not be",
            "en-US": "Describe what the image should not be"
        }))
        .addStringOption(option => option.setName("model").setDescription("Un style à choisir pour l'image").setRequired(false).setDescriptionLocalizations({
            fr: "Un style à choisir pour l'image",
            "en-GB": "A style to choose for the image",
            "en-US": "A style to choose for the image"
        }).setNameLocalizations({
            fr: "modèle"
        }).setAutocomplete(true))
    )
    .addSubcommand(subcommand => subcommand
        .setName("login")
        .setDescription("Ce connecter à stablehorde.net")
        .setDescriptionLocalizations({
            fr: "Ce connecter à stablehorde.net",
            "en-GB": "Login to stablehorde.net",
            "en-US": "Login to stablehorde.net"
        })
    )
    .addSubcommand(subcommand => subcommand
        .setName("help")
        .setDescription("Afficher l'aide IA")
        .setDescriptionLocalizations({
            fr: "Afficher l'aide IA",
            "en-GB": "Show IA help",
            "en-US": "Show IA help"
        })
    )
    .addSubcommand(subcommand => subcommand
        .setName("info")
        .setDescription("Afficher les informations d'un utilisateur")
        .setDescriptionLocalizations({
            fr: "Afficher les informations d'un utilisateur",
            "en-GB": "Show user informations",
            "en-US": "Show user informations"
        })
        .addUserOption(option => option.setName("user").setDescription("L'utilisateur").setRequired(false).setDescriptionLocalizations({
            fr: "L'utilisateur",
            "en-GB": "The user",
            "en-US": "The user"
        }))
    )
    .toJSON();

export class IaCommand extends CommandsBase {
    constructor(client: Bot) {
        super(client, commandData);
    }

    async run(interaction: CommandInteraction): Promise<void> {
        let options = interaction.options
        if (options instanceof CommandInteractionOptionResolver) {
            let subcommand = options.getSubcommand(true);
            switch (subcommand) {
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
                default:
                    interaction.reply({
                        content: "Une erreur est survenue",
                        flags: MessageFlags.Ephemeral
                    });
                    break;
            }
        } else {
            interaction.reply({
                content: "Une erreur est survenue",
                flags: MessageFlags.Ephemeral
            });
        }
    }

    async autocomplete(interaction: AutocompleteInteraction): Promise<void> {
        let options = interaction.options;
        if (options instanceof CommandInteractionOptionResolver) {
            let modelName = options.getFocused(true);
            if (modelName.name === "model") {
                this.client.aiHorde.getModels().then((models) => {

                    let modelsFiltereds = models;
                    if (modelName.value.length > 0) {
                        modelsFiltereds = models.filter((modelFilter) => {
                            if (!modelFilter?.name) return false;
                            return modelFilter?.name.toLowerCase().includes(modelName.value.toLowerCase());
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
            }
        }
    }
}