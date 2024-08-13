<script setup lang="ts">
import type { Modelo } from 'trunfo-lib/models/modelo'
import type { CartaTrunfo } from 'trunfo-lib/models/carta'

defineProps<{ modelo: Modelo, carta?: CartaTrunfo }>()
</script>

<template>
  <div class="carta">
    <div class="border-[5px] border-white w-full h-full rounded-xl flex flex-col"
      :style="{ backgroundColor: modelo.cor_fundo, color: modelo.cor_texto }"
    >
      <div class="w-full text-3xl p-2">{{ carta?.nome ?? 'Nome da carta' }}</div>
      <img v-if="carta" class="aspect-video bg-gray-500 border-white border-b-[4px] border-t-[4px] object-cover w-full" :src="carta?.img ?? `./upload/cartas/carta-${carta?.id_carta}.webp`" />
      <img v-else class="aspect-video bg-gray-500 border-white border-b-[4px] border-t-[4px] w-full" />
      <div class="m-8 mb-3">
        <div
          v-for="(atributo, index) in (carta?.atributos ?? modelo.atributos)"
          :key="atributo.id_modelo_atributo"
          :style="{ backgroundColor: modelo.cor_atributo_fundo, color: modelo.cor_atributo_texto }"
          class="flex flex-row justify-between my-1 text-xl"
        >
          <span class="p-2"> {{ atributo.nome }} </span>
          <span class="p-2"> {{ 'valor' in atributo ? atributo.valor : '0000'}} </span>
        </div>
      </div>

      <div class="flex-1"></div>
      <div v-if="!carta || carta.descricao"
        :style="{ backgroundColor: modelo.cor_atributo_fundo, color: modelo.cor_atributo_texto }"
        class="m-8 mt-3 p-3"
      >

        <p v-if="carta && carta.descricao" class="text-base">
          {{ carta.descricao }}
        </p>
        <p v-else class="text-base">
          Descrição da carta Descrição da carta Descrição da carta Descrição da carta Descrição da
          carta Descrição da carta Descrição da carta Descrição da carta Descrição da carta
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.carta {
  width: 500px;
  height: 750px;
}
</style>
