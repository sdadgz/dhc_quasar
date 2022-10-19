<template>
  <q-layout view="lHh Lpr lFf" style="background-color: #eff3f9">
    <!--  头部  -->
    <q-header>
      <q-toolbar>
        <q-icon name="list" size="30px" class="cursor-pointer" @click="drawer = !drawer"/>
      </q-toolbar>
    </q-header>

    <!--  左侧  -->
    <q-drawer v-model="drawer" mini>

    </q-drawer>

    <q-page-container>
      <router-view/>
    </q-page-container>

  </q-layout>
</template>

<script setup>

import {ref} from "vue";

const drawer = ref(true);

</script>

<style scoped>

</style>
