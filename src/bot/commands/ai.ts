import { ApplicationCommandOptionChoiceData, CommandInteractionOptionResolver, MessageFlags, SlashCommandBuilder } from "discord.js";
import Bot from "../index";
import CommandsBase from "./baseCommands";
import CommandInteractionWebHook from "../class/commandInteraction";
import AutocompleteInteractionWebHook from "../class/autoCompleteInteraction";
import Login from "./ai/login";
import Imagine from "./ai/imagine";


const commandData = new SlashCommandBuilder()
    .setName("ia")
    .setDescription("Commandes IA")
    .addSubcommand(subcommand => subcommand
        .setName("imagine")
        .setDescription("Ecrivez une image à créer")
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
    )
    .toJSON();

export class IaCommand extends CommandsBase {
    constructor(client: Bot) {
        super(client, commandData);
    }

    async run(interaction: CommandInteractionWebHook): Promise<void> {
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

    async autocomplete(interaction: AutocompleteInteractionWebHook): Promise<void> {
        let options = interaction.command.options;
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
                    interaction.respond({
                        choices: optionsMapped
                    });
                });
            }
        }
    }
}