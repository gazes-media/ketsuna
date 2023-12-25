import { FastifyInstance } from "fastify";
import os from "os";
import * as routes from "./routes";
import next from "next";
import { parse } from 'url';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();
class Website {
    constructor(private app: FastifyInstance) { }

    public init() {
        app.prepare().then(() => {
            this.loadRoutes();
            this.app.get("/api", (req, res) => {
                let perfs = process.memoryUsage();
                const formatMemoryUsage = (data: number) => `${Math.round(data / 1024 / 1024 * 100) / 100} MB`;
                const osPerfs = {
                    totalMem: formatMemoryUsage(os.totalmem()),
                    freeMem: formatMemoryUsage(os.freemem()),
                    usedMem: formatMemoryUsage(os.totalmem() - os.freemem()),
                    cpus: os.cpus()
                };
                res
                    .code(200)
                    .header('Content-Type', 'application/json; charset=utf-8')
                    .send({
                        status: "ok",
                        currentProcess: {
                            rss: formatMemoryUsage(perfs.rss),
                            heapTotal: formatMemoryUsage(perfs.heapTotal),
                            heapUsed: formatMemoryUsage(perfs.heapUsed),
                            external: formatMemoryUsage(perfs.external),
                            arrayBuffers: perfs.arrayBuffers
                        },
                        osPerfs: osPerfs
                    });
            });

            this.app.get("/api/ping", (req, res) => {
                res.status(200).header('Content-Type', 'application/json; charset=utf-8').send({ status: "ok" });
            });

            this.app.get('*', (req, res) => {
                const parsedUrl = parse(req.url, true);
                handle(req.raw, res.raw, parsedUrl);
            });
            this.app.listen({
                host: "0.0.0.0",
                port: Number(process.env.PORT || 3000)
            }, (err, address) => {
                if (err) {
                    console.error(err);
                    process.exit(1);
                }
                console.log(`Listening on port ${address}`);
            });
        });
    }

    public async loadRoutes() {
        for (const route of Object.values(routes)) {
            let routeInstance = new route(this.app);
            console.log(`Registering route ${routeInstance.path}`);
        }
    }
}

export default Website;