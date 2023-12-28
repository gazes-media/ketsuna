# Ketsuna (Back/Front)

This is the full back-end and front-end of Ketsuna. It is a REST API built with [Node.js](https://nodejs.org/en/) and [Fastify](https://www.fastify.io/). It also contains a [Discord bot](https://discord.com/developers/docs/intro) that is used to communicate with the Discord API.
The Front-end is built with [React](https://reactjs.org/) and [Next.js](https://nextjs.org/).

## Features

- [x] Discord bot
- [x] REST API
- [x] Front-end
- [ ] Database
- [ ] Docker support

## Requirements

- [Node.js](https://nodejs.org/en/) (v20.0.0 or higher)
- [Prisma](https://www.prisma.io/) (v3.0.0 or higher)
- [PNPM](https://pnpm.io/) (v6.0.0 or higher)

## Installation

1. Clone the repository
2. Install the dependencies with `pnpm install`
3. Create a `.env` file in the root directory and fill it with the following variables:
    
    ```env
    # The port the server will listen on
    PORT=3000
    # The Discord bot token
    DISCORD_TOKEN=
    # The Discord bot client public key
    DISCORD_PUBLIC_KEY=
    # Config the Discord Status
    DISCORD_STATUS_NAME=The best Bot ever
    DISCORD_STATUS_STATE=The Best AI Bot
    # The AI Horde API key
    AI_HORDE_KEY=
    ```
4. Run the database migrations with `pnpm migrate` (this will create the database tables)
5. Build the project with `pnpm build`
6. Run the project with `pnpm start` or `node dist/main.js`

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
