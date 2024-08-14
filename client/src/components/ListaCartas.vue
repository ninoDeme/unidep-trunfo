<script setup lang="ts">
import type { Modelo } from 'trunfo-lib/models/modelo'
import { PencilIcon, PlusIcon } from '@heroicons/vue/24/outline'
import type { CartaTrunfo } from 'trunfo-lib/models/carta'
import Carta from '@/components/Carta.vue'
import { computed, ref } from 'vue'

const W_CARTA = 170

const props = defineProps<{
  modeloEditando?: Modelo
  modelos: Map<number, Modelo>
  cartas: CartaTrunfo[]
  mostraNovaCarta?: boolean
}>()

const cartasFiltradas = computed(() => {
  if (props.modeloEditando == null) {
    return props.cartas.map((c) => ({ carta: c, modelo: props.modelos.get(c.id_modelo)! }))
  }

  return props.cartas
    .filter((c) => c.id_modelo === props.modeloEditando!.id_modelo)
    .map((c) => ({ carta: c, modelo: props.modeloEditando! }))
})

const hoverEl = ref(-1)

const emit = defineEmits<{
  selecionarCarta: [value: CartaTrunfo]
  hoverCarta: [value: CartaTrunfo | null]
  novoCarta: []
}>()
</script>

<template>
  <div class="flex flex-row flex-wrap justify-start gap-5 p-4" v-if="modeloEditando">
    <div :style="{ height: `${(W_CARTA / 500) * 750}px`, width: `${W_CARTA}px` }" class="relative" v-if="mostraNovaCarta">
      <button
        type="button"
        @click="emit('novoCarta')"
        @pointerenter="(hoverEl = -1), emit('hoverCarta', null)"
        @focus="(hoverEl = -1), emit('hoverCarta', null)"
        class="bg-gray-700 transition-opacity opacity-100 bg-opacity-40 z-20 absolute w-full h-full left-0 top-0 flex items-center justify-center"
      >
        <PlusIcon class="icon" />
      </button>
      <Carta
        :style="{ transform: `scale3d(${W_CARTA / 500}, ${W_CARTA / 500}, 1)` }"
        :modelo="modeloEditando"
        class="origin-top-left saturate-50 blur-sm"
      ></Carta>
    </div>
    <div
      v-for="({carta, modelo}, index) in cartasFiltradas"
      :style="{ height: `${(W_CARTA / 500) * 750}px`, width: `${W_CARTA}px` }"
      class="relative"
    >
      <button
        type="button"
        @click="emit('selecionarCarta', carta)"
        @pointerenter="(hoverEl = index), emit('hoverCarta', carta)"
        @focus="(hoverEl = index), emit('hoverCarta', carta)"
        class="bg-gray-700 transition-opacity opacity-0 hover:opacity-100 bg-opacity-40 z-20 absolute w-full h-full left-0 top-0 flex items-center justify-center"
      >
        <PencilIcon class="icon" />
      </button>
      <Carta
        :style="{ transform: `scale3d(${W_CARTA / 500}, ${W_CARTA / 500}, 1)` }"
        :modelo="modelo"
        :carta="carta"
        class="origin-top-left"
      ></Carta>
    </div>
  </div>
</template>

<style scoped></style>
