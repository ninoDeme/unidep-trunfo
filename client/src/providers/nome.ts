import { onMounted, ref } from 'vue'

const nome = ref<string | null>(null)
let inited = false

function getNome(): string | null {
  inited = true
  nome.value = localStorage.getItem('nome')
  return nome.value
}

function setNome(value: string) {
  localStorage.setItem('nome', value)
  nome.value = value
}

export function useNome() {
  onMounted(() => {
    if (inited === false) {
      getNome()
    }
  })
  return { nome, getNome, setNome }
}
