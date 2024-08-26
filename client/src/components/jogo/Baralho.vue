<script setup lang="ts">
import type { CartaTrunfo } from 'trunfo-lib/models/carta'
import type { Modelo } from 'trunfo-lib/models/modelo'
import Carta from '../Carta.vue';
import { defineProps } from 'vue';

defineProps<{
  cartasBaralho?: CartaTrunfo[]
  modelo: Modelo
}>()
</script>

<template>
  <div class="flex flex-row-reverse justify-end w-44">
    <template v-if="cartasBaralho && modelo" v-for="(carta, index) of cartasBaralho">
      <div class="w-2.5">
        <Carta v-if="index < 7" :modelo="modelo" :carta="carta" back :width="230"></Carta>
      </div>
    </template>
  </div>
</template>
