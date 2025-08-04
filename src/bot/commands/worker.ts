import {
  SlashCommandBuilder,
  CommandInteraction,
  CommandInteractionOptionResolver,
  AutocompleteInteraction,
  EmbedBuilder,
  Colors,
} from "discord.js";
import CommandsBase from "./baseCommands";
import Bot from "../index";

// Définition du nouveau slash command avec un champ de recherche optionnel
const commandData = new SlashCommandBuilder()
  .setName("worker")
  .setDescription("Show AI Horde Worker Information")
  .addStringOption((option) =>
    option
      .setName("query")
      .setDescription("Name or ID of the worker to search for")
      .setRequired(true) // Rendre l'option 'query' obligatoire
      .setAutocomplete(true) // Activer l'autocomplétion
  );

export class workerCommand extends CommandsBase {
  constructor(client: Bot) {
    super(client, commandData.toJSON());
  }

  // Exécution de la commande lorsqu'elle est appelée par l'utilisateur
  async run(interaction: CommandInteraction) {
    let i = await interaction.deferReply(); // Réponse différée pour éviter un délai de traitement long

    try {
      // Récupération des données depuis l'API
      const response = await fetch("https://stablehorde.net/api/v2/workers");
      if (!response.ok) throw new Error("Error retrieving API data.");

      const workers: {
        name: string;
        id: string;
        requests_fulfilled: number;
        kudos_rewards: number;
        performance: string;
        uptime: number;
        maintenance_mode: boolean;
        nsfw: boolean;
        trusted: boolean;
        models: string[] | null;
        team: { name: string | null };
      }[] = await response.json();

      // Récupérer l'option 'query' de l'utilisateur (si elle existe)
      const query = (interaction.options as CommandInteractionOptionResolver).getString("query");

      if (query) {
        // Si une recherche spécifique est effectuée
        const worker = workers.find(
          (w) =>
            w.name?.toLowerCase() === query?.toLowerCase() ||
            w.id?.toLowerCase() === query?.toLowerCase()
        );

        if (worker) {
          // Si un worker correspondant est trouvé, afficher ses détails
          const embed = new EmbedBuilder()
            .setTitle(`Worker Details : ${worker.name}`)
            .setColor(Colors.Blue)
            .setDescription(
              `**Name :** ${worker.name}\n` +
              `**ID :** ${worker.id}\n` +
              `**Team :** ${worker.team?.name ?? "null"}\n` +
              `**Performance :** ${worker.performance}\n` +
              `**NSFW :** ${worker.nsfw ? "Yes" : "No"}\n` +
              `**Maintenance :** ${worker.maintenance_mode ? "On" : "Off"}\n` +
              `**Trusted :** ${worker.trusted ? "Yes" : "No"}\n` +
              `**Models :** ${worker.models ? worker.models.join(", ") : "Aucun"}\n` +
              `**Requests Completed :** ${worker.requests_fulfilled}\n` +
              `**Kudos :** ${worker.kudos_rewards}\n` +
              `**Uptime :** ${Math.floor(worker.uptime / 3600)}h ${Math.floor(
                (worker.uptime % 3600) / 60
              )}m`
            );

          await i.edit({ embeds: [embed] });
        } else {
          // Si aucun worker n'est trouvé, afficher un message d'erreur
          await i.edit({ content: "No workers found for this search." });
        }
      } else {
        // Si aucune recherche spécifique n'est effectuée, afficher une liste des 10 premiers workers
        const workerList = workers
          .slice(0, 10) // Limiter la liste des workers à 10 pour éviter un message trop long
          .map((w) =>
            `**${w.name}** (ID: \`${w.id}\`, Models : ${w.models ? w.models.join(", ") : "Aucun"})`
          )
          .join("\n");

        const embed = new EmbedBuilder()
          .setTitle("Liste des Workers")
          .setColor(Colors.Green)
          .setDescription(workerList || "No workers available.");

        await i.edit({ embeds: [embed] });
      }
    } catch (error) {
      console.error(error);
      await i.edit({
        content: "An error occurred while retrieving worker data.",
      });
    }
  }

  // Fonction d'autocomplétion pour les suggestions de recherche
  async autocomplete(interaction: AutocompleteInteraction) {
    try {
      // Récupérer les données des workers
      const response = await fetch("https://stablehorde.net/api/v2/workers");
      if (!response.ok) throw new Error("Error retrieving API data.");

      const workers: { name: string; id: string }[] = await response.json();

      // Filtrer les suggestions en fonction de l'entrée de l'utilisateur
      const focusedValue = interaction.options.getFocused();
      const suggestions = workers
        .filter((worker) =>
          worker.name.toLowerCase().includes(focusedValue.toLowerCase()) ||
          worker.id.toLowerCase().includes(focusedValue.toLowerCase())
        )
        .slice(0, 25) // Limite de 25 suggestions pour Discord
        .map((worker) => ({
          name: worker.name,
          value: worker.id,
        }));

      await interaction.respond(suggestions);
    } catch (error) {
      console.error("Error during autocomplete : ", error);
      await interaction.respond([]); // Répondre avec aucune suggestion en cas d'erreur
    }
  }
}
