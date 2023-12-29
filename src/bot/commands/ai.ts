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
            fr: "L'image à créer",
            "en-GB": "The image to create",
            "en-US": "The image to create"
        }).setNameLocalizations({
            fr: "image",
            "en-GB": "image",
            "en-US": "image"
        }).setMaxLength(1000))
        .addBooleanOption(option => option.setName("nsfw").setDescription("Activer le NSFW").setRequired(false).setDescriptionLocalizations({
            fr: "Activer le NSFW",
            "en-GB": "Enable NSFW",
            "en-US": "Enable NSFW"
        }))
        .addStringOption(option => option.setName("negative_prompt").setDescription("Ce que l'image ne doit pas être").setRequired(false).setNameLocalizations({
            fr: "prompt_negatif"
        }).setDescriptionLocalizations({
            fr: "Ce que l'image ne doit pas être",
            "en-GB": "What the image should not be",
            "en-US": "What the image should not be"
        }))
        .addStringOption(option => option.setName("model").setDescription("Le modèle à utiliser").setRequired(false).setDescriptionLocalizations({
            fr: "Le modèle à utiliser",
            "en-GB": "The model to use",
            "en-US": "The model to use"
        }).setNameLocalizations({
            fr: "modèle"
        }).setAutocomplete(true))
    )
    .addSubcommand(subcommand => subcommand
        .setName("login")
        .setDescription("Se connecter à l'IA Horde")
        .setDescriptionLocalizations({
            fr: "Se connecter à l'IA Horde",
            "en-GB": "Connect to AI Horde",
            "en-US": "Connect to AI Horde"
        })
    )
    .addSubcommand(subcommand => subcommand
        .setName("help")
        .setDescription("Afficher l'aide")
        .setDescriptionLocalizations({
            fr: "Afficher l'aide",
            "en-GB": "Show help",
            "en-US": "Show help"
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