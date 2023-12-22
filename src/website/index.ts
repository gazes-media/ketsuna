import { Express } from "express";
import os from "os";
import * as routes from "./routes";
class Website {
    constructor(private app: Express) { }

    public init() {
        this.app.get("/", (req, res) => {
            let perfs = process.memoryUsage();
            const formatMemoryUsage = (data: number) => `${Math.round(data / 1024 / 1024 * 100) / 100} MB`;
            const osPerfs = {
                totalMem: formatMemoryUsage(os.totalmem()),
                freeMem: formatMemoryUsage(os.freemem()),
                usedMem: formatMemoryUsage(os.totalmem() - os.freemem()),
                cpus: os.cpus()
            };
            res.json({
                status: "ok",
                currentProcess: {
                    rss: formatMemoryUsage(perfs.rss),
                    heapTotal: formatMemoryUsage(perfs.heapTotal),
                    heapUsed: formatMemoryUsage(perfs.heapUsed),
                    external: formatMemoryUsage(perfs.external),
                    arrayBuffers: perfs.arrayBuffers
                },
                osPerfs: {
                    totalMem: formatMemoryUsage(perfs.rss),
                    freeMem: formatMemoryUsage(perfs.heapTotal),
                    usedMem: formatMemoryUsage(perfs.heapUsed),
                    cpus: osPerfs
                }
            });
        });

        this.app.get("/ping", (req, res) => {
            res.json({ status: "ok" });
        });
        this.app.listen(process.env.PORT || 3000, () => console.log(`Listening on port localhost:${process.env.PORT || 3000}`));
    }

    public async loadRoutes() {
        for (const route of Object.values(routes)) {
            let routeInstance = new route(this.app);
            console.log(`Registering route ${routeInstance.path}`);
        }
    }
}

export default Website;