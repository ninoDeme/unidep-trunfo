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

const cartaEditando = ref<null | CartaTrunfo>(null)
const cartaHover = ref<null | CartaTrunfo>(null)

const cartaPreview = computed(() => {
  return cartaEditando.value ?? cartaHover.value
})
const descricaoFocada = ref(false)
const virouManual = ref(false)
const mostraBack = computed(() => descricaoFocada.value || virouManual.value)
</script>

<template>
  <div class="flex w-full min-h-screen flex-row">
    <div class="w-[600px] text-2xl flex flex-col text-white">
      <CriadorToolbar />
      <select v-model="modeloEditando" class="input-trunfo m-6 p-1" :disabled="!!cartaEditando">
        <option selected hidden disabled :value="null">Selecione um modelo...</option>
        <option v-for="[_, modelo] in modelos" :key="modelo.id_modelo" :value="modelo">
          {{ modelo.nome }}
        </option>
      </select>
      <div v-if="loadingModelos || loadingCartas" class="m-6">Carregando</div>
      <ListaCartas
        v-if="modeloEditando && modelos && cartas"
        v-show="!cartaEditando"
        :modelo-editando="modeloEditando"
        :modelos="modelos"
        :cartas="[...cartas.values()]"
        mostra-nova-carta
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
        @descricao-focada="(x) => descricaoFocada = x"
        @cancelar="cartaEditando = null"
        @salvar="
          () => {
            cartaEditando = null
            getCartas()
          }
        "
      />
    </div>
    <div class="bg-gray-400 flex-1 flex items-center justify-center">
      <button class="m-auto" @click="virouManual = !virouManual">
        <Carta
          v-if="modeloPreview"
          :modelo="modeloPreview"
          :back="mostraBack"
          :carta="cartaPreview ?? undefined"
        ></Carta>
      </button>
    </div>
  </div>
</template>

<style scoped></style>
