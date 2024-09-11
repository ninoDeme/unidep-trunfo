<script setup lang="ts">
import { useModelos } from '@/providers/modelos'
import { useNome } from '@/providers/nome'
import type { Modelo } from 'trunfo-lib/models/modelo'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue3-toastify'

let { modelos, loadingModelos } = useModelos(true)

const modeloSelecionado = ref<Modelo | null>(null)

const { nome: nome_salvo, setNome } = useNome()

const nome = ref<string>(nome_salvo.value ?? '')

const disableSave = computed(() => {
  if (!nome.value || nome.value.length <= 2) return true
  if (!modeloSelecionado.value) return true
})

const router = useRouter()

async function criarSala(id_modelo: number) {
  return await fetch('/api/jogo/create_sala', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ id_modelo })
  })
    .then((r) => {
      if (!r.ok) throw new Error('Não foi possível criar a sala')
      return r.json()
    })
    .catch((e) => {
      toast(e.message, {
        theme: 'colored',
        type: 'error',
        position: 'bottom-center',
        transition: 'slide'
      })
      console.error(e)
    })
}

async function savePartida() {
  if (!modeloSelecionado.value) return null

  if (!nome.value || nome.value.length <= 2) return null

  setNome(nome.value)

  let salaString = await criarSala(modeloSelecionado.value.id_modelo).then((v) => v[0])

  router.push('/jogo/' + salaString)
}
</script>

<template>
  <main>
    <div class="h-screen w-screen flex flex-col items-center justify-center">
      <div
        class="flex flex-col items-stretch max-w-md w-full gap-2 bg-gray-800 rounded-md p-8 text-center"
      >
        <h1 class="text-4xl mb-6 mt-1 font-medium">Criar Partida</h1>
        <div class="flex flex-col items-stretch justify-center gap-4 mb-4">
          <div class="flex flex-col items-start">
            <label for="nome" class="text-lg">Seu nome</label>
            <input
              name="nome"
              type="text"
              required
              v-model.trim="nome"
              id="nome"
              class="input-trunfo text-xl w-full"
            />
          </div>
          <div class="flex flex-col items-start">
            <label for="modelo" class="text-lg">Baralho</label>
            <select v-model="modeloSelecionado" class="input-trunfo text-xl p-1 w-full" id="modelo">
              <option v-if="loadingModelos" disabled>Carregando...</option>
              <option v-for="[id_modelo, modelo] of modelos" :value="modelo">
                {{ modelo.nome }}
              </option>
            </select>
          </div>
        </div>
        <button
          :disabled="disableSave"
          @click="savePartida()"
          :class="{ 'hover:bg-gray-700': !disableSave }"
          class="hover:bg-gray-300 text-center mb-2 p-1.5 text-2xl rounded bg-gray-100 text-gray-900"
        >
          Criar Partida
        </button>
      </div>
    </div>
  </main>
</template>
