<script setup lang="ts">
import { useModelos } from '@/providers/modelos'
import { gerarIdCarta } from 'trunfo-lib/models/carta'
import { encodeGameString } from 'trunfo-lib/models/jogo'
import type { Modelo } from 'trunfo-lib/models/modelo'
import { computed, ref } from 'vue'

let { modelos, loadingModelos } = useModelos(true)

const modeloSelecionado = ref<Modelo | null>(null)
const nome = ref<string>('')

const salaString = computed(() => {
  if (!modeloSelecionado.value) return null

  if (!nome.value || nome.value.length <= 2) return null
  return encodeGameString({
    sala: gerarIdCarta(),
    id_modelo: modeloSelecionado.value.id_modelo,
    jogador: 0
  })
})
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
      <component
        :is="salaString ? 'router-link' : 'button'"
        :to="`/jogo/${salaString}`"
        :disabled="salaString == null"
        class="rounded border-gray-300 border p-2 text-xl my-8 hover:bg-gray-600"
        >Criar Partida</component
      >
    </div>
  </main>
</template>
