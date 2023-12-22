import { Express, Request, Response } from "express";

export default abstract class Route {
    abstract path: string;
    abstract methods: RouteMethod[];
    constructor(app: Express) { 
        this.registerRoute(app);
    }

    protected registerRoute(app: Express): void {
        // for each handler in the route, register the route
        for (const method of this.methods) {
            switch (method) {
                case RouteMethod.Get:
                    app.get(this.path, this.getHandler);
                    break;
                case RouteMethod.Post:
                    app.post(this.path, this.postHandler);
                    break;
                case RouteMethod.Put:
                    app.put(this.path, this.putHandler);
                    break;
                case RouteMethod.Delete:
                    app.delete(this.path, this.deleteHandler);
                    break;
                case RouteMethod.Patch:
                    app.patch(this.path, this.patchHandler);
                    break;
            }
        }

    }

    getHandler(req: Request, res: Response){
        res.json({
            error:"Not implemented"
        });
    }

    postHandler(req: Request, res: Response){
        res.json({
            error:"Not implemented"
        });
    }

    putHandler(req: Request, res: Response){
        res.json({
            error:"Not implemented"
        });
    }

    deleteHandler(req: Request, res: Response){
        res.json({
            error:"Not implemented"
        });
    }

    patchHandler(req: Request, res: Response){
        res.json({
            error:"Not implemented"
        });
    }
}

export enum RouteMethod {
    "Get" = "get",
    "Post" = "post",
    "Delete" = "delete",
    "Put" = "put",
    "Patch" = "patch"
}