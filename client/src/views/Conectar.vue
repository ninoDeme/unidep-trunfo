<script setup lang="ts">
</script>

<template>
  <main>
    <div class="h-screen w-screen flex flex-col items-center justify-center">
      <h1 class="text-4xl mb-6 font-medium">Trunfo!</h1>
      <menu class="flex flex-col mb-8">
        <router-link to="se-juntar" class="hover:bg-gray-600 flex flex-row m-1 p-1.5 text-xl rounded border-gray-100 border">
          <span>Se juntar a uma partida</span>
        </router-link>
        <router-link to="criar-partida" class="hover:bg-gray-600 flex flex-row m-1 p-1.5 text-xl rounded border border-gray-100">
          <span>Criar uma partida</span>
        </router-link>
      </menu>
    </div>
  </main>
</template>
