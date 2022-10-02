<template>
  <q-layout view="hHh Lpr fFf">

    <!--  内容  -->
    <q-page-container>
      <router-view />
    </q-page-container>

  </q-layout>
</template>

<script setup>
</script>

<style scoped>

</style>

<style>

body {
  overflow-y: auto;
  background-color: #eff3f9;
}

::-webkit-scrollbar {
  width: 6px;
  height: 6px;
  background-color: #F5F5F5;
}

::-webkit-scrollbar-thumb {
  border-radius: 10px;
  -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, .3);
  background-color: #018EE8;
}

</style>
