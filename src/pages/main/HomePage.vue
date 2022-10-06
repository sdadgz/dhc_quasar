<template>
  <div class="flex row justify-center">
    <div class="width-1200 col-auto">
      <div class="container">
        <div class="imgs">
          <Transition name="img">

          </Transition>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>

import {ref} from "vue";
import {api} from "boot/axios";

// 图片数组
const imgArr = ref([]);

function start(){

}


</script>

<style scoped>

.imgs {
  width: 700px;
  height: 394px;
  overflow: hidden;
  display: inline-block;
  position: relative;
}

.img-enter-active,
.img-leave-active {
  transition: all .35s ease-in-out;
  position: absolute;
}

.img-enter-from {
  transform: translateX(701px);
}

.img-leave-to {
  transform: translateX(-700px);
}

.width-1200 {
  width: 1200px;
}

.container {
  background-color: white;
  margin: 20px 0;
  min-height: 50vh;
}

</style>
