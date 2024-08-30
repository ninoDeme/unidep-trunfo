import { ref } from 'vue'

export function getPartidaString<T>(endpoint: string) {
  const loading = ref<boolean>(false)
  const error = ref<string | null>(null)
  const result = ref<T | null>(null);

  async function getCartas() {
    try {
      result.value = null
      loading.value = true
      error.value = null;
      result.value = await fetch(endpoint).then((res) => res.json())

      return result.value
    } catch (e) {
      if (e instanceof Error) {
        error.value = e.message
      } else {
        error.value = 'Ocoreu um erro, tente novamente mais tarde'
      }
      throw e
    } finally {
      loading.value = false
    }
  }
  return { result, loadingCartas: loading, errorCartas: error, getCartas }
}
