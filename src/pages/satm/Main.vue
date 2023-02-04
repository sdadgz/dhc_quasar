<template>
  <div class="q-pa-lg">
    <div class="container">
      <!--  第一个区域，视频区  -->
      <div class="new-grid q-mb-lg">
        <!--    轮播图容器，防止样式污染    -->
        <div>
          <q-responsive :ratio="16/9" style="width: 100%">
            <q-carousel
                ref="carouselRef"
                v-model="carouselCurrentId"
                class="rounded-borders shadow-6"
                infinite
                swipeable
                animated
                transition-prev="slide-right"
                transition-next="slide-left"
                :autoplay="carouselAutoPlay"
                :arrows="!carouselAutoPlay"
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
          </q-responsive>
        </div>

        <!--  其他所有  -->
        <div v-for="i in newVideoLength">
          <!--    组件，视频    -->
          <VideoCard
              ref="videoCardRef"
              v-if="videoList[i - 1]"
              :img="videoList[i - 1].img.reduceUrl || videoList[i - 1].img.url || ''"
              :label="videoList[i - 1].label || ''"
              :essay-id="videoList[i - 1].essayId"
          />
        </div>
      </div>
      <q-separator/>

      <!--  第一张图片  -->
      <div v-if="gridColumns > 2" class="grid-4-6 q-py-lg q-mb-lg">
        <transition enter-active-class="animated slideInLeft">
          <ListItem v-if="showFirst" :style="{padding: '40px ' + layoutPadding}" :first-index="0" :second-index="1"/>
          <div v-else v-intersection="showFirstHandler"/>
        </transition>
        <q-img :src="backgroundImg1" style="top: 30px;left: 100px" width="80%" height="90%"/>
      </div>
      <ListItem v-else class="q-mb-lg" :first-index="0" :second-index="1"/>
      <q-separator/>

      <!--  第二张图片  -->
      <div v-if="gridColumns > 2" class="grid-2 q-py-lg q-mb-lg">
        <q-img :src="backgroundImg2" style="top: 40px" width="70%"/>
        <transition enter-active-class="animated slideInRight">
          <ListItem v-if="showSecond" :style="{padding: '40px ' + layoutPadding}" :first-index="0" :second-index="2"/>
          <div v-else v-intersection="showSecondHandler"/>
        </transition>
      </div>
      <ListItem class="q-mb-lg" v-else :first-index="0" :second-index="2"/>

      <!--   其他所有   -->
      <div :class="gridColumns > 2 && 'grid-2'" v-if="headItems[0]">
        <ListItem
            v-for="i in headItems[0].children.length - headItemUseCount"
            class="q-mb-lg"
            :class="gridColumns > 2 && 'q-pa-lg'"
            :first-index="0"
            :second-index="headItemStartIndex + i - 1"
        />
      </div>

      <!--   其他视频   -->
      <div class="grid" v-if="videoList.length">
        <div v-for="i in videoList.length - newVideoLength">
          <!--    组件，视频    -->
          <VideoCard
              v-if="videoList[i - 1 + newVideoLength]"
              :img="videoList[i - 1 + newVideoLength].img.reduceUrl || videoList[i - 1 + newVideoLength].img.url || ''"
              :label="videoList[i - 1 + newVideoLength].label || ''"
              :essay-id="videoList[i - 1 + newVideoLength].essayId"
          />
        </div>
      </div>

      <!--  todo 页脚   -->
    </div>
  </div>
</template>

<script setup lang="ts">

import {api} from "../../boot/axios";
import {onMounted, onUpdated, ref, watch} from "vue";
import {init} from "../../components/Tools";
import {useQuasar} from "quasar";
import {useRouter} from "vue-router";
import VideoCard from "../../components/satm/VideoCard.vue";
import {VideoDefaultCurrentPage, VideoDefaultPageSize} from "../../components/satm/Satm";
import {Head} from "../../components/main/head-item";
import {SERVER_NAME, STATIC_SRC} from "../../components/Models";
import ListItem from "../../components/satm/ListItem.vue";

// 刀
const $q = useQuasar();
const $router = useRouter();

// 两个图片 和 其他所有 =========================================================
const backgroundImg1 = SERVER_NAME + STATIC_SRC + 'background_img_1.png';
const backgroundImg2 = SERVER_NAME + STATIC_SRC + 'background_img_2.png';
const showFirst = ref(false);
const showSecond = ref(false);

// 第一个图片旁边的列表监听
function showFirstHandler(res) {
  showFirst.value = res.isIntersecting;
}

// 第一个图片旁边的列表监听
function showSecondHandler(res) {
  showSecond.value = res.isIntersecting;
}

// 轮播图 ==============================================================
const carouselCurrentId = ref();
const carouselArray = ref([]);
const carouselAutoPlay = ref(true);

// 轮播图ref
const carouselRef = ref();

// const carouselHeight = ref('100%');

// 获取轮播图
function getCarousel() {
  api.get('/carousel').then(res => {
    carouselArray.value = res.data;
    carouselCurrentId.value = carouselArray.value[0].id;
  })
}

// 获取轮播图高度
function setCarouselHeight(): string {
  return carouselRef.value && String(carouselRef.value.$el.offsetWidth / 16 * 9) + 'px' || '100%';
}

// 视频 =================================================================
const videoList = ref([]);

// 最上面显示几条视频
// const videoLength = ref(0);
const newVideoLength = ref(0);

// 视频的ref
const videoCardRef = ref();

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

// 首页多少个已被使用
const headItemUseCount = 4;
const headItemStartIndex = 3;

// 网格列数
const gridColumns = ref(2);
const newGridColumns = ref(3);
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
  newGridColumns.value = value < 1000 && 1 || value < 1500 && 2 || 3;
  gridColumns.value = value < 1000 && 2 || value < 1100 && 3 || value < 1500 && 4 || 5;
  layoutPadding.value = gridColumns.value < 5 ? '0' : '100px';
  // videoLength.value = gridColumns.value === 5 && 6 || gridColumns.value === 4 && 4 || gridColumns.value < 4 && 2;
  newVideoLength.value = newGridColumns.value - 1;
  // carouselHeight.value = setCarouselHeight();
}, {immediate: true})

// 头
const headItems = ref([] as Head[]);

init(headItems, start);
//
// // 生命周期钩子
// onMounted(() => {
//   carouselHeight.value = setCarouselHeight();
// })
//
// onUpdated(()=>{
//   carouselHeight.value = setCarouselHeight();
// })
</script>

<style scoped>

.container {
  margin: 0 auto;
  max-width: calc(1920 + 2 * v-bind(layoutPadding));
  padding: 0 v-bind(layoutPadding);
}

.new-grid {
  display: grid;
  gap: 20px;
  grid-template-columns: repeat(v-bind(newGridColumns), 1fr);
}

.grid {
  display: grid;
  gap: 20px;
  grid-template-columns: repeat(v-bind(gridColumns), 1fr);
}

.grid-carousel {
  grid-column: 1/3;
  grid-row: 1/3;
  position: relative;
}

.grid-2 {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-gap: 20px;
}

.grid-4-6 {
  display: grid;
  grid-template-columns: 4fr 6fr;
  grid-gap: 20px;
}

</style>