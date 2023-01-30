<template>
  <div class="q-pa-lg">
  <div class="container">
      <div class="grid">
        <!--  轮播图  -->
        <q-carousel
            v-model="carouselCurrentId"
            class="rounded-borders shadow-6 grid-carousel"
            style="max-height: 50vw"
            infinite
            swipeable
            animated
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
              @click="gotoEssay(carousel.essayId)"
          >
            <q-tooltip>
              {{ carousel.essay.title }}
            </q-tooltip>
          </q-carousel-slide>
        </q-carousel>

        <!--  其他所有  -->
        <div v-for="video in videoList">
          <!--    组件，视频    -->
          <VideoCard
              :img="video.img.reduceUrl || video.img.url || ''"
              :label="video.label || ''"
              :essay-id="video.essayId"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

import {api} from "../../boot/axios";
import {ref, watch} from "vue";
import {init} from "../../components/Tools";
import {useQuasar} from "quasar";
import {useRouter} from "vue-router";
import VideoCard from "../../components/satm/VideoCard.vue";
import {VideoDefaultCurrentPage, VideoDefaultPageSize} from "../../components/satm/Satm";
import {Head} from "../../components/main/head-item";

// 刀
const $q = useQuasar();
const $router = useRouter();

// 轮播图 ==============================================================
const carouselCurrentId = ref();
const carouselArray = ref([]);
const carouselAutoPlay = ref(true);

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
  api.get('/friendLink/page', {
    params: {
      currentPage: VideoDefaultCurrentPage,
      pageSize: VideoDefaultPageSize,
    }
  }).then(res => {
    const list = res.data.lists;
    const total = res.data.total;

    videoList.value = list;
  })
}

// --------------------------------------------------------------

// 网格列数
const gridColumns = ref(2);
const layoutPadding = ref('100px');

// 点击轮播图
function gotoEssay(id: number | string) {
  $router.push('/satm/content?id=' + id);
}

// 入口函数
function start() {
  getCarousel();
  getVideo();
}

// 监控屏幕宽度
watch(() => $q.screen.width, (value, oldValue, onCleanup) => {
  gridColumns.value = value < 1000 && 2 || value < 1250 && 3 || value < 1500 && 4 || 5;
  layoutPadding.value = gridColumns.value < 4 ? '0' : '100px';
}, {immediate: true})

// 头
const headItems = ref([] as Head[]);

init(headItems, start);
</script>

<style scoped>

.container {
  margin: 0 auto;
  max-width: calc(1920 + 2 * v-bind(layoutPadding));
  padding: 0 v-bind(layoutPadding);
}

.grid {
  display: grid;
  gap: 20px;
  grid-template-columns: repeat(v-bind(gridColumns), 1fr);
}

.grid-carousel {
  grid-column: 1/3;
  grid-row: 1/3;
}

</style>