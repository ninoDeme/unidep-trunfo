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

function decodeGameString(game: string) {
  let decoded = base64ToBytes(game);
  let values = decoded.split("|");
  return {
    sala: parseInt(values[0]),
    id_modelo: parseInt(values[1]),
    jogador: parseInt(values[2]),
  };
}
