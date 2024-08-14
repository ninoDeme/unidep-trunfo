import { FastifyInstance } from "fastify";
import { CartaTrunfo, CartaTrunfoAtributo } from "trunfo-lib/models/carta";
import { pipeline } from "stream/promises";
import cp from "child_process";
import fs from "fs/promises";
import path from "path";

export async function limpaImagens(fastify: FastifyInstance) {
  const contents = await fs.readdir(path.join("uploads", "carta"));
  if (!contents.length) return;

  const cartas = await fastify.db.all<{ id_carta: string }[]>(`
        SELECT
          id_carta
        FROM carta
    `);

  for (let file of contents) {
    let id_carta_aquivo = /carta-(\d+).webp$/.exec(file)?.[1];
    if (!id_carta_aquivo) continue;

    if (!cartas.some((c) => c.id_carta == id_carta_aquivo)) {
      fs.unlink(path.join("uploads", "carta", file));
    }
  }
}

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

  async function insertCarta(carta: CartaTrunfo) {
    await fastify.db.run(
      `
            INSERT OR REPLACE INTO carta (
              id_carta,
              nome,
              descricao,
              super_trunfo,
              id_modelo
            ) VALUES (?, ?, ?, ?, ?)`,
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

  fastify.get("/limpar", async (request, reply) => {
    await limpaImagens(fastify);
    reply.send("ok");
  });

  fastify.post("/", async (request, reply) => {
    if (typeof request.body !== "object") {
      return reply.status(400).send("Input Inválido");
    }

    let carta = request.body as CartaTrunfo;

    insertCarta(carta);

    reply.send("ok");
  });

  fastify.post<{
    Params: {
      id_carta: string;
    };
  }>("/:id_carta", async (request, reply) => {
    const data = request.parts();
    for await (const part of data) {
      if (part.fieldname === "img" && part.type === "file") {
        let p = cp.execFile("cwebp", [
          "-q",
          "80",
          "-resize",
          "1000",
          "0",
          "-o",
          `./uploads/carta/carta-${request.params.id_carta}.webp`,
          "--",
          "-",
        ]);
        await pipeline(part.file, p.stdin!);
      } else if (part.fieldname === "carta" && part.type === "field") {
        let carta = JSON.parse(part.value as string) as CartaTrunfo;
        insertCarta(carta);
      }
    }
    reply.send("ok");
  });
}

export default routes;
