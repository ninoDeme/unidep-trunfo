import type { CartaTrunfo } from 'trunfo-lib/models/carta'
import { onMounted, ref } from 'vue'

const cartas = ref<Map<number, CartaTrunfo> | null>(null)
const loadingCartas = ref<boolean>(false)
const errorCartas = ref<string | null>(null)

async function getCartas() {
  try {
    cartas.value = null
    loadingCartas.value = true
    let res: CartaTrunfo[] = await fetch('/api/carta').then((res) => res.json())

    cartas.value = new Map(res.map((m) => [m.id_carta, m]))

    return cartas.value
  } catch (e) {
    if (e instanceof Error) {
      errorCartas.value = e.message
    } else {
      errorCartas.value = 'Ocoreu um erro, tente novamente mais tarde'
    }
    throw e
  } finally {
    loadingCartas.value = false
  }
}

export function useCartas(searchOnError?: boolean) {
  onMounted(() => {
    if (cartas.value == null && !loadingCartas.value && (searchOnError || !errorCartas.value)) {
      getCartas();
    }
  })
  return { cartas, loadingCartas, errorCartas, getCartas }
}
