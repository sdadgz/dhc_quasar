<template>

  <div class="q-pa-lg row">
    <!--  轮播图  -->
    <q-carousel
        v-model="carouselCurrentId"
        class="col-md-5 col-xs-12 rounded-borders shadow-6"
        infinite
        swipeable
        animated
        :height="$q.platform.is.desktop ? '23vw' : '40vw'"
        :autoplay="carouselAutoPlay"
        :arrows="!carouselAutoPlay"
        transition-prev="slide-right"
        transition-next="slide-left"
        @mouseenter="carouselAutoPlay = false"
        @mouseleave="carouselAutoPlay = true"
    >
      <q-carousel-slide
          v-for="carousel in carouselArray"
          class="cursor-pointer"
          :name="carousel.id"
          :img-src="carousel.img.reduceUrl || carousel.img.url"
          @click="carouselHandler(carousel.essayId)"
      >
        <q-tooltip>
          {{ carousel.essay.title }}
        </q-tooltip>
      </q-carousel-slide>
    </q-carousel>

    <!--  右侧炮灰  -->
    <div class="col-all row">
      <div class="col-md-4 col-xs-6" style="height: 50%">
        <!--    组件，视频    -->
        <VideoCard/>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

import {api} from "../../boot/axios";
import {ref} from "vue";
import {init} from "../../components/Tools";
import {useQuasar} from "quasar";
import {useRouter} from "vue-router";
import VideoCard from "../../components/satm/VideoCard.vue";
import {VideoDefaultCurrentPage, VideoDefaultField, VideoDefaultPageSize} from "../../components/satm/Satm";
import {Head} from "../../components/main/head-item";

// 刀
const $q = useQuasar();
const $router = useRouter();

// 轮播图 ==============================================================
const carouselCurrentId = ref();
const carouselArray = ref([]);
const carouselAutoPlay = ref(true);

// 点击轮播图
function carouselHandler(id: number | string) {
  $router.push('/satm/content?id=' + id);
}

// 获取轮播图
function getCarousel() {
  api.get('/carousel').then(res => {
    carouselArray.value = res.data;
    carouselCurrentId.value = carouselArray.value[0].id;
  })
}

// 视频 =================================================================
const videoList = ref([]);

// 获取video
function getVideo() {
  let field = headItems.value[0].label + ' ' + headItems.value[0].children[headItems.value[0].children.length - 1].label || VideoDefaultField;
  api.get('/essay/page', {
    params: {
      currentPage: VideoDefaultCurrentPage,
      pageSize: VideoDefaultPageSize,
      field: field
    }
  })
}

// --------------------------------------------------------------

// 入口函数
function start() {
  getCarousel();
}

// 头
const headItems = ref([] as Head[]);

init(headItems, start);
</script>

<style scoped>

</style>