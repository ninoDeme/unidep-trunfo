CREATE TABLE modelo (
  id_modelo INTEGER PRIMARY KEY,
  nome TEXT NOT NULL,
  cor_fundo TEXT NOT NULL,
  cor_texto TEXT NOT NULL,
  cor_atributo_fundo TEXT NOT NULL,
  cor_atributo_texto TEXT NOT NULL
);

CREATE TABLE modelo_atributo (
  id_modelo_atributo INTEGER PRIMARY KEY,
  id_modelo NOT NULL,
  ordem INTEGER NOT NULL,
  nome TEXT NOT NULL,
  tipo INTEGER NOT NULL,
  FOREIGN KEY(id_modelo) REFERENCES modelo(id_modelo)
);

CREATE TABLE carta (
  id_carta INTEGER PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  img TEXT NOT NULL,
  super_trunfo INTEGER DEFAULT 0,
  id_modelo INTEGER NOT NULL,
  FOREIGN KEY(id_modelo) REFERENCES modelo(id_modelo)
);

CREATE TABLE carta_atributo (
  id_modelo_atributo INTEGER,
  id_carta INTEGER,
  valor DOUBLE NOT NULL,
  a INTEGER DEFAULT 0,
  FOREIGN KEY(id_carta) REFERENCES carta(id_carta)
  FOREIGN KEY(id_modelo_atributo) REFERENCES modelo_atributo(id_modelo_atributo)
);
