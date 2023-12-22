import { Express, Response, Request } from "express";
import Route, { RouteMethod } from "../route.schema";
import discordInteractions from "discord-interactions";

export class InteractionCallback extends Route{
    path = "/callback/interaction";
    methods = [RouteMethod.Post]
    constructor(app: Express) {
        super(app);
    }

    postHandler(req: Request, res: Response): void {
        // check if Public Key is set
        let PUBLIC_KEY = process.env.PUBLIC_KEY;
        if (!PUBLIC_KEY) {
            console.error("No public key set!");
            res.status(500).json({ error: "No public key set!" });
            return;
        }   
        // verify if the request is from Discord
        // First check validity of headers sent by Discord
        let signature = req.headers["x-signature-ed25519"];
        let timestamp = req.headers["x-signature-timestamp"];
        if(!signature || !timestamp){
            console.error("No signature or timestamp in headers");
            res.status(401).json({ error: "No signature or timestamp in headers" });
            return;
        }

        // check if signature and timestamp are string and not array 
        if(Array.isArray(signature) || Array.isArray(timestamp)){
            console.error("Signature or timestamp are arrays");
            res.status(401).json({ error: "Signature or timestamp are arrays" });
            return;
        }

        let verify = discordInteractions.verifyKey(req.body, PUBLIC_KEY, signature, timestamp);
        if(!verify){
            console.error("Invalid request signature");
            res.status(401).json({ error: "Invalid request signature" });
            return;
        }
        try{
            let body = JSON.parse(req.body);
            res.json({
            message: "Hello World!"
            });
        }catch(e){
            console.error("Invalid body");
            res.status(400).json({ error: "Invalid body" });
            return;
        }
        
    }
}