<script setup lang="ts">
import { useModelos } from '@/providers/modelos'
import { useNome } from '@/providers/nome'
import type { Modelo } from 'trunfo-lib/models/modelo'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

let { modelos, loadingModelos } = useModelos(true)

const modeloSelecionado = ref<Modelo | null>(null)

const { nome: nome_salvo, setNome } = useNome()

const nome = ref<string>(nome_salvo.value ?? '')

const disabelSave = computed(() => {
  if (!nome.value || nome.value.length <= 2) return true
  if (!modeloSelecionado.value) return true
})

const router = useRouter()

async function criarSala(id_modelo: number) {
  return await fetch('/api/jogo/create_sala', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ id_modelo })
  }).then((r) => {
    if (!r.ok) throw new Error('Não foi possível criar a sala')
    return r.json()
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
    <div class="h-screen w-screen flex flex-col items-center justify-center gap-3">
      <h1 class="text-2xl mb-6 font-medium text-center">Selecione o baralho que vai ser usado</h1>
      <div class="flex flex-col items-stretch justify-center gap-4">
        <div class="flex flex-col items-start">
          <label for="nome" class="text-lg">Seu nome</label>
          <input
            name="nome"
            type="text"
            required
            v-model.trim="nome"
            id="nome"
            class="input-trunfo text-xl"
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
        :disabled="disabelSave"
        @click="savePartida()"
        class="rounded border-gray-300 border p-2 text-xl my-8 hover:bg-gray-600"
      >
        Criar Partida
      </button>
    </div>
  </main>
</template>
