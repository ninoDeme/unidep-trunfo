<script setup lang="ts">
import { type Modelo } from 'trunfo-lib/models/modelo'
import { ref } from 'vue'

const props = defineProps<{
  modelo: Modelo | null
}>()

const emit = defineEmits<{
  salvar: [value: Modelo]
  cancelar: []
}>()

let modelo = ref<Modelo>(
  props.modelo ?? {
    id_modelo: Math.floor(Math.random() * 999997) + 1,
    nome: 'Novo Modelo',
    atributos: []
  }
)

function novoAtributo() {
  modelo.value.atributos.push({
    id_modelo_atributo: Math.floor(Math.random() * 999997) + 1,
    nome: 'Novo Atributo',
    ordem: modelo.value.atributos.length,
    tipo: 0
  })
}
</script>

<template>
  <form>
    <h1>Editar Modelo - {{ modelo.id_modelo }}</h1>
    <input name="nome" type="text" required v-model="modelo.nome" />
    <div class="border rounded flex flex-col">
      <div class="flex flex-row">
        <h2>Atributos</h2>
        <div class="flex-1"></div>
        <button aria-label="adicionar atributo" @click="novoAtributo()">+</button>
      </div>
      <div
        v-for="atributo in modelo.atributos"
        :key="atributo.id_modelo_atributo"
        class="flex flex-row"
      >
        <input type="text" name="nome-atributo" v-model="atributo.nome" />
      </div>
    </div>
  </form>
</template>

<style scoped></style>
