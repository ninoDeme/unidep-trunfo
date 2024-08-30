<script setup lang="ts">
import { useNome } from '@/providers/nome'
import { encodeGameString } from 'trunfo-lib/models/jogo'
import type { Modelo } from 'trunfo-lib/models/modelo'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

const modeloSelecionado = ref<Modelo | null>(null)

const { nome: nome_salvo, setNome } = useNome()

const nome = ref<string>(nome_salvo.value ?? '')
const codigo = ref<string>('');

const disabelSave = computed(() => {
  if (!nome.value || nome.value.length <= 2) return true
  if (codigo.value.length !== 7) return true
})


const router = useRouter()

async function criarSala() {
  return parseInt(await fetch('/api/jogo/get_id').then(r => r.text()));
}

async function savePartida() {
  if (!modeloSelecionado.value) return null

  if (!nome.value || nome.value.length <= 2) return null

  setNome(nome.value)

  let salaString = encodeGameString({
    sala: await criarSala(),
    id_modelo: modeloSelecionado.value.id_modelo,
    jogador: 0
  })

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
      </div>
      <button
        :disabled="disabelSave"
        @click="savePartida()"
        class="rounded border-gray-300 border p-2 text-xl my-8 hover:bg-gray-600"
      >
        Se Juntar a partida
      </button>
    </div>
  </main>
</template>
