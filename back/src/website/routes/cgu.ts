import { FastifyInstance } from "fastify";
import Route from "./route.schema";

export class Cgu extends Route {
    constructor(app: FastifyInstance) {
        super(app, "/cgu");
    }
}