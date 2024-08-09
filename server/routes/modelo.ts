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
    console.log(request.body);
    throw new Error();
  })
}

export default routes;
