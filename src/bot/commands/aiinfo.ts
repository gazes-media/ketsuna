import { CommandInteraction, SlashCommandBuilder, EmbedBuilder } from "discord.js";
import https from "https"; // Module natif de Node.js
import CommandsBase from "./baseCommands";
import Bot from "../index";

const commandData = new SlashCommandBuilder()
  .setName("aiinfo")
  .setDescription("AI performance information");

export class AIInfoCommand extends CommandsBase {
  constructor(client: Bot) {
    super(client, commandData.toJSON());
  }

  async run(interaction: CommandInteraction): Promise<void> {
    await interaction.deferReply(); // Indique que le bot traite la commande

    // Fonction pour effectuer la requête HTTPS
    const fetchAPI = (url: string): Promise<any> =>
      new Promise((resolve, reject) => {
        https.get(url, (res) => {
          let data = "";

          res.on("data", (chunk) => {
            data += chunk;
          });

          res.on("end", () => {
            try {
              resolve(JSON.parse(data));
            } catch (error) {
              reject(new Error("Failed to parse JSON"));
            }
          });
        }).on("error", (err) => {
          reject(err);
        });
      });

    try {
      const data = await fetchAPI("https://stablehorde.net/api/v2/status/performance");

      const embed = new EmbedBuilder()
        .setTitle("AI Performance Information")
        .setColor(0x00ff00) // Couleur verte
        .addFields(
            { name: "Queued Requests", value: data.queued_requests.toString(), inline: true },
            { name: "Number of active Image workers", value: data.worker_count.toString(), inline: true },
            { name: "Number of active Text Workers", value: data.text_worker_count.toString(), inline: true }
        )
        .setFooter({ text: "Data provided by Stable Horde API" })
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error("Error fetching AI info:", error);
      await interaction.editReply({
        content: "Unable to fetch AI information. Please try again later.",
      });
    }
  }
}