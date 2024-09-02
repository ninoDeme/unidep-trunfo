<script setup lang="ts">
import { computed, provide, ref, watch } from 'vue'
import Jogatina from '@/components/jogo/Jogatina.vue'
import { useJogo } from '@/providers/jogo'
import { useRoute, useRouter } from 'vue-router'
import { useNome } from '@/providers/nome'
import { ClipboardIcon } from '@heroicons/vue/24/outline'
import { toast } from 'vue3-toastify'

const route = useRoute()
const router = useRouter()
const { getNome } = useNome()

const partidaStr = route.params['nomesala']

let jogoVars = useJogo(partidaStr as string, getNome() ?? 'Jogador')

let { jogo, loadingJogo, oponenteConectado, codigoOponente, errorConexao } = jogoVars

provide('jogo', jogoVars)

function copiarUrl() {
  if (!urlConexao.value) return
  if (!navigator.clipboard) return
  navigator.clipboard.writeText(urlConexao.value ?? '')
  toast("Copiado URL", {
    position: 'bottom-center',
    theme: 'colored',
    type: 'info'
  })
}

function copiarCodigo() {
  if (!urlConexao.value) return
  if (!navigator.clipboard) return
  navigator.clipboard.writeText(codigoFormatado.value ?? '')
  toast("Copiado código", {
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

watch(errorConexao, () => {
  if (errorConexao.value) {
    toast(errorConexao.value, {
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
  <main v-if="!oponenteConectado || !jogo">
    <div class="wrapper overflow-y-hidden relative justify-center flex flex-col items-center">
      <h1 class="text-2xl mb-6">Esperando Oponente...</h1>
      <span class="text-lg"> Envie este código para o oponente para ele se juntar a sua sala:</span>
      <div class="m-4 flex flex-row gap-4 border-white border p-1.5 rounded">
        <span class="text-2xl">{{ codigoFormatado }}</span>
        <button aria-label="Copiar código" type="button" @click="copiarCodigo()" class="icon-button">
          <ClipboardIcon class="icon"></ClipboardIcon>
        </button>
      </div>
      <span class="text-lg"> Ou envie esta url para ele:</span>
      <div class="m-4 flex flex-row gap-4 border-white border p-1.5 rounded">
        <span class="text-xl">{{ urlConexao }}</span>
        <button aria-label="Copiar URL" type="button" @click="copiarUrl()" class="icon-button">
          <ClipboardIcon class="icon"></ClipboardIcon>
        </button>
      </div>
    </div>
  </main>
  <main v-else-if="loadingJogo">Loading...</main>
  <Jogatina :partida="$route.params.nomesala as string" v-else />
</template>

<style>
.wrapper {
  width: 100dvw;
  height: 100dvh;
}
</style>
