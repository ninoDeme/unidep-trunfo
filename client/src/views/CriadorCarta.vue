<script setup lang="ts">
import Carta from '@/components/Carta.vue'
import { useModelos } from '@/providers/modelos'
import { type Modelo } from 'trunfo-lib/models/modelo'
import { computed, ref } from 'vue'
import CriadorToolbar from '@/components/CriadorToolbar.vue'
import { useCartas } from '@/providers/cartas'
import { type CartaTrunfo, novaCarta } from 'trunfo-lib/models/carta'
import ListaCartas from '@/components/ListaCartas.vue'
import FormCarta from '@/components/FormCarta.vue'

const { loadingModelos, modelos } = useModelos()

const modeloEditando = ref<null | Modelo>(null)

const modeloPreview = computed(() => {
  return modeloEditando.value
})
const { loadingCartas, cartas, getCartas } = useCartas()

const cartasModeloAtual = computed(() => {
  return modeloEditando && cartas.value
    ? [...cartas.value.values()].filter((c) => c.id_modelo === modeloEditando.value?.id_modelo)
    : null
})

const cartaEditando = ref<null | CartaTrunfo>(null)
const cartaHover = ref<null | CartaTrunfo>(null)

const cartaPreview = computed(() => {
  return cartaEditando.value ?? cartaHover.value
})
</script>

<template>
  <div class="flex w-full min-h-screen flex-row">
    <div class="w-[600px] text-2xl flex flex-col text-white">
      <CriadorToolbar />
      <select v-model="modeloEditando" class="input-trunfo m-6 p-1" :disabled="!!cartaEditando">
        <option v-for="[_, modelo] in modelos" :key="modelo.id_modelo" :value="modelo">
          {{ modelo.nome }}
        </option>
      </select>
      <div v-if="loadingModelos || loadingCartas" class="m-6">Carregando</div>
      <ListaCartas
        v-if="cartasModeloAtual && modeloEditando"
        v-show="!cartaEditando"
        :modelo-editando="modeloEditando"
        :cartas="cartasModeloAtual"
        @novo-carta="() => (cartaEditando = novaCarta(modeloEditando!))"
        @selecionar-carta="
          (event) => {
            cartaEditando = novaCarta(modeloEditando!, event)
            cartaHover = null
          }
        "
        @hover-carta="(event) => (cartaHover = event)"
      />
      <FormCarta
        v-if="modeloEditando && cartaEditando"
        :modelo="modeloEditando"
        v-model="cartaEditando"
        @cancelar="cartaEditando = null"
        @salvar="cartaEditando = null; getCartas()"
      />
    </div>
    <div class="bg-gray-400 flex-1 flex items-center justify-center">
      <div class="m-auto">
        <Carta
          v-if="modeloPreview"
          :modelo="modeloPreview"
          :carta="cartaPreview ?? undefined"
        ></Carta>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
