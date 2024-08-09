import { FastifyInstance } from "fastify";
import { Modelo, ModeloAtributo } from "trunfo-lib/models/modelo";

async function routes(fastify: FastifyInstance, _options: unknown) {
  fastify.get("/", async (_request, reply) => {
    const modelos = await fastify.db.all<Modelo[]>(`
      SELECT
        m.id_modelo,
        m.nome
      FROM modelo m
    `);

    for (let modelo of modelos) {
      const atributos = await fastify.db.all<ModeloAtributo[]>(
        `
        SELECT
          ma.id_modelo_atributo,
          ma.nome,
          ma.ordem,
          ma.tipo
        FROM modelo_atributo
        WHERE id_modelo = ?
      `,
        [modelo.id_modelo],
      );

      modelo.atributos = atributos.sort((b, a) => b.ordem - a.ordem);
    }
    reply.send(modelos);
  });

  fastify.post("/:modeloId", async (request, reply) => {
    if (typeof request.body !== "object") {
      return reply.status(400).send("Input Inválido");
    }

    let modelo = request.body as Modelo;

    await fastify.db.run(
      `UPDATE OR INSERT INTO modelo (id_modelo, nome) VALUES (?, ?) MATCHING (id_modelo)`,
      [modelo.id_modelo, modelo.nome],
    );

    for (let atributo of modelo.atributos) {
      await fastify.db.run(
        `UPDATE OR INSERT INTO modelo_atributo (id_modelo_atributo, id_modelo, nome, ordem, tipo) VALUES (?, ?, ?, ?, ?) MATCHING (id_modelo_atributo)`,
        [
          atributo.id_modelo_atributo,
          modelo.id_modelo,
          atributo.nome,
          atributo.ordem,
          atributo.tipo,
        ],
      );
    }

    reply.send("ok");
  });
}

export default routes;
