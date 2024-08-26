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
    <div class="relative" v-if="mostraNovaCarta">
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
        :width="W_CARTA"
        :modelo="modeloEditando"
        class="saturate-50 blur-[1px]"
      ></Carta>
    </div>
    <div
      v-for="({carta, modelo}, index) in cartasFiltradas"
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
        :width="W_CARTA"
        :modelo="modelo"
        :carta="carta"
        class="hover:saturate-50 hover:blur-[1px]"
      ></Carta>
    </div>
  </div>
</template>

<style scoped></style>
