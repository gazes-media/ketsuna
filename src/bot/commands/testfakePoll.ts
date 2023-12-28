import { APIActionRowComponent, APIButtonComponent, APIMessage, ActionRowBuilder, ApplicationCommandOptionChoiceData, ApplicationFlags, AttachmentPayload, AutocompleteInteraction, ButtonBuilder, ButtonComponent, ButtonStyle, CacheType, CommandInteraction, CommandInteractionOptionResolver, ComponentType, InteractionReplyOptions, Message, MessageEditOptions, MessageFlags, MessageFlagsBitField, SlashCommandBuilder, TextChannel, TextInputBuilder, TextInputStyle } from "discord.js";
import Bot from "../index";
import CommandsBase from "./baseCommands";
import { ModelGenerationInputPostProcessingTypes, ModelGenerationInputStableSamplers } from "../../internal_libs/aihorde";
import CommandInteractionWebHook from "../class/commandInteraction";
import AutocompleteInteractionWebHook from "../class/autoCompleteInteraction";
export class Poll extends CommandsBase {
    constructor(client: Bot) {
        super(client, new SlashCommandBuilder()
            .setName("poll")
            .setDescription("Fait un poll"))
    }

    async run(interaction: CommandInteractionWebHook): Promise<void> {
        interaction.showModal({
            title: "Poll",
            components: [
                new ActionRowBuilder<TextInputBuilder>()
            .addComponents(
                [new TextInputBuilder()
                    .setLabel("Question")
                    .setCustomId("question")
                    .setPlaceholder("Question")
                    .setMinLength(1)
                    .setStyle(TextInputStyle.Short)
                    .setMaxLength(100)
                ]
            )
            .toJSON(),
            new ActionRowBuilder<TextInputBuilder>()
            .addComponents(
                [new TextInputBuilder()
                    .setLabel("Option 1")
                    .setCustomId("opt1")
                    .setPlaceholder("Option 1")
                    .setMinLength(1)
                    .setStyle(TextInputStyle.Short)
                    .setMaxLength(100)
                ]
            )
            .toJSON(),
            new ActionRowBuilder<TextInputBuilder>()
            .addComponents(
                [new TextInputBuilder()
                    .setLabel("Option 2")
                    .setCustomId("opt2")
                    .setPlaceholder("Option 2")
                    .setMinLength(1)
                    .setStyle(TextInputStyle.Short)
                    .setMaxLength(100)
                ]
            ).toJSON()
            ],
            custom_id: "poll",
        })

        let modal = await interaction.awaitModalSubmit({
            filter: (i) => {
                console.log(i.customId,i.user.id === interaction.user.id);
                return i.customId === "poll" && i.user.id === interaction.user.id
                },
            time: 1000 * 60 * 10,
            dispose: true,
        });
        console.log(modal);
        let question = modal.getValue("question");
        let opt1 = modal.getValue("opt1");
        let opt2 = modal.getValue("opt2");
        if(!question || !opt1 || !opt2) {
            modal.reply({
                content: "Erreur lors de la création du poll",
                flags: MessageFlags.Ephemeral,
            });
            return;
        }else{
            modal.reply({
                content: question,
                components: [
                    new ActionRowBuilder<ButtonBuilder>()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId("opt1")
                                .setLabel(opt1)
                                .setStyle(ButtonStyle.Primary),
                            new ButtonBuilder()
                                .setCustomId("opt2")
                                .setLabel(opt2)
                                .setStyle(ButtonStyle.Primary),
                        )
                        .toJSON()
                ],
            });
        }
    }
}