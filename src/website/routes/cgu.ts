import { Express, Request, Response } from "express";
import Route, { RouteMethod } from "./route.schema";

export class Cgu extends Route {
    path = "/cgu";
    methods = [RouteMethod.Get];
    constructor(app: Express) { 
        super(app);
    }
}