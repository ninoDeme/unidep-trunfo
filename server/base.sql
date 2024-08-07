CREATE TABLE carta (
  id_carta INTEGER PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  super_trunfo INTEGER DEFAULT 0,
  id_modelo INTEGER NOT NULL,
  FOREIGN KEY(modelo) REFERENCES modelo(id)
);

CREATE TABLE carta_atributo (
  id_carta INTEGER PRIMARY KEY,
  id_atributo INTEGER PRIMARY KEY,
  valor DOUBLE NOT NULL,
  a INTEGER DEFAULT 0,
  FOREIGN KEY(id_carta) REFERENCES carta(id)
  FOREIGN KEY(id_atributo) REFERENCES modelo_atributo(id)
);

CREATE TABLE modelo (
  id_modelo INTEGER PRIMARY KEY,
  nome TEXT NOT NULL,
);

CREATE TABLE modelo_atributo (
  id_atributo INTEGER PRIMARY KEY,
  id_modelo NOT NULL,
  ordem INTEGER NOT NULL,
  nome TEXT PRIMARY KEY,
  tipo INTEGER NOT NULL,
  FOREIGN KEY(id_modelo) REFERENCES modelo(id)
)
