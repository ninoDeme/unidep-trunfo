<script setup lang="ts">
import { novoModeloAtributo, type Modelo } from 'trunfo-lib/models/modelo'
import { PlusIcon, ChevronUpIcon, ChevronDownIcon, TrashIcon } from '@heroicons/vue/24/outline'
import { ref } from 'vue'

const modelo = defineModel<Modelo>({
  required: true
})

const emit = defineEmits<{
  salvar: [value: Modelo]
  cancelar: []
}>()

const loadingSalvar = ref(false)

function addAtributo() {
  modelo.value.atributos.push(novoModeloAtributo(modelo.value.atributos.length))
  modelo.value.atributos.forEach((v, i) => (v.ordem = i + 1))
}

function removerAtributo(index: number) {
  modelo.value.atributos.splice(index, 1)
  modelo.value.atributos.forEach((v, i) => (v.ordem = i + 1))
}

function moverAtributo(index: number, destino: number) {
  let element = modelo.value.atributos[index]
  modelo.value.atributos.splice(index, 1)
  modelo.value.atributos.splice(destino, 0, element)
  modelo.value.atributos.forEach((v, i) => (v.ordem = i + 1))
}

async function salvar() {
  loadingSalvar.value = true
  try {
    await fetch(`/api/modelo`, {
      method: 'POST',
      body: JSON.stringify(modelo.value),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    emit('salvar', modelo.value)
  } catch (e) {
    console.error(e);
  } finally {
    loadingSalvar.value = false
  }
}
</script>

<template>
  <form class="flex flex-col p-6 gap-4 items-start">
    <h1>Editar Modelo - {{ modelo.id_modelo }}</h1>
    <div class="flex flex-col items-start w-full">
      <label for="nome-modelo" class="text-base">Nome do modelo</label>
      <input
        name="nome"
        type="text"
        required
        v-model.trim="modelo.nome"
        id="nome-modelo"
        class="input-trunfo"
      />
    </div>
    <div class="flex flex-col items-start w-full">
      <label for="cor_texto-modelo" class="text-base">Cor do Texto</label>
      <input
        name="cor_texto"
        type="color"
        required
        v-model="modelo.cor_texto"
        id="cor_texto-modelo"
      />
    </div>
    <div class="flex flex-col items-start w-full">
      <label for="cor_fundo-modelo" class="text-base">Cor de fundo do modelo</label>
      <input
        name="cor_fundo"
        type="color"
        required
        v-model="modelo.cor_fundo"
        id="cor_fundo-modelo"
      />
    </div>
    <div class="flex flex-col items-start w-full">
      <label for="cor_atributo_texto-modelo" class="text-base">
        Cor de texto dos atributos do modelo
      </label>
      <input
        name="cor_atributo_texto"
        type="color"
        required
        v-model="modelo.cor_atributo_texto"
        id="cor_atributo_texto-modelo"
      />
    </div>
    <div class="flex flex-col items-start w-full">
      <label for="cor_atributo_fundo-modelo" class="text-base">
        Cor de fundo dos atributos do modelo
      </label>
      <input
        name="cor_atributo_fundo"
        type="color"
        required
        v-model="modelo.cor_atributo_fundo"
        id="cor_atributo_fundo-modelo"
      />
    </div>
    <div class="border rounded flex flex-col w-full my-2">
      <div class="flex flex-row m-1">
        <h2 class="text-lg">Atributos</h2>
        <div class="flex-1"></div>
        <button
          aria-label="adicionar atributo"
          type="button"
          @click="addAtributo()"
          class="icon-button"
        >
          <PlusIcon class="icon"></PlusIcon>
        </button>
      </div>
      <div
        v-for="(atributo, index) in modelo.atributos"
        :key="atributo.id_modelo_atributo"
        class="flex flex-row m-1 gap-1"
      >
        <span> {{ atributo.ordem }}: </span>
        <input
          type="text"
          placeholder="nome"
          name="nome-atributo"
          v-model.trim="atributo.nome"
          class="input-trunfo"
        />
        <div class="flex-1"></div>
        <button
          aria-label="remover atributo"
          type="button"
          @click="removerAtributo(index)"
          class="icon-button"
        >
          <TrashIcon class="icon text-red-500" />
        </button>
        <button
          aria-label="mover atributo para cima"
          :disabled="index === 0"
          type="button"
          @click="moverAtributo(index, index - 1)"
          class="icon-button"
        >
          <ChevronUpIcon class="icon" />
        </button>
        <button
          aria-label="mover atributo para baixo"
          :disabled="index === modelo.atributos.length - 1"
          type="button"
          @click="moverAtributo(index, index + 1)"
          class="icon-button"
        >
          <ChevronDownIcon class="icon" />
        </button>
      </div>
    </div>
    <div class="flex flex-row justify-start w-full gap-3">
      <button
        class="rounded border-red-500 border p-2 text-xl"
        type="button"
        @click="emit('cancelar')"
      >
        Cancelar
      </button>
      <button
        class="rounded border-gray-300 border p-2 text-xl"
        type="submit"
        :disabled="loadingSalvar"
        @click.prevent="salvar()"
      >
        Salvar
      </button>
    </div>
  </form>
</template>

<style scoped></style>
