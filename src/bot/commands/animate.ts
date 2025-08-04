// -----------------------------------------------------------------------------
// animate.ts — /ia animate (v2.6)
// -----------------------------------------------------------------------------
//  • Diaporama GIF/MP4 + musique YouTube (optionnelle, sans coupure audio)
//  • Barre de progression 0-100 %, ETA, charge CPU
//  • yt-dlp : SABR, fallback android_music
//  • Audio étendu par silence (apad) et vidéo coupée à la fin du diaporama (-shortest)
//  • Dépendances : ffmpeg, yt-dlp ≥ 2024-xx-xx, sharp, Node ≥ 18
// -----------------------------------------------------------------------------

import {
  AttachmentBuilder,
  CommandInteraction,
  CommandInteractionOptionResolver,
  SlashCommandBuilder,
} from "discord.js";
import fs from "fs";
import os from "os";
import path from "path";
import { promisify } from "util";
import { spawn, exec } from "child_process";
import sharp from "sharp";

import CommandsBase from "./baseCommands";
import Bot from "../index";

const execAsync = promisify(exec);
const MAX_IMAGES = 12;          // image1 … image12
const BAR_LEN = 22;

/* -------------------------------------------------------------------------- */
/* Slash-command — toutes les options obligatoires AVANT les facultatives     */
/* -------------------------------------------------------------------------- */
const commandData = new SlashCommandBuilder()
  .setName("animate")
  .setDescription("Crée un diaporama GIF/MP4 (+ musique YouTube facultative)")
  // deux images minimales, required = true
  .addAttachmentOption((o) =>
    o.setName("image1").setDescription("Image #1").setRequired(true),
  )
  .addAttachmentOption((o) =>
    o.setName("image2").setDescription("Image #2").setRequired(true),
  );

// images 3-12 facultatives
for (let i = 3; i <= MAX_IMAGES; i++) {
  commandData.addAttachmentOption((o) =>
    o.setName(`image${i}`).setDescription(`Image #${i}`).setRequired(false),
  );
}

// autres options facultatives
commandData
  .addIntegerOption((o) =>
    o.setName("duration").setDescription("Durée par image (1-4 s)").setMinValue(1).setMaxValue(4),
  )
  .addStringOption((o) =>
    o
      .setName("format")
      .setDescription("Format de sortie")
      .addChoices({ name: "GIF", value: "gif" }, { name: "MP4", value: "mp4" }),
  )
  .addStringOption((o) =>
    o.setName("youtube").setDescription("URL YouTube pour la musique (MP4)"),
  )
  .addIntegerOption((o) =>
    o.setName("audio_offset").setDescription("Début musique (s)").setMinValue(0),
  );

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */
const bar = (p: number) =>
  "▮".repeat(Math.round((p / 100) * BAR_LEN)) +
  "▯".repeat(BAR_LEN - Math.round((p / 100) * BAR_LEN));
const cpu = () => os.loadavg()[0].toFixed(2);

const spawnP = (cmd: string, args: string[], onErr?: (s: string) => void) =>
  new Promise<void>((ok, fail) => {
    const p = spawn(cmd, args);
    p.stderr.on("data", (d) => onErr?.(d.toString()));
    p.on("error", fail);
    p.on("close", (c) => (c === 0 ? ok() : fail(new Error(`${cmd} exited ${c}`))));
  });

async function ytDlpTry(url: string, out: string, extractor: string, prog: (p: number) => void) {
  let last = 2; // progression 2-10 %
  const args = [
    "--quiet",
    "--no-playlist",
    "--extractor-args",
    extractor,
    "-f",
    "bestaudio",
    "-o",
    out,
    "-x",
    "--audio-format",
    "m4a",
    url,
  ];
  await spawnP("yt-dlp", args, (l) => {
    const m = /([0-9.]+)%/.exec(l);
    if (m) {
      const pct = 2 + Math.min(8, (parseFloat(m[1]) * 8) / 100); // 2→10%
      if (pct > last) {
        last = pct;
        prog(pct);
      }
    }
  });
}

/* -------------------------------------------------------------------------- */
/* Command class                                                              */
/* -------------------------------------------------------------------------- */
export class animateCommand extends CommandsBase {
  constructor(client: Bot) {
    super(client, commandData.toJSON());
  }

