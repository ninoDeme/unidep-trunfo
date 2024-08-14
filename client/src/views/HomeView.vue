<script setup lang="ts">
import CriadorToolbar from '@/components/CriadorToolbar.vue';
import ListaCartas from '@/components/ListaCartas.vue';
import { useCartas } from '@/providers/cartas';
import { useModelos } from '@/providers/modelos';

const { modelos } = useModelos();
const { cartas } = useCartas();

</script>

<template>
  <main>
    <CriadorToolbar></CriadorToolbar>
    <ListaCartas v-if="modelos && cartas" :modelos="modelos" :cartas="[...cartas.values()]"></ListaCartas>
  </main>
</template>
