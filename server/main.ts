import Fastify from "fastify";
import fastifySqlite from "fastify-sqlite-typed";
import fs_promises from "fs/promises";
import carta_routes from "./routes/carta";
import modelo_routes from "./routes/modelo";
import fastifyMultipart from "@fastify/multipart";

(async () => {
  const app = Fastify({
    logger: true,
  });

  const schema = fs_promises.readFile("./base.sql", "utf8");

  await app.register(fastifyMultipart, {
    logLevel: 'info'
  })

  await app.register(fastifySqlite, {
    dbFilename: "testes.db",
    driverSettings: {
      verbose: true,
    },
  });

  // app.db.exec(await schema);

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
