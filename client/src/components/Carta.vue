<script setup lang="ts">
import type { Modelo } from 'trunfo-lib/models/modelo'
import type { CartaTrunfo, CartaTrunfoAtributo } from 'trunfo-lib/models/carta'
import { computed } from 'vue'
import { marked } from 'marked'

const props = defineProps<{
  modelo: Modelo
  carta?: CartaTrunfo
  width?: number
  back?: boolean
  clicarAtributo?: boolean
}>()

const descricao = computed(() => {
  return props.carta?.descricao ? marked(props.carta.descricao) : ''
})

const atributos = computed(() => {
  return props.modelo.atributos.map((attr, i) => {
    let nome = attr.nome.replace(/(\(.+?\))/g, '<span class="attr-unit">$1</span>')
    let atributo_carta = props.carta?.atributos.find(a => a.id_modelo_atributo === attr.id_modelo_atributo)
    if (!atributo_carta) return {
      id_modelo_atributo: attr.id_modelo_atributo,
      nome,
      valor: '0000'
    }

    let valor;
    if (attr.tipo === 1) {
      valor = atributo_carta.valor.toString()
    } else {
      valor = atributo_carta.valor.toLocaleString()
    }

    return {
      id_modelo_atributo: attr.id_modelo_atributo,
      nome,
      valor
    }
  })
})

const emit = defineEmits<{
  clickAttr: [id: CartaTrunfoAtributo]
  clickImg: []
}>()
</script>

<template>
  <div
    class="relative carta_wrapper"
    :class="{ virado: !!back }"
    :style="{ width: `${width ?? 500}px`, height: `${((width ?? 500) / 500) * 660}px` }"
  >
    <div class="absolute left-0 top-0 w-full h-full costas">
      <div
        class="border-[5px] border-white rounded-xl flex flex-col carta origin-top-left select-none"
        :style="{
          transform: !width ? undefined : `scale3d(${width / 500}, ${width / 500}, 1)`,
          background: modelo.cor_atributo_fundo,
          color: modelo.cor_atributo_texto
        }"
      >
        <div class="w-full text-3xl p-2 text-start px-6 font-medium">
          {{ carta?.nome ?? 'Nome da carta' }}
        </div>
        <img
          v-if="carta"
          class="aspect-[16/7] bg-gray-500 border-white border-b-[4px] border-t-[4px] object-cover w-full"
          :src="carta?.img ?? `/uploads/carta/carta-${carta?.id_carta}.webp`"
        />
        <img
          v-else
          class="aspect-[16/7] bg-gray-500 border-white border-b-[4px] border-t-[4px] w-full"
        />
        <div class="m-6 my-4 desc-wrapper">
          <span v-if="carta" class="text-lg text-justify font-light" v-html="descricao"></span>
          <p v-else class="text-lg">
            Descrição da carta Descrição da carta Descrição da carta Descrição da carta
          </p>
        </div>
      </div>
    </div>
    <div
      class="border-[5px] border-white rounded-xl flex flex-col carta origin-top-left select-none"
      :style="{
        backgroundColor: modelo.cor_fundo,
        color: modelo.cor_texto,
        transform: !width ? undefined : `scale3d(${width / 500}, ${width / 500}, 1)`
      }"
    >
      <div class="w-full text-3xl p-2 text-start px-6 font-medium">
        {{ carta?.nome ?? 'Nome da carta' }}
      </div>
      <img
        v-if="carta"
        @click="emit('clickImg')"
        class="aspect-[16/7] bg-gray-500 border-white border-b-[4px] border-t-[4px] object-cover w-full"
        :src="carta?.img ?? `/uploads/carta/carta-${carta?.id_carta}.webp`"
      />
      <img
        v-else
        @click="emit('clickImg')"
        class="aspect-[16/7] bg-gray-500 border-white border-b-[4px] border-t-[4px] w-full"
      />
      <div class="m-6 mb-3">
        <button
          v-for="(atributo, index) in atributos"
          :disabled="!carta || !clicarAtributo"
          @click="carta && clicarAtributo && emit('clickAttr', carta.atributos[index])"
          :key="atributo.id_modelo_atributo"
          :style="{ backgroundColor: modelo.cor_atributo_fundo, color: modelo.cor_atributo_texto }"
          :class="{'rounded-t-xl': index === 0, 'rounded-b-xl': index === atributos.length - 1}"
          class="flex flex-row justify-between my-0.5 text-2xl w-full not-opacity-disabled"
        >
          <span class="p-2 attr-carta" v-html="atributo.nome"></span>
          <span class="p-2 attr-carta"> {{ 'valor' in atributo ? atributo.valor : '0000' }} </span>
        </button>
      </div>

      <div class="flex-1"></div>
    </div>
  </div>
</template>

<style lang="postcss">
.desc-wrapper {
  h1 {
    @apply text-2xl;
  }

  li {
    list-style-type: disc;
  }
  b, strong {
    font-weight: 600;
  }
}
.attr-carta {
  .attr-unit {
    @apply text-xl font-light;
  }
}
</style>

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
