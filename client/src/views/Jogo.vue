<script setup lang="ts">
import Carta from '@/components/Carta.vue';
import { useJogo } from '@/providers/jogo';
import { useModelos } from '@/providers/modelos';
import { computed } from 'vue';

let { jogo } = useJogo('nome da sala');
let { modelos } = useModelos();
let modelo = computed(() => {
  if (!modelos.value) return null;
  if (!jogo.value) return null;
  return modelos.value.get(jogo.value.id_modelo)!
});

</script>

<template>
  <main>
    <div class="h-screen w-screen flex flex-col items-center justify-center" :v-if="modelo != null">
      <div class="flex-1"></div>
      <div>
        <Carta v-if="jogo?.[0].cartaAtual" :modelo="modelo!" :carta="jogo?.[0].cartaAtual"></Carta>
      </div>
    </div>
  </main>
</template>
