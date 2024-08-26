<script setup lang="ts">
import type { Modelo } from 'trunfo-lib/models/modelo'
import type { CartaTrunfo, CartaTrunfoAtributo } from 'trunfo-lib/models/carta'

defineProps<{
  modelo: Modelo
  carta?: CartaTrunfo
  width?: number
  back?: boolean
  clicarAtributo?: boolean
}>()

const emit = defineEmits<{
  clickAttr: [id: CartaTrunfoAtributo]
}>()
</script>

<template>
  <div
    class="relative carta_wrapper"
    :class="{ virado: !!back }"
    :style="{ width: `${width ?? 500}px`, height: `${((width ?? 500) / 500) * 660}px` }"
  >
    <div class="absolute left-0 top-0 w-full h-full costas">
      <img
        class="carta rounded-xl border-white border-[5px] bg-white object-cover origin-top-left max-w-none"
        src="@/assets/carta_back.svg"
        :style="{ transform: !width ? undefined : `scale3d(${width / 500}, ${width / 500}, 1)` }"
      />
    </div>
    <div
      class="border-[5px] border-white rounded-xl flex flex-col carta origin-top-left select-none"
      :style="{
        backgroundColor: modelo.cor_fundo,
        color: modelo.cor_texto,
        transform: !width ? undefined : `scale3d(${width / 500}, ${width / 500}, 1)`
      }"
    >
      <div class="w-full text-3xl p-2">{{ carta?.nome ?? 'Nome da carta' }}</div>
      <img
        v-if="carta"
        class="aspect-video bg-gray-500 border-white border-b-[4px] border-t-[4px] object-cover w-full"
        :src="carta?.img ?? `/uploads/carta/carta-${carta?.id_carta}.webp`"
      />
      <img
        v-else
        class="aspect-video bg-gray-500 border-white border-b-[4px] border-t-[4px] w-full"
      />
      <div class="m-8 mb-3">
        <button
          v-for="(atributo, index) in carta?.atributos ?? modelo.atributos"
          :disabled="!carta || !clicarAtributo"
          @click="carta && clicarAtributo && emit('clickAttr', carta.atributos[index])"
          :key="atributo.id_modelo_atributo"
          :style="{ backgroundColor: modelo.cor_atributo_fundo, color: modelo.cor_atributo_texto }"
          class="flex flex-row justify-between my-1 text-2xl w-full not-opacity-disabled"
        >
          <span class="p-2"> {{ atributo.nome }} </span>
          <span class="p-2"> {{ 'valor' in atributo ? atributo.valor : '0000' }} </span>
        </button>
      </div>

      <div class="flex-1"></div>
      <div
        v-if="!carta || carta.descricao"
        :style="{ backgroundColor: modelo.cor_atributo_fundo, color: modelo.cor_atributo_texto }"
        class="m-8 mt-3 p-3"
      >
        <p v-if="carta && carta.descricao" class="text-base">
          {{ carta.descricao }}
        </p>
        <p v-else class="text-base">
          Descrição da carta Descrição da carta Descrição da carta Descrição da carta
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.carta {
  width: 500px;
  height: 660px;
  backface-visibility: hidden;
}

.costas {
  backface-visibility: hidden;
  transform: rotateY(180deg);
}

.carta_wrapper {
  transform-style: preserve-3d;
  transition: transform 500ms ease-in-out;
}

.virado {
  transform: rotateY(180deg);
}
</style>
