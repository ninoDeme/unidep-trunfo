import { FastifyInstance } from "fastify";
import { Modelo, ModeloAtributo } from "trunfo-lib/models/modelo";

export async function getAllModelos(fastify: FastifyInstance) {
  const modelos = await fastify.db.all<Modelo[]>(`
      SELECT
        m.id_modelo,
        m.nome,
        m.cor_fundo,
        m.cor_texto,
        m.cor_atributo_fundo,
        m.cor_atributo_texto
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
        FROM modelo_atributo ma
        WHERE id_modelo = ?
      `,
      [modelo.id_modelo],
    );

    modelo.atributos = atributos.sort((b, a) => b.ordem - a.ordem);
  }
  return modelos
}

async function routes(fastify: FastifyInstance, _options: unknown) {
  fastify.get("/", async (_request, reply) => {
    const modelos = await getAllModelos(fastify);
    reply.send(modelos);
  });

  fastify.post("/", async (request, reply) => {
    if (typeof request.body !== "object") {
      return reply.status(400).send("Input Inválido");
    }

    let modelo = request.body as Modelo;

    await fastify.db.run(
      `INSERT OR REPLACE INTO modelo (
        id_modelo,
        nome,
        cor_fundo,
        cor_texto,
        cor_atributo_fundo,
        cor_atributo_texto
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        modelo.id_modelo,
        modelo.nome,
        modelo.cor_fundo,
        modelo.cor_texto,
        modelo.cor_atributo_fundo,
        modelo.cor_atributo_texto,
      ],
    );

    await fastify.db.run(
      `
      DELETE FROM carta_atributo ca
      LEFT JOIN carta c USING(id_carta)
      WHERE c.id_modelo = ? AND ca.id_modelo_atributo not in (${modelo.atributos.map((attr) => attr.id_modelo_atributo).join(`, `)})
    `,
      [
        modelo.id_modelo,
      ],
    );
    await fastify.db.run(
      `DELETE FROM modelo_atributo WHERE id_modelo = ? AND id_modelo_atributo not in (?)`,
      [
        modelo.id_modelo,
        modelo.atributos.map((attr) => attr.id_modelo_atributo),
      ],
    );

    for (let atributo of modelo.atributos) {
      await fastify.db.run(
        `INSERT OR REPLACE INTO modelo_atributo (id_modelo_atributo, id_modelo, nome, ordem, tipo) VALUES (?, ?, ?, ?, ?)`,
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
