<script setup lang="ts"></script>

<template>
  <main>
    <div class="h-screen w-screen flex flex-col items-center justify-center">
      <div class="flex flex-col items-stretch max-w-md w-full gap-2 bg-gray-800 rounded-md p-8 text-center">
        <h1 class="text-4xl mb-6 mt-2 font-medium">Trunfo!</h1>
        <menu class="flex flex-col my-4">
          <router-link
            to="criar-partida"
            class="hover:bg-gray-300 text-center mb-2 p-1.5 text-2xl rounded bg-gray-100 text-gray-900"
          >
            Criar uma partida
          </router-link>
          <router-link
            to="se-juntar"
            class="hover:bg-gray-700 text-center mb-2 p-1.5 text-2xl rounded border-gray-100 border"
          >
            Se juntar a uma partida
          </router-link>
        </menu>
      </div>
    </div>
  </main>
</template>
