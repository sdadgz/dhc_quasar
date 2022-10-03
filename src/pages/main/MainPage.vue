<template>
  <div class="flex row justify-center">
    <div class="width-1200 col-auto">
      <div class="container">

        <!--    头部面包屑    -->
        <Header/>

        <!--    展示具体文章    -->
        <div v-if="showEssay">
          <!--     标题     -->
          <h3 class="title">{{ title }}</h3>
          <!--     副标题     -->
          <div class="sub-container">
            <span class="sub-title">信息来源：</span>
            <span class="sub-title">{{ author }}</span>
            <span class="sub-title">发布时间：</span>
            <span class="sub-title">{{ createTime }}</span>
          </div>
          <!--     内容     -->
          <div v-html="text" style="padding: 30px 20px"></div>
        </div>

        <!--    展示分页    -->
        <div class="q-pa-md q-gutter-sm" v-else>
          <h3 class="page-title">{{ second }}</h3>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>

import Header from "components/main/Header.vue";
import {ref, watch} from "vue";
import {CURRENT_PAGE, EMPTY_STRING, PAGE_SIZE, SPLIT, UNDEFINED} from "components/MagicValue";
import {api} from "boot/axios";
import {SERVER_NAME} from "components/Models";
import {useRoute, useRouter} from "vue-router";

const $route = useRoute();
const $router = useRouter();

const showEssay = ref(false);
const field = ref(UNDEFINED);
const currentPage = ref(CURRENT_PAGE);
const pageSize = ref(PAGE_SIZE);
const first = ref($route.params.first);
const second = ref($route.params.second);

const title = ref(UNDEFINED);
const author = ref(UNDEFINED);
const createTime = ref(UNDEFINED);
const text = ref(UNDEFINED);

// 设置essay领域
function setField() {
  first.value = $route.params.first;
  second.value = $route.params.second;

  let queryField = EMPTY_STRING;
  if (first.value) {
    queryField = first.value;
    if (second.value) {
      queryField += SPLIT + second.value;
    }
  }
  field.value = queryField;

}

// 获取essay
function getEssay() {
  // 更新领域
  setField();

  api.get(SERVER_NAME + "/essay/page", {
    params: {
      "field": field.value,
      "currentPage": currentPage.value,
      "pageSize": pageSize.value
    }
  }).then(res => {
    if (res.data.text) {
      // 显示文章
      text.value = res.data.text;
      showEssay.value = true;
    } else {
      // 显示分页
      showEssay.value = false;
    }
  })
}

function start() {
  getEssay();
}

// 监控
watch(() => $route.path, () => {
  start();
}, {immediate: true})

start();
</script>

<style scoped>

.sub-container {
  text-align: center;
}

.sub-title {
  color: #999;
  margin: 0 5px;
}

h3 {
  font-size: 30px;
  font-weight: bold;
  color: #125ca8;
  margin: 0;
}

.page-title:after {
  content: "";
  display: block;
  position: absolute;
  left: 0;
  top: 3px;
  bottom: 0;
  margin: auto;
  width: 10px;
  height: 30px;
  background: #125ca8;
}

.title {
  margin: 5px;
  line-height: 3.125rem;
  text-align: center;
}

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

<style>

/* 只能仍这里了，会出现样式污染 */
.document {
  font-size: 16px;
}

img {
  width: 100%;
}

</style>
