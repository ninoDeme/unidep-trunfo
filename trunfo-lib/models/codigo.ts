const CHARS = "abcdefghijklmnopqrstuvwxyz";
const CHARS_MAP = new Map([...CHARS].map((c, i) => [c, i]));

export function generateTable(n: number, arr = [""]): string[] {
  let res = []
  for (let el of arr) {
    let temp = [];
    for (let c of CHARS) {
      temp.push(el + c);
    }
    if (n > 1) {
      res.push(...generateTable(n - 1, temp));
    } else {
      res.push(...temp);
    }
  }
  return res
}

function rand_max(max: number) {
  return Math.min(Math.floor(Math.random() * max), max - 1);
}

export function generateCodigo(length: number) {
  let res = "";
  for (let i = 0; i < length; i++) {
    res += CHARS[rand_max(CHARS.length)];
  }
  return res;
}

export function generateLast(code: string, player: 0 | 1) {
  let n = (generateCheckSum(code) + 1) * 2 - 1;
  if (player) {
    n -= 1;
  }
  return CHARS[n];
}

const MAX = Math.floor(CHARS.length / 2);

export function generateCheckSum(code: string) {
  let code_arr = [...code];
  return code_arr.reduce((prev, next) => prev + CHARS_MAP.get(next)!, 0) % MAX;
}
