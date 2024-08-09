<script setup lang="ts">
import { ref } from 'vue'
import type { Modelo } from 'trunfo-lib/models/modelo'
import ListaModelos from '@/components/ListaModelos.vue'

let modelos = ref<Modelo[] | null>(null)
fetch('/api/modelo')
  .then((res) => res.json())
  .then((data) => {
    modelos.value = data
    console.log(data)
  })
  .catch((e) => {
    console.error(e)
  })
</script>

<template>
  <div class="flex w-full min-h-screen flex-row">
    <div class="w-[900px] text-2xl flex flex-col text-white">
      <ListaModelos
        v-if="modelos"
        :modelos="modelos"
        @novo-modelo="console.log('Novo')"
        @selecionar-modelo="(event) => console.log(event)"
      ></ListaModelos>
      <div v-else>Carregando</div>
    </div>
    <div class="bg-gray-100 flex-1">
    </div>
  </div>
</template>

<style></style>
