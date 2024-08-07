import Fastify from "fastify";
import fastifySqlite from "fastify-sqlite-typed";
import fs_promises from "fs/promises";
import carta_routes from "./routes/carta";

(async () => {
  const app = Fastify({
    logger: true,
  });

  const schema = fs_promises.readFile("./base.sql", "utf8");

  app.register(fastifySqlite, {
    dbFilename: ":memory:",
    driverSettings: {
      verbose: true,
    },
  });

  app.db.exec(await schema);

  app.get("/version", function (request, reply) {
    reply.send("0.0.1");
  });

  app.register(carta_routes);

  app.listen({ port: 3000 }, function (err, address) {
    if (err) {
      app.log.error(err);
      process.exit(1);
    } else {
      console.log(`Server listening on ${app.server.address()}`);
    }
  });
})();
