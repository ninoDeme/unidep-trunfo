<script setup lang="ts">
import { useNome } from '@/providers/nome'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

const { nome: nome_salvo, setNome } = useNome()

const nome = ref<string>(nome_salvo.value ?? '')
const codigo = ref<string>('')

const disableSave = computed(() => {
  if (!nome.value || nome.value.length <= 2) return true
  let new_codigo = codigo.value.replace(/[^a-zA-Z]/g, '').toLowerCase()
  if (new_codigo.length !== 6) return true
})

const router = useRouter()

async function savePartida() {
  if (!nome.value || nome.value.length <= 2) return true

  let new_codigo = codigo.value.toLowerCase().replace(/[^a-zA-Z]/g, '').toLowerCase()
  if (new_codigo.length !== 6) return true

  setNome(nome.value)

  router.push('/jogo/' + new_codigo)
}
</script>

<template>
  <main>
    <div class="h-screen w-screen flex flex-col items-center justify-center">
      <div
        class="flex flex-col items-stretch max-w-md w-full gap-2 bg-gray-800 rounded-md p-8 text-center"
      >
        <h1 class="text-4xl mb-6 mt-1 font-medium">Se Juntar</h1>
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
            <label for="nome" class="text-lg">Código da Sala</label>
            <input
              name="codigo"
              type="text"
              maxlength="7"
              required
              v-model.trim="codigo"
              placeholder="xxx-xxx"
              id="codigo"
              class="input-trunfo text-xl w-full"
            />
          </div>
        </div>
        <button
          :disabled="disableSave"
          @click="savePartida()"
          :class="{ 'hover:bg-gray-700': !disableSave }"
          class="text-center mb-2 p-1.5 text-2xl rounded border-gray-100 border"
        >
          Se Juntar a partida
        </button>
      </div>
    </div>
  </main>
</template>
