import {
  FastifyInstance,
  FastifyRequest as Request,
  FastifyReply as Response,
} from "fastify";

export default abstract class Route {
  public path: string = "";
  constructor(app: FastifyInstance, path: string = "") {
    this.path = path;
    for (const method of Object.values(RouteMethod)) {
      switch (method) {
        case RouteMethod.Get:
          app.get(path, this.getHandler);
          break;
        case RouteMethod.Post:
          app.post(path, this.postHandler);
          break;
        case RouteMethod.Put:
          app.put(path, this.putHandler);
          break;
        case RouteMethod.Delete:
          app.delete(path, this.deleteHandler);
          break;
        case RouteMethod.Patch:
          app.patch(path, this.patchHandler);
          break;
      }
    }
  }

  getHandler(req: Request, res: Response) {
    res
      .code(405)
      .header("Content-Type", "application/json; charset=utf-8")
      .send({
        error: "Method not allowed",
      });
  }

  postHandler(req: Request, res: Response) {
    res
      .code(405)
      .header("Content-Type", "application/json; charset=utf-8")
      .send({
        error: "Method not allowed",
      });
  }

  putHandler(req: Request, res: Response) {
    res
      .code(405)
      .header("Content-Type", "application/json; charset=utf-8")
      .send({
        error: "Method not allowed",
      });
  }

  deleteHandler(req: Request, res: Response) {
    res
      .code(405)
      .header("Content-Type", "application/json; charset=utf-8")
      .send({
        error: "Method not allowed",
      });
  }

  patchHandler(req: Request, res: Response) {
    res
      .code(405)
      .header("Content-Type", "application/json; charset=utf-8")
      .send({
        error: "Method not allowed",
      });
  }
}

export enum RouteMethod {
  "Get" = "get",
  "Post" = "post",
  "Delete" = "delete",
  "Put" = "put",
  "Patch" = "patch",
}
