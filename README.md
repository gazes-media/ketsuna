<h1 align="center">Ketsuna • Morgane AI</h1>

<p align="center">
Back-end <strong>Fastify/Prisma</strong>, Front-end <strong>Next.js</strong>, Bot <strong>Discord.js</strong>.<br>
AI assistant full-stack clés en main.
</p>

<p align="center">
<a href="https://nodejs.org"><img alt="Node >=20" src="https://img.shields.io/badge/node-%E2%89%A520-339933?logo=node.js&logoColor=white"></a>
<a href="https://pnpm.io"><img alt="PNPM >=8"  src="https://img.shields.io/badge/pnpm-%E2%89%A58-F69220?logo=pnpm"></a>
<a href="https://www.prisma.io/"><img alt="Prisma" src="https://img.shields.io/badge/Prisma-ORM-2D3748"></a>
<a href="./LICENSE"><img alt="MIT"   src="https://img.shields.io/github/license/celesteoffi/ketsuna-Morgane-ai"></a>
</p>

---

## Sommaire
- [Fonctionnalités](#fonctionnalités)
- [Liens rapides](#liens-rapides)
- [Prérequis](#prérequis)
- [Installation Ubuntu / Debian](#installation-ubuntudebian)
- [Variables d’environnement](#variables-denvironnement)
- [Commandes Discord](#commandes-discord)
- [Routes Web](#routes-web)
- [Mise à jour](#mise-à-jour)
- [Contributors](#contributors)
- [Licence](#licence)

---

## Fonctionnalités

| Module | ✅ |
|--------|:--:|
| API REST (Fastify + SWC) | ✓ |
| Bot Discord (discord.js v14) | ✓ |
| Front-end React / Next 14 | ✓ |
| Sharding, PM2, Prisma ORM | ✓ |
| Génération img/texte (StableHorde) | ✓ |

---

## Liens rapides

| | |
|---|---|
| **Support Discord** | <https://discord.gg/2U6Q9aKHSE> |
| **Top.gg** | <https://top.gg/bot/1190014646351036577> |
| **Inviter le bot** | <https://discord.com/oauth2/authorize?client_id=1190014646351036577&permissions=551903627328&scope=bot> |

---

## Prérequis

* Ubuntu 22.04 LTS / Debian 12
* **Node.js ≥ 20**
* **PNPM ≥ 8** et **PM2** (gestionnaire de processus)
* **ffmpeg** + **yt-dlp** (audio/vidéo)
* Build tools (`# apt install build-essential libvips-dev`)

---

## Commandes Discord

- `/ia imagine <prompt>`	Image IA
- `/ia animate`	Diaporama + musique YouTube
- `/ia ask`	Réponse texte
- `/ia login / logout`	Lier compte StableHorde
- `/ia give`	Donner des kudos
- `/ia config`	Préférences
- `/ia help`	Aide détaillée

## Routes Web

- /	Accueil
- /cgu	Conditions d’utilisation
- /privacy	Politique confidentialité

## Installation Ubuntu/Debian

```bash
# 1. Base system
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git build-essential libvips-dev ffmpeg

# 2. Node 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 3. PNPM & PM2
npm install -g pnpm pm2

# 4. yt-dlp (stand-alone)
sudo curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp \
     -o /usr/local/bin/yt-dlp && sudo chmod +x /usr/local/bin/yt-dlp

# 5. Cloner le dépôt
git clone https://github.com/celesteoffi/ketsuna-Morgane-ai.git
cd ketsuna-Morgane-ai

# 6. Dépendances projet
pnpm install

# 7. Variables d’env.
cp .env.example .env && nano .env   # → remplissez vos tokens
# (optionnel) SWC :
cp .swcrc.example .swcrc

# 8. Base de données
pnpm migrate          # crée les tables (SQLite par défaut)

# 9. Build & start
pnpm build
pm2 start "pnpm start" --name ketsuna

# 10. (sharding Discord, si besoin)
pm2 start "node dist/shard.js" --name ketsuna-sharder

# Démarrage au boot
pm2 save && pm2 startup
```
---

## Variables d’environnement

```
PORT=3000

# Discord
DISCORD_TOKEN=xxxxxxxxxxxxxxxx
DISCORD_STATUS_NAME=Morgane AI
DISCORD_STATUS_STATE=Serving the multiverse
SERVERS_PER_SHARD=150
OWNER_ID=123456789012345678
```
Copiez .env.example, collez vos valeurs.

---

## mise à jour

```bash
git pull
pnpm install
pnpm migrate         
pnpm build
pm2 restart ketsuna
```

## Contributors

- [garder500](https://github.com/garder500) - creator and maintainer
- [trail-l31](https://github.com/trail-l31) - contributor
- [celesteoffi](https://github.com/celesteoffi) - Keeps the script working


## License

This project is licensed under the [MIT License](https://opensource.org/license/mit/)

```
MIT License
-----------
© 2023 Jeremy S.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

```
