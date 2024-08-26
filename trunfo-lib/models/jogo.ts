function base64ToBytes(base64: string) {
  const binString = atob(base64);
  return new TextDecoder().decode(
    Uint8Array.from(binString, (m) => m.codePointAt(0)!),
  );
}

function bytesToBase64(input: string) {
  const bytes = new TextEncoder().encode(input);
  const binString = Array.from(bytes, (byte) =>
    String.fromCodePoint(byte),
  ).join("");
  return btoa(binString);
}

export function decodeGameString(game: string) {
  console.log(game)
  let decoded = base64ToBytes(game);
  let values = decoded.split("|");
  console.log(values)
  return {
    sala: parseInt(values[0]),
    id_modelo: parseInt(values[1]),
    jogador: parseInt(values[2]) as 0 | 1,
  };
}

export function encodeGameString(params: {
  sala: number,
  id_modelo: number,
  jogador: 0 | 1
}) {
  let { sala, id_modelo, jogador } = params;
  let encoded = bytesToBase64([sala, id_modelo, jogador].join('|'));
  return encoded;
}
