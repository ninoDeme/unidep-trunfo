<script setup lang="ts">
import { computed, ref } from 'vue'
import Jogatina from '@/components/jogo/Jogatina.vue'
import { useJogo } from '@/providers/jogo'
import { useRoute } from 'vue-router'
import { useNome } from '@/providers/nome'
import { ClipboardIcon } from '@heroicons/vue/24/outline'

const route = useRoute()
const { getNome } = useNome()

const partidaStr = route.params['nomesala']

let { jogo, loadingJogo, oponenteConectado, codigoOponente } = useJogo(
  partidaStr as string,
  getNome() ?? 'Jogador'
)

const jogarMesmoAssim = ref(false)

function copiarUrl() {
  if (!codigoOponente.value?.url) return
  if (!navigator.clipboard) return
  navigator.clipboard.writeText(codigoOponente.value?.url ?? '')
}

const codigoFormatado = computed(() => {
  let cod = codigoOponente.value?.codigo ?? '000000'
  return cod.substring(0, 3) + '-' + cod.substring(3)
})
</script>

<template>
  <main v-if="(!jogarMesmoAssim && !oponenteConectado) || !jogo">
    <div class="wrapper overflow-y-hidden relative justify-center flex flex-col items-center">
      <h1 class="text-xl mb-6">Esperando Oponente...</h1>
      <span class="text-lg"> Envie este código para o oponente para ele se juntar a sua sala:</span>
      <div class="m-4 flex flex-row gap-1 border-white border p-1.5 rounded">
        <span class="text-2xl">{{ codigoFormatado }}</span>
        <button aria-label="Copiar URL" type="button" @click="copiarUrl()" class="icon-button">
          <ClipboardIcon class="icon"></ClipboardIcon>
        </button>
      </div>
      <span class="text-lg"> Ou envie esta url para ele:</span>
      <div class="m-4 flex flex-row gap-4 border-white border p-1.5 rounded">
        <span class="text-xl">{{ codigoOponente?.url }}</span>
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
