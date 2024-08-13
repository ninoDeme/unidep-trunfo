import type { Modelo } from 'trunfo-lib/models/modelo'
import { onMounted, ref } from 'vue'

const modelos = ref<Map<number, Modelo> | null>(null)
const loadingModelos = ref<boolean>(false)
const errorModelos = ref<string | null>(null)

async function getModelos() {
  try {
    modelos.value = null
    loadingModelos.value = true
    let res: Modelo[] = await fetch('/api/modelo').then((res) => res.json())

    modelos.value = new Map(res.map((m) => [m.id_modelo, m]))

    return modelos.value
  } catch (e) {
    if (e instanceof Error) {
      errorModelos.value = e.message
    } else {
      errorModelos.value = 'Ocoreu um erro, tente novamente mais tarde'
    }
    throw e
  } finally {
    loadingModelos.value = false
  }
}

export function useModelos(searchOnError?: boolean) {
  onMounted(() => {
    if (modelos.value == null && !loadingModelos.value && (searchOnError || !errorModelos.value)) {
      getModelos();
    }
  })
  return { modelos, loadingModelos, errorModelos, getModelos }
}
