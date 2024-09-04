// A Javascript implementaion of the "xor128" prng algorithm by
// George Marsaglia.  See http://www.jstatsoft.org/v08/i14/paper

class XorGen {
  x = 0
  y = 0
  z = 0
  w = 0
  constructor(seed: number, state?: { x: number; y: number; z: number; w: number }) {
    let strseed = ''

    if (seed === (seed | 0)) {
      // Integer seed.
      this.x = seed
    } else {
      // String seed.
      strseed += seed
    }

    // Mix in string seed, then discard an initial batch of 64 values.
    for (let k = 0; k < strseed.length + 64; k++) {
      this.x ^= strseed.charCodeAt(k) | 0
      this.next()
    }

    if (state) {
      this.x = state.x
      this.y = state.y
      this.z = state.z
      this.w = state.w
    }
  }
  next() {
    let t = this.x ^ (this.x << 11)
    this.x = this.y
    this.y = this.z
    this.z = this.w
    return (this.w ^= (this.w >>> 19) ^ t ^ (t >>> 8))
  }
  double() {
    let result: number
    do {
      let top = this.next() >>> 11
      let bot = (this.next() >>> 0) / 0x100000000
      result = (top + bot) / (1 << 21)
    } while (result === 0)
    return result
  }
  float() {
    return (this.next() >>> 0) / 0x100000000
  }
  uint() {
    return this.next() >>> 0
  }
}

const CHARS = 'abcdefghijklmnopqrstuvwxyz'
const CHARS_MAP = new Map([...CHARS].map((c, i) => [c, i]))

function base10Tobase26(input: number) {
  let i = 1
  let acc: string[] = []
  while (input > 0) {
    let n = input % 26 ** i
    input -= n
    n = n / 26 ** (i - 1)
    acc.push(CHARS[n])
    i += 1
  }
  return acc.reverse().join('')
}
function base26Tobase10(input: string) {
  let i = 0
  let acc = 0
  for (let c of [...input].reverse()) {
    let n = CHARS_MAP.get(c)!
    acc += n * 26 ** i
    i += 1
  }
  return acc
}

function decToBin(dec: number) {
  return (dec >>> 0).toString(2)
}

function getMaxBase26(b: number) {
  let max = ''
  for (let i = 0; i < b; i++) {
    max += 'z'
  }
  let max_n = base26Tobase10(max)
  return '1'.repeat(decToBin(max_n).length - 1)
}

function shuffleArray<T>(array: T[], rng?: XorGen): T[] {
  if (!rng) rng = new XorGen(1234)
  for (var i = array.length - 1; i >= 0; i--) {
    var j = Math.floor(rng.uint() % (i + 1))
    var temp = array[i]
    array[i] = array[j]
    array[j] = temp
  }
  return array
}

function genKeyAndMask(len: number, seed: number): [number[], number] {
  const rng = new XorGen(seed)
  const key = shuffleArray(
    new Array(len).fill(null).map((_, i) => i),
    rng
  )
  const bit_mask = parseInt(
    new Array(getMaxBase26(len).length)
      .fill(null)
      .map((_) => rng.uint() % 2)
      .join(''),
    2
  )
  return [key, bit_mask]
}

export function encrypt(input: string, seed: number = 1235) {
  let encrypted = input.substring(0, input.length - 1)
  let checksum = input[input.length - 1]
  let n = base26Tobase10(encrypted)
  let maxBinLen = getMaxBase26(encrypted.length)
  if (n > parseInt(maxBinLen, 2)) throw new Error();

  let [key, bit_mask] = genKeyAndMask(maxBinLen.length, seed + CHARS_MAP.get(checksum)!)
  n = n ^ bit_mask
  let res = ''
  let temp = n.toString(2).padStart(maxBinLen.length, '0')
  for (let i = 0; i < temp.length; i++) {
    res += temp[key[i]]
  }
  return base10Tobase26(parseInt(res, 2)).padStart(encrypted.length, 'a') + checksum
}

export function decrypt(input: string, seed: number = 1235) {
  let encrypted = input.substring(0, input.length - 1)
  let checksum = input[input.length - 1]
  let n = base26Tobase10(encrypted)
  let maxBinLen = getMaxBase26(encrypted.length)
  if (n > parseInt(maxBinLen, 2)) throw new Error();

  let [key, bit_mask] = genKeyAndMask(maxBinLen.length, seed + CHARS_MAP.get(checksum)!)
  let res: string[] = []
  let temp = n.toString(2).padStart(maxBinLen.length, '0')
  for (let i = 0; i < temp.length; i++) {
    res[key[i]] = temp[i]
  }
  let resNumber = parseInt(res.join(''), 2)
  resNumber = resNumber ^ bit_mask
  return base10Tobase26(resNumber).padStart(encrypted.length, 'a') + checksum
}
