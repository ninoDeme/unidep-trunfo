<script setup lang="ts">
import FormModelos from '@/components/FormModelos.vue'
import ListaModelos from '@/components/ListaModelos.vue'
import Carta from '@/components/Carta.vue'
import { useModelos } from '@/providers/modelos'
import { novoModelo, type Modelo } from 'trunfo-lib/models/modelo'
import { computed, ref } from 'vue'
import CriadorToolbar from '@/components/CriadorToolbar.vue'

const { modelos, loadingModelos, getModelos } = useModelos()

const modeloEditando = ref<null | Modelo>(null)
const modeloHover = ref<null | Modelo>(null)

const modeloPreview = computed(() => {
  return modeloEditando.value ?? modeloHover.value
})

function salvarModelo() {
  getModelos()
  modeloEditando.value = null
}
</script>

<template>
  <div class="flex w-full min-h-screen flex-row">
    <div class="w-[600px] text-2xl flex flex-col text-white">
      <CriadorToolbar />
      <ListaModelos
        v-if="modelos && !modeloEditando"
        v-show="!modeloEditando"
        :modelos="[...modelos.values()]"
        @novo-modelo="() => (modeloEditando = novoModelo())"
        @selecionar-modelo="
          (event) => {
            modeloEditando = novoModelo(event)
            modeloHover = null
          }
        "
        @hover-modelo="(event) => (modeloHover = event)"
      ></ListaModelos>
      <div v-if="loadingModelos" class="m-6">Carregando</div>
      <FormModelos
        v-if="modeloEditando"
        v-model="modeloEditando"
        @salvar="salvarModelo()"
        @cancelar="modeloEditando = null"
      ></FormModelos>
    </div>
    <div class="bg-gray-400 flex-1 flex items-center justify-center">
      <div class="m-auto">
        <Carta v-if="modeloPreview" :modelo="modeloPreview"></Carta>
      </div>
    </div>
  </div>
</template>

<style></style>
