import Fastify from "fastify";
import fastifySqlite from "fastify-sqlite-typed";
import fs_promises from "fs/promises";
import carta_routes from "./routes/carta";
import modelo_routes from "./routes/modelo";
import fastifyMultipart from "@fastify/multipart";
import fastifyStatic from "@fastify/static";
import path from "path";
import { existsSync } from "fs";
import { env } from "process";

(async () => {
  const app = Fastify({
    logger: {
      transport: {
        target: "@fastify/one-line-logger",
      },
    },
  });


  let schema: Promise<string> | null = null

  if (!existsSync("./testes.db")) {
    schema = fs_promises.readFile("./base.sql", "utf8");
  }

  await app.register(fastifyMultipart, {
    logLevel: "info",
    limits: {
      fileSize: 100000000,
    },
  });

  await app.register(fastifySqlite, {
    dbFilename: "testes.db",
    driverSettings: {
      verbose: true,
    },
  });

  if (schema) {
    app.db.exec(await schema);
  }

  await app.register(fastifyStatic, {
    root: path.join(__dirname, "uploads"),
    prefix: "/uploads/",
    decorateReply: true,
  });

  app.get("/api/version", function (request, reply) {
    reply.send("0.0.1");
  });

  app.register(carta_routes, { prefix: "/api/carta" });
  app.register(modelo_routes, { prefix: "/api/modelo" });

  app.listen({ port: 3000 }, async function (err, address) {
    if (err) {
      app.log.error(err);
      process.exit(1);
    } else {
    }
  });
})();
