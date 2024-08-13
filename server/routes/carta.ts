import { FastifyInstance } from "fastify";
import { CartaTrunfo, CartaTrunfoAtributo } from "trunfo-lib/models/carta";
import { pipeline } from "stream/promises";
import util from "util";
import fs from "fs";
import { Stream } from "stream";

const pump: any = util.promisify(pipeline);

let CWebp = require("cwebp").CWebp;

async function routes(fastify: FastifyInstance, _options: unknown) {
  fastify.get("/", async (_request, reply) => {
    const cartas = await fastify.db.all<CartaTrunfo[]>(`
        SELECT
          c.id_carta,
          c.nome,
          c.descricao,
          c.super_trunfo,
          c.id_modelo
        FROM carta c
    `);

    for (let carta of cartas) {
      const atributos = await fastify.db.all<CartaTrunfoAtributo[]>(
        `
        SELECT
          ca.id_modelo_atributo,
          ma.nome,
          ma.ordem,
          ca.valor,
          ca.a,
          ma.tipo
        FROM carta_atributo ca
          JOIN modelo_atributo ma using(id_modelo_atributo)
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

  fastify.post("/", async (request, reply) => {
    if (typeof request.body !== "object") {
      return reply.status(400).send("Input Inválido");
    }

    let carta = request.body as CartaTrunfo;

    await fastify.db.run(
      `INSERT OR REPLACE INTO carta (
        id_modelo,
        nome,
        descricao,
        super_trunfo,
        id_modelo
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        carta.id_carta,
        carta.nome,
        carta.descricao,
        carta.super_trunfo,
        carta.id_modelo,
      ],
    );

    for (let atributo of carta.atributos) {
      await fastify.db.run(
        `INSERT OR REPLACE INTO carta_atributo (id_modelo_atributo, id_carta, valor, a) VALUES (?, ?, ?, ?)`,
        [
          atributo.id_modelo_atributo,
          carta.id_carta,
          atributo.valor,
          atributo.a ? 1 : 0,
        ],
      );
    }

    reply.send("ok");
  });

  fastify.post<{
    Params: {
      id_carta: string;
    };
  }>(
    "/:id_carta",
    async (request, reply) => {
      const data = request.parts();
      let encoder = null;
      for await (const part of data) {
        if (part.fieldname === "img" && part.type === "file") {
          encoder = new CWebp(await part.toBuffer())
            .quality(80)
            .write(`./upload/cartas/carta-${request.params.id_carta}.webp`);
        } else if (part.fieldname === "carta" && part.type === "field") {
          let carta = JSON.parse(part.value as string) as CartaTrunfo;

          await fastify.db.run(
            `INSERT OR REPLACE INTO carta (
           id_modelo,
           nome,
           descricao,
           super_trunfo,
           id_modelo
          ) VALUES (?, ?, ?, ?, ?, ?)`,
            [
              carta.id_carta,
              carta.nome,
              carta.descricao,
              carta.super_trunfo,
              carta.id_modelo,
            ],
          );

          for (let atributo of carta.atributos) {
            await fastify.db.run(
              `INSERT OR REPLACE INTO carta_atributo (id_modelo_atributo, id_carta, valor, a) VALUES (?, ?, ?, ?)`,
              [
                atributo.id_modelo_atributo,
                carta.id_carta,
                atributo.valor,
                atributo.a ? 1 : 0,
              ],
            );
          }
        }
      }
      await encoder;
      reply.send("ok");
    },
  );
}

export default routes;
