<template>
  <!-- 手机独享 -->
  <div class="column mobile-only">
    <!--  轮播图  -->
    <div class="mobile-item col">
      <!--    轮播图    -->
      <q-carousel
          v-model="slide"
          class="full-width"
          height="56vw"
          infinite
          swipeable
          animated
          :autoplay="autoplay"
          :arrows="!autoplay"
          transition-prev="slide-right"
          transition-next="slide-left"
          @mouseenter="autoplay = false"
          @mouseleave="autoplay = true"
      >

        <!--     内容     -->
        <q-carousel-slide :name="item.id"
                          v-for="item in imgArr"
                          :img-src="item.img.reduceUrl"
                          class="cursor-pointer"
                          @click="carouselGoto(item.essayId)">
          <template v-slot>
            <div class="absolute-bottom carousel-text">
              {{ item.essay.title }}
            </div>
          </template>
        </q-carousel-slide>

        <!--    底下那个蓝白的格子      -->
        <template #control>
          <q-carousel-control position="bottom-right" :offset="[50,10]">
              <span v-for="index in imgArr"
                    class="pagination-box animated"
                    @click="slide = index.id"
                    :class="slide === index.id ? 'selected-box' : ''"/>
          </q-carousel-control>
        </template>
      </q-carousel>
    </div>

    <!--   中间双   -->
    <div class="row mobile-item col" style="background-color: white">
      <!--    菜单    -->
      <div class="col-auto">
        <q-list separator bordered>
          <q-item v-for="i in headItems.length"
                  clickable
                  style="background-color: #4a85e2;color: black"
                  :to="headItems[i-1].label">
            <q-item-section>
              {{ headItems[i - 1].label }}
            </q-item-section>
          </q-item>
        </q-list>
      </div>

      <!--    右侧单例    -->
      <div class="col">
        <ListItem style="margin: 0" :first-index="firstIndex" :second-index="1"/>
      </div>
    </div>

    <!--  其余  -->
    <div v-if="headItems && headItems[firstIndex]" class="col">
      <div class="mobile-item" v-for="i in headItems[firstIndex].children.length - 3">
        <ListItem style="margin: 0"
                  :first-index="firstIndex"
                  :second-index="i+1"/>
      </div>
    </div>
  </div>

  <!-- 桌面独享 -->
  <div class="flex row justify-center desktop-only">
    <div class="width-1200 col-auto">
      <div class="cont row overflow-hidden" :style="{height: CAROUSEL_HEIGHT+'px'}">
        <!--    轮播图    -->
        <q-carousel
            animated
            v-model="slide"
            infinite
            :autoplay="autoplay"
            :arrows="!autoplay"
            :style="{width: CAROUSEL_WIDTH+'px',height: CAROUSEL_HEIGHT+'px'}"
            class="col-auto"
            transition-prev="slide-right"
            transition-next="slide-left"
            @mouseenter="autoplay = false"
            @mouseleave="autoplay = true"
            swipeable
        >

          <!--     内容     -->
          <q-carousel-slide
              :name="item.id"
              v-for="item in imgArr"
              :img-src="item.img.reduceUrl || item.img.url"
              class="cursor-pointer"
              @click="carouselGoto(item.essayId)"
          >
            <template v-slot>
              <div class="absolute-bottom carousel-text">
                {{ item.essay.title }}
              </div>
            </template>
          </q-carousel-slide>

          <!--    底下那个蓝白的格子      -->
          <template #control>
            <q-carousel-control position="bottom-right" :offset="[50,10]">
              <span
                  v-for="index in imgArr"
                  class="pagination-box animated"
                  @click="slide = index.id"
                  :class="slide === index.id ? 'selected-box' : ''"
              />
            </q-carousel-control>
          </template>
        </q-carousel>

        <!--    落单的    -->
        <div class="col">
          <ListItem style="margin: 0" :first-index="firstIndex" :second-index="1"/>
        </div>
      </div>

      <!--    其余    -->
      <div
          v-if="headItems && headItems[0]"
          class="row q-py-md"
          style="display: grid;grid-template-columns: repeat(3, 1fr);grid-gap: 12px"
      >
        <div v-for="i in headItems[firstIndex].children.length - 3" class="bg-white">
          <ListItem :second-index="i + 1" :first-index="firstIndex"/>
        </div>
      </div>

      <!--   友情连接   -->
      <CardItem style="margin-top: 10px"/>
    </div>
  </div>
</template>

<script setup>

import {ref} from "vue";
import {api} from "boot/axios";
import {CAROUSEL_HEIGHT, CAROUSEL_WIDTH, EQ, ESSAY_UNIQUE_ID, LEVER} from "components/MagicValue";
import {goto, init} from "components/Tools";
import {useRoute, useRouter} from "vue-router";
import ListItem from "components/main/ListItem.vue";
import CardItem from "components/main/CardItem.vue";

const $route = useRoute();
const $router = useRouter();

// 首页一级索引
const firstIndex = ref(0);

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
  gotoEssay(id, headItems.value[0].children[0].label);
}

// 跳转
function gotoEssay(id, field) {
  let routeUrl = $router.resolve({
    path: '/' + headItems.value[0].label + LEVER + field,
    query: {[`${ESSAY_UNIQUE_ID}`]: id}
  })
  window.open(routeUrl.href, '_blank');
}

function start() {
  getCarousel();
}

const headItems = ref([]);

init(headItems, start);
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

.cont {
  background-color: white;
  margin: 20px 0 0;
}

.mobile-item {
  margin: 5px 10px;
}

</style>
