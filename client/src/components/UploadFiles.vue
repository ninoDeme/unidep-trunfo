<script setup lang="ts">
import { ref } from 'vue'
import { ArrowUpTrayIcon } from '@heroicons/vue/24/outline'

const props = defineProps<{
  accept?: string
  multiple?: boolean
  label: string
  preview?: string
}>()

const emit = defineEmits<{
  loadFiles: [id: string[]]
  loadFilesFile: [id: File[]]
}>()

const dragover = ref(false)

let htmlInputElement = ref<HTMLInputElement>()

function openFiles(element: HTMLInputElement) {
  // @ts-expect-error
  element.value = null
  element.click()
}

function dropFile(ev: DragEvent) {
  ev.preventDefault()
  let files: File[]
  if (ev.dataTransfer?.items) {
    // If dropped items aren't files, reject them
    files = [...(ev.dataTransfer.items as any as Iterable<DataTransferItem>)]
      .filter((item) => item.kind === 'file')
      .map((item) => item.getAsFile()) as File[]
  } else {
    // Use DataTransfer interface to access the file(s)
    files = [...(ev.dataTransfer?.files as any as Iterable<File>)]
  }
  if (props.accept) {
    const matchStrings = props.accept.split(',')
    const mimeRegexs: RegExp[] = []
    const extensionRegexs: RegExp[] = []
    matchStrings.forEach((matchString) => {
      if (matchString.trim().startsWith('.')) {
        extensionRegexs.push(
          new RegExp(matchString.replace(/[.+?^${}()|[\]\\]/g, '\\$&').trim() + '$')
        )
      } else {
        mimeRegexs.push(
          new RegExp(
            matchString
              .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
              .replace(/\*/g, '(.*?)')
              .trim()
          )
        )
      }
    })
    const invalid = files.filter(
      (f) =>
        !mimeRegexs.some((accRegex) => accRegex.test(f.type)) &&
        !extensionRegexs.some((accRegex) => accRegex.test(f.name))
    )

    if (invalid.length) {
      console.error('arquivos invalidos')
      return
    }
  }
  if (files.length) {
    loadFile(files)
  }
}

function blobToBase64(file: Blob): Promise<string> {
  return new Promise((next, err) => {
    let reader = new FileReader()
    reader.readAsDataURL(file)
    // @ts-expect-error
    reader.onload = (event: ProgressEvent) => next(event.target['result'])
    reader.onerror = (ev) => {
      console.error(ev)
      err(`Não foi possível carregar o arquivo: ${ev}`)
    }
  })
}

async function loadFile(files: File[]) {
  const outFiles: string[] = []
  try {
    if (files) {
      for (let file of files) {
        let fileResult: Blob = file

        outFiles.push(await blobToBase64(fileResult))
      }
      emit('loadFilesFile', files)
      emit('loadFiles', outFiles)
    }
  } catch (e: any) {}
}
</script>

<template>
  <button
    type="button"
    @mouseenter="dragover = true"
    @mouseleave="dragover = false"
    @dragover.prevent="dragover = true"
    @dragleave="dragover = false"
    @drop="
      (event) => {
        dropFile(event)
        dragover = false
      }
    "
    @click="openFiles(htmlInputElement!)"
    class="cursor-pointer transition-colors rounded w-full h-full text-gray-400 p-1 bg-slate-50"
    :class="{ 'text-gray-600': dragover }"
  >
    <div
      class="relative w-full h-full border-current p-4 border-2 border-solid rounded overflow-hidden flex flex-col items-center justify-center"
    >
      <div
        class="z-10 flex flex-col items-center rounded-lg p-4"
        :class="{
          'opacity-0': preview && !dragover,
          'text-gray-50 bg-gray-600 bg-opacity-90 transition-opacity': preview
        }"
      >
        <ArrowUpTrayIcon class="icon"> upload </ArrowUpTrayIcon>
        <span class="text-18 text-center">
          {{ label }}
        </span>
      </div>
      <img
        :class="{ 'blur-[2px]': dragover }"
        v-if="preview"
        :src="preview"
        class="absolute top-0 left-0 w-full h-full transition-all object-cover"
      />
    </div>
  </button>

  <div class="hidden">
    <input
      type="file"
      ref="htmlInputElement"
      @change="loadFile(($event as any).target['files'])"
      :accept="accept"
      :multiple="multiple"
    />
  </div>
</template>
