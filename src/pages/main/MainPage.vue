<template>
  <div class="flex row justify-center">
    <div class="width-1200 col-auto">
      <div class="container">
        <Header />
      </div>
    </div>
  </div>
</template>

<script setup>

import Header from "components/main/Header.vue";


</script>

<style scoped>

.width-1200 {
  width: 1200px;
}

.container {
  background-color: white;
  margin: 20px 0;
  padding: 20px 30px;
  min-height: 50vh;
}

</style>
