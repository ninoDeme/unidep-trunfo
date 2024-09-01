<script setup lang="ts">
import { useNome } from '@/providers/nome'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

const { nome: nome_salvo, setNome } = useNome()

const nome = ref<string>(nome_salvo.value ?? '')
const codigo = ref<string>('')

const disabelSave = computed(() => {
  if (!nome.value || nome.value.length <= 2) return true
  let new_codigo = codigo.value.replace(/[^a-z]/g, '').toLowerCase();
  if (new_codigo.length !== 6) return true
})

const router = useRouter()

async function savePartida() {
  if (!nome.value || nome.value.length <= 2) return true

  let new_codigo = codigo.value.replace(/[^a-z]/g, '').toLowerCase();
  if (new_codigo.length !== 6) return true

  setNome(nome.value)

  router.push('/jogo/' + new_codigo)
}
</script>

<template>
  <main>
    <div class="h-screen w-screen flex flex-col items-center justify-center gap-3">
      <h1 class="text-2xl mb-6 font-medium text-center">Se juntar a uma partida</h1>
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
          <label for="nome" class="text-lg">Código da Sala</label>
          <input
            name="codigo"
            type="text"
            maxlength="7"
            required
            v-model.trim="codigo"
            id="codigo"
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
