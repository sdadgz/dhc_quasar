<template>
  <div class="flex row justify-center">
    <div class="width-1200 col-auto">
      <div class="container row overflow-hidden" :style="{height: CAROUSEL_HEIGHT+'px'}">
        <!--    轮播图    -->
        <q-carousel animated
                    v-model="slide"
                    infinite
                    :autoplay="autoplay"
                    :arrows="!autoplay"
                    :style="{width: CAROUSEL_WIDTH+'px',height: CAROUSEL_HEIGHT+'px'}"
                    class="col-auto"
                    transition-prev="slide-right"
                    transition-next="slide-left"
                    @mouseenter="autoplay = false"
                    @mouseleave="autoplay = true">

          <!--     内容     -->
          <q-carousel-slide :name="item.id" v-for="item in imgArr" :img-src="item.img.reduceUrl"
                            class="cursor-pointer" @click="carouselGoto(item.essayId)">
            <template v-slot>
              <div class="absolute-bottom carousel-text">
                {{ item.essay.title }}
              </div>
            </template>
          </q-carousel-slide>

          <!--    底下那个蓝白的格子      -->
          <template #control>
            <q-carousel-control position="bottom-right" :offset="[50,10]">
              <span v-for="index in imgArr" class="pagination-box animated" @click="slide = index.id"
                    :class="slide === index.id ? 'selected-box' : ''"/>
            </q-carousel-control>
          </template>

        </q-carousel>

        <!--    落单的    -->
        <div class="col">
          <ListItem :index="1"/>
        </div>

        <!--    其余    -->
        <div class="container row">
          <ListItem :index="2"/>
          <ListItem :index="3"/>
          <ListItem :index="4"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>

import {ref} from "vue";
import {api} from "boot/axios";
import {CAROUSEL_HEIGHT, CAROUSEL_WIDTH, EQ, ESSAY_UNIQUE_ID, LEVER, QUESTION_MARK} from "components/MagicValue";
import {goto} from "components/Tools";
import {HEAD_ITEMS} from "components/head-item";
import {useRoute, useRouter} from "vue-router";
import ListItem from "components/main/ListItem.vue";

const $route = useRoute();
const $router = useRouter();

const imgArr = ref([]); // 图片数组
const slide = ref();
const autoplay = ref(true);

// 获取轮播图
async function getCarousel() {
  await api.get('/carousel').then(res => {
    imgArr.value = res.data;
    slide.value = imgArr.value[0].id;
  })
}

// 跳转到指定文章
function carouselGoto(id) {
  gotoEssay(id, HEAD_ITEMS[0].children[0].label);
}

// 跳转
function gotoEssay(id, field) {
  let routeUrl = $router.resolve({
    path: '/' + HEAD_ITEMS[0].label + LEVER + field,
    query: {[`${ESSAY_UNIQUE_ID}`]: id}
  })
  window.open(routeUrl.href, '_blank');
}

function start() {
  getCarousel();
}

start();
</script>

<style scoped>

.pagination-box {
  cursor: pointer;
  display: inline-block;
  width: 12px;
  height: 12px;
  background-color: white;
  margin-left: 5px;
}

/* 已使用 */
.selected-box {
  background-color: #125ca8;
}

.animated {
  transition: all .35s ease-in-out;
}

.carousel-text {
  background-color: rgba(0, 0, 0, .3);
  color: white;
  padding: 0 46px;
  line-height: 40px;
}

.width-1200 {
  width: 1200px;
}

.container {
  background-color: white;
  margin: 20px 0;
}

</style>