  async run(interaction: CommandInteraction) {
    const o = interaction.options as CommandInteractionOptionResolver;
    const dur = o.getInteger("duration") ?? 2;
    const fmt = (o.getString("format") ?? "gif") as "gif" | "mp4";
    const yt = o.getString("youtube");
    const offset = o.getInteger("audio_offset") ?? 0;

    if (yt && fmt === "gif")
      return interaction.reply("🎵 La musique n’est disponible qu’en MP4.");

    const imgs = Array.from({ length: MAX_IMAGES })
      .map((_, i) => o.getAttachment(`image${i + 1}`))
      .filter(Boolean);
    if (imgs.length < 2)
      return interaction.reply("📷 Il faut au moins 2 images.");

    await interaction.deferReply();
    const upd = (p: number, stage: string) =>
      interaction.editReply(`Progress ${p}%\n\`${bar(p)}\`\n${stage}\nCPU : ${cpu()}`);

    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "ia-anim-"));
    let audioPath = "";

    try {
      /* 1) Téléchargement musique : 2-10 % */
      if (yt) {
        audioPath = path.join(tmp, "audio.m4a");
        upd(1, "Audio : démarrage…");
        try {
          await ytDlpTry(yt, audioPath, "youtube:sabr=yes,player_client=web", (p) => upd(p, "Audio : SABR"));
        } catch {
          await ytDlpTry(yt, audioPath, "youtube:player_client=android_music", (p) => upd(p, "Audio : fallback"));
        }
      }

      /* 2) Normalisation images : 10-30 % */
      let i = 0;
      for (const img of imgs) {
        const r = await fetch((img as any).url);
        const b = Buffer.from(await r.arrayBuffer());
        await sharp(b).png().toFile(path.join(tmp, `f_${i.toString().padStart(3, "0")}.png`));
        i++;
        upd(10 + Math.round((i / imgs.length) * 20), `Images ${i}/${imgs.length}`);
      }

      /* 3) concat list */
      const frames = fs.readdirSync(tmp).filter((f) => f.startsWith("f_"));
      const concatLines = frames.flatMap((f) => [`file '${path.join(tmp, f)}'`, `duration ${dur}`]);
      concatLines.push(`file '${path.join(tmp, frames.at(-1)!) }'`);
      const concatPath = path.join(tmp, "frames.txt");
      fs.writeFileSync(concatPath, concatLines.join("\n"));

      /* 4) Encodage vidéo : 30-90 % */
      const raw = path.join(tmp, `video.${fmt}`);
      const ff = [
        "-y", "-hide_banner", "-loglevel", "error",
        "-f", "concat", "-safe", "0", "-i", concatPath,
        "-vsync", "vfr", "-progress", "pipe:1",
      ];
      if (fmt === "gif")
        ff.push("-pix_fmt", "rgb24", raw);
      else
        ff.push("-r", `${Math.round(30 / dur)}`, "-c:v", "libx264", "-pix_fmt", "yuv420p", "-movflags", "+faststart", raw);

      await new Promise<void>((ok, fail) => {
        const p = spawn("ffmpeg", ff);
        p.stdout.on("data", (d) => {
          const m = /out_time_ms=(\\d+)/.exec(d.toString());
          if (m) {
            const pct = 30 + Math.min(60, Math.round((parseInt(m[1]) / (imgs.length * dur * 1e3)) * 60));
            upd(pct, "Vidéo");
          }
        });
        p.on("error", fail);
        p.on("close", (c) => (c ? fail(new Error("ffmpeg fail")) : ok()));
      });

      /* 5) Fusion audio + vidéo : 90-100 % */
      let fin = raw;
      if (fmt === "mp4" && audioPath) {
        upd(95, "Fusion audio/vidéo…");
        const out = path.join(tmp, "output.mp4");
        const merge = [
          "-y", "-hide_banner", "-loglevel", "error",
          "-i", raw,
          ...(offset > 0 ? ["-ss", `${offset}`] : []),
          "-i", audioPath,
          "-c:v", "copy",
          "-af", "apad",        // ajoute silence si musique plus courte
          "-c:a", "aac",
          "-shortest",          // coupe la vidéo à la fin du diaporama
          out,
        ];
        await execAsync(`ffmpeg ${merge.map((s) => (s.includes(" ") ? `"${s}"` : s)).join(" ")}`);
        fin = out;
      }

      /* 6) Envoi */
      upd(100, "Terminé");
      await interaction.editReply({
        content: "✅ Fini !",
        files: [new AttachmentBuilder(fs.readFileSync(fin), { name: path.basename(fin) })],
      });
    } catch (e: any) {
      await interaction.editReply(`❌ Erreur : ${e.message}`);
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  }
}
