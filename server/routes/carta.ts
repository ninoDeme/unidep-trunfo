import { FastifyInstance } from "fastify";
import { CartaTrunfo, CartaTrunfoAtributo } from "trunfo-lib/models/carta";

async function routes(fastify: FastifyInstance, _options: unknown) {
  fastify.get("/", async (_request, reply) => {
    const cartas = await fastify.db.all<CartaTrunfo[]>(`
        SELECT
          c.id_atributo,
          c.nome,
          c.descricao,
          c.super_trunfo,
          m.id_modelo
        FROM carta c
          JOIN modelo m using(id_modelo)
    `);

    for (let carta of cartas) {
      const atributos = await fastify.db.all<CartaTrunfoAtributo[]>(
        `
        SELECT
          ca.id_atributo,
          ma.nome,
          ma.ordem,
          ca.valor,
          ca.a,
          ma.tipo
        FROM carta_atributo ca
          JOIN modelo_atributo ma using(id_atributo)
        WHERE id_carta = ?
      `,
        [carta.id_carta],
      );

      for (let atributo of atributos) {
        atributo.a = !!atributo.a;
      }

      carta.atributos = atributos.sort((b, a) => b.ordem - a.ordem);
      carta.super_trunfo = !!carta.super_trunfo;
    }
    reply.send(cartas);
  });
}

export default routes;
