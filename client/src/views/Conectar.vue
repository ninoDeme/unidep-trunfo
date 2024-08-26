<script setup lang="ts">
</script>

<template>
  <main>
    <div class="h-screen w-screen flex flex-col items-center justify-center">
      <h1 class="text-3xl mb-4 font-medium">Trunfo!</h1>
      <menu class="flex flex-col mb-8">
        <button class="hover:bg-gray-600 flex flex-row m-1 p-1 text-xl rounded">
          <span>Se juntar a uma partida</span>
        </button>
        <router-link to="criar-partida" class="hover:bg-gray-600 flex flex-row m-1 p-1 text-xl rounded">
          <span>Criar uma partida</span>
        </router-link>
      </menu>
    </div>
  </main>
</template>
