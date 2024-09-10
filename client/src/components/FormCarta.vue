<script setup lang="ts">
import { computed, ref } from 'vue'
import type { CartaTrunfo } from 'trunfo-lib/models/carta'
import type { Modelo } from 'trunfo-lib/models/modelo'
import UploadFiles from './UploadFiles.vue'

const carta = defineModel<CartaTrunfo>({
  required: true
})

defineProps<{ modelo: Modelo }>()

const file = ref<File | null>(null)

function setImg(input: File) {
  file.value = input
  carta.value.img = URL.createObjectURL(input)
}

const emit = defineEmits<{
  salvar: [value: CartaTrunfo]
  cancelar: []
  descricaoFocada: [value: boolean]
}>()

const loadingSalvar = ref(false)

const podeSalvar = computed(() => {
  if (!carta.value.nome) return false
  if (!carta.value.descricao) return false
  return true
})

async function salvar() {
  loadingSalvar.value = true
  try {
    // let res = await fetch(`/api/carta`, {
    //   method: 'POST',
    //   body: JSON.stringify({
    //     ...carta.value,
    //     img: undefined
    //   }),
    //   headers: {
    //     'Content-Type': 'application/json'
    //   }
    // })
    // if (!res.ok) {
    //   throw new Error('Erro ao salvar a carta')
    // }
    let formData = new FormData()
    formData.append(
      'carta',
      JSON.stringify({
        ...carta.value,
        img: undefined
      })
    )
    if (file.value) {
      formData.append('img', file.value)
    }

    let res = await fetch(`/api/carta/${carta.value.id_carta}`, {
      method: 'POST',
      body: formData
    })
    if (!res.ok) {
      throw new Error('Erro ao salvar a carta')
    }

    // await new Promise<void>((resolve, reject) => {
    //   let request = new XMLHttpRequest()
    //   request.open('POST', `/api/carta/${carta.value.id_carta}`)
    //   request.onreadystatechange = function () {
    //     if (request.readyState === 4) {
    //       if (request.status === 200 && request.statusText === 'OK') {
    //         resolve()
    //       } else {
    //         reject(new Error(request.statusText))
    //       }
    //     }
    //   }
    //   request.send(formData)
    // })
    emit('salvar', carta.value)
  } catch (e) {
    console.error(e)
  } finally {
    loadingSalvar.value = false
  }
}
</script>

<template>
  <form class="flex flex-col p-6 gap-4 items-start">
    <h1>Editar Carta</h1>
    <div class="flex flex-col items-start w-full">
      <label for="nome-modelo" class="text-base">Nome</label>
      <input
        name="nome"
        type="text"
        required
        v-model.trim="carta.nome"
        id="nome-modelo"
        class="input-trunfo"
      />
    </div>
    <div class="flex flex-col items-start w-full">
      <label for="descricao-modelo" class="text-base">Descrição</label>
      <textarea
        name="descricao"
        @focus="emit('descricaoFocada', true)"
        @blur="emit('descricaoFocada', false)"
        type="text"
        required
        v-model.trim="carta.descricao"
        id="descricao-modelo"
        class="input-trunfo w-full text-lg"
      />
    </div>
    <div class="flex flex-col items-start w-full">
      <label for="mini-modelo" class="text-base">Mini</label>
      <input
        name="mini"
        type="number"
        required
        v-model="carta.mini"
        id="mini-modelo"
        class="input-trunfo"
      />
    </div>
    <UploadFiles
      accept="image/*"
      label="Imagem da Carta"
      @load-files-file="setImg($event[0])"
      :preview="carta.img"
    />
    <div class="border rounded flex flex-col w-full my-2">
      <div class="flex flex-row m-1">
        <h2 class="text-lg">Atributos</h2>
        <div class="flex-1"></div>
      </div>
      <div
        v-for="atributo in carta.atributos"
        :key="atributo.id_modelo_atributo"
        class="flex flex-row m-1 gap-1"
      >
        <span> {{ atributo.nome }}: </span>
        <input
          type="text"
          placeholder="valor"
          name="valor-atributo"
          v-model.trim="atributo.valor"
          required
          class="input-trunfo"
        />
        <div class="flex-1"></div>
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
        :disabled="loadingSalvar || !podeSalvar"
        @click.prevent="salvar()"
      >
        Salvar
      </button>
    </div>
  </form>
</template>

<style scoped>
</style>
