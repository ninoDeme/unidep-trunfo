<script setup lang="ts">
import { computed, provide, ref, watch } from 'vue'
import Jogatina from '@/components/jogo/Jogatina.vue'
import { useJogo } from '@/providers/jogo'
import { useRoute, useRouter } from 'vue-router'
import { useNome } from '@/providers/nome'
import { ClipboardIcon } from '@heroicons/vue/24/outline'
import { toast } from 'vue3-toastify'
import StretchLoader from '@/components/StretchLoader.vue'

const route = useRoute()
const router = useRouter()
const { getNome } = useNome()

const partidaStr = route.params['nomesala']

let jogoVars = useJogo(partidaStr as string, getNome() ?? 'Jogador')

let { jogo, getJogo, loadingJogo, oponenteConectado, codigoOponente, errorConexao, errorFatal } =
  jogoVars

provide('jogo', jogoVars)

function copiarUrl() {
  if (!urlConexao.value) return
  if (!navigator.clipboard) return
  navigator.clipboard.writeText(urlConexao.value ?? '')
  toast('Copiado URL', {
    position: 'bottom-center',
    theme: 'colored',
    type: 'info'
  })
}

function copiarCodigo() {
  if (!urlConexao.value) return
  if (!navigator.clipboard) return
  navigator.clipboard.writeText(codigoFormatado.value ?? '')
  toast('Copiado código', {
    position: 'bottom-center',
    theme: 'colored',
    type: 'info'
  })
}

const codigoFormatado = computed(() => {
  let cod = codigoOponente.value ?? 'xxxxxx'
  return cod.substring(0, 3) + '-' + cod.substring(3)
})
const urlConexao = computed(() => {
  return `${location.protocol}//${location.host}/jogo/${codigoOponente.value}`
})

let tentativas = 0
const maximoTentativasAlcancado = ref(false)
watch(errorConexao, () => {
  if (errorConexao.value) {
    if (tentativas > 5) {
      maximoTentativasAlcancado.value = true
    } else {
      setTimeout(() => {
        tentativas++
        getJogo().catch(console.error)
      }, 5000)
    }
  }
})

watch(errorFatal, () => {
  if (errorFatal.value) {
    toast(errorFatal.value, {
      theme: 'colored',
      type: 'error',
      position: 'bottom-center',
      transition: 'slide'
    })
    router.push('/')
  }
})
</script>

<template>
  <main>
    <div class="wrapper overflow-y-hidden relative justify-center flex flex-col items-center">
      <div
        v-if="maximoTentativasAlcancado"
        class="absolute left-0 top-0 w-full h-full z-50 px-4 bg-black bg-opacity-60 flex flex-col justify-center items-center"
      >
        <div class="p-5 rounded bg-gray-800 flex flex-col items-center justify-center max-w-md">
          <h1 class="text-3xl mb-6">Ocorreu um erro</h1>
          <p class="text-lg text-center">
            Não foi possível conectar com o servidor, tente novamente mais tarde
          </p>
        </div>
      </div>
      <div
        v-else-if="errorConexao"
        class="absolute left-0 top-0 w-full h-full z-50 px-4 bg-black bg-opacity-60 flex flex-col justify-center items-center"
      >
        <div class="p-5 rounded bg-gray-800 flex flex-col items-center justify-center">
          <h1 class="text-3xl mb-6">Ocorreu um erro</h1>
          <h2 class="text-2xl mb-6">Tentando reconectar</h2>
          <StretchLoader background="#ffffff" size="90px"></StretchLoader>
        </div>
      </div>
      <template v-if="!oponenteConectado || !jogo">
        <h1 class="text-2xl mb-6">Esperando Oponente...</h1>
        <span class="text-lg">
          Envie este código para o oponente para ele se juntar a sua sala:</span
        >
        <div class="m-4 flex flex-row gap-4 border-white border p-1.5 rounded font-mono">
          <span class="text-2xl">{{ codigoFormatado }}</span>
          <button
            aria-label="Copiar código"
            type="button"
            @click="copiarCodigo()"
            class="icon-button"
          >
            <ClipboardIcon class="icon"></ClipboardIcon>
          </button>
        </div>
        <span class="text-lg"> Ou envie esta url para ele:</span>
        <div class="m-4 flex flex-row gap-4 border-white border p-1.5 rounded font-mono">
          <span class="text-xl">{{ urlConexao }}</span>
          <button aria-label="Copiar URL" type="button" @click="copiarUrl()" class="icon-button">
            <ClipboardIcon class="icon"></ClipboardIcon>
          </button>
        </div>
      </template>
      <Jogatina v-else/>
    </div>
  </main>
  <main v-if="loadingJogo">Loading...</main>
</template>

<style>
.wrapper {
  width: 100dvw;
  height: 100dvh;
}
</style>
