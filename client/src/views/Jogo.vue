<script setup lang="ts">
import { useJogo, type Jogada, type JogoState } from '@/providers/jogo'
import { useModelos } from '@/providers/modelos'
import { decodeGameString } from 'trunfo-lib/models/jogo'
import { ref } from 'vue'
import Jogatina from '@/components/jogo/Jogatina.vue'

let { modelos } = useModelos()

// let { jogo, loadingJogo, errorJogo, usuario } = useJogo('asd')

const jogarMesmoAssim = ref(false)
</script>

<template>
  <main v-if="!jogarMesmoAssim">
    <div class="wrapper overflow-y-hidden relative justify-center flex flex-col items-center">
      <h1 class="text-xl mb-6">Esperando Oponente...</h1>
      <button class="rounded border-gray-300 border max-w-xl p-2 text-xl" @click="jogarMesmoAssim = true">Jogar Mesmo Assim (temporario, para demonstração)</button>
    </div>
  </main>
  <Jogatina :partida="$route.params.nomesala as string" v-else />
</template>

<style>
.wrapper {
  width: 100dvw;
  height: 100dvh;
}
</style>
