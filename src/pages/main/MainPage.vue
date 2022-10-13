<template>
  <div class="flex row justify-center">
    <div class="width-1200 col-auto">
      <div class="container">

        <!--    头部面包屑    -->
        <Header/>

        <!--    本体    -->
        <q-card flat square style="min-height: 50vh">
          <div v-if="!loading">

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

            <!--      展示友情连接      -->
            <div v-else-if="showFriendLink">
              <!--       标题       -->
              <h6 class="text-center text-h6" style="margin: 20px;font-size: 30px;font-weight: bold;
                color: #125ca8">
                友情链接
              </h6>

              <!--       链接       -->

            </div>

            <!--    展示分页    -->
            <div class="q-pa-md q-gutter-sm" v-else>
              <!--       标题       -->
              <div class="row" style="border-bottom: 1px solid #ddd;padding-bottom: 26px">
                <h3 class="page-title">{{ second === EMPTY_STRING ? first : second }}</h3>
              </div>

              <!--       分页列表       -->
              <q-list>
                <q-item v-for="item in lists" @click="pageItemHandler(item)" clickable v-ripple
                        class="super-link">
                  <q-item-section style="max-width: 10px;color: #999999">●</q-item-section>
                  <q-item-section>
                    {{ item.title }}
                  </q-item-section>
                  <q-item-section style="text-align: right">
                    {{ setTime(item.createTime) }}
                  </q-item-section>
                </q-item>
              </q-list>

              <!--      分页       -->
              <div class="q-pa-lg flex flex-center" v-if="pageTotal > 0">
                <q-pagination
                  :max="pageTotal"
                  direction-links
                  boundary-numbers
                  :max-pages="pageMax"
                  v-model="currentPage"
                  @click="pageHandler"
                />
              </div>

              <div v-else style="text-align: center;top: 10vh;position: relative">
                没有更多了
              </div>
            </div>
          </div>

          <q-inner-loading :showing="loading">
            <q-spinner-gears size="50px" color="primary"/>
          </q-inner-loading>
        </q-card>

      </div>
    </div>
  </div>
</template>

<script setup>

import Header from "components/main/Header.vue";
import {ref, watch} from "vue";
import {
  START_PAGE, EMPTY_STRING, PAGE_SIZE, SPLIT, UNDEFINED, PAGE_MAX, ESSAY_UNIQUE_ID
} from "components/MagicValue";
import {api} from "boot/axios";
import {SERVER_NAME} from "components/Models";
import {useRoute, useRouter} from "vue-router";
import {max, sleep, sub} from "components/Tools";
import {HEAD_ITEMS} from "components/main/head-item";

const $route = useRoute();
const $router = useRouter();

// 全局
const loading = ref(false);
const showEssay = ref(false);
const field = ref(UNDEFINED);
const first = ref($route.params.first);
const second = ref($route.params.second);

// 分页
const currentPage = ref(START_PAGE);
const pageSize = ref(PAGE_SIZE);
const lists = ref([]);
const pageTotal = ref(3);
const pageMax = ref(PAGE_MAX);

// 分页内容被点击
function pageItemHandler(item) {
  toEssayDetail(item);
}

// 文章
const title = ref(UNDEFINED);
const author = ref(UNDEFINED);
const createTime = ref(UNDEFINED);
const text = ref(UNDEFINED);

// 跳转到essay详情页
function toEssayDetail(essay) {
  $router.push({query: {[`${ESSAY_UNIQUE_ID}`]: essay.id}});
}

// 获取详情
async function getEssayDetail(id) {
  showEssay.value = true;
  await api.get('/essay/text', {
    params: {
      [`${ESSAY_UNIQUE_ID}`]: id
    }
  }).then(res => {
    const dataText = res.data.text;
    const dataEssay = res.data.essay;
    text.value = dataText;
    title.value = dataEssay.title;
    createTime.value = setEssayTime(dataEssay.createTime);
    author.value = dataEssay.user.name;
  })
}

// 设置时间
function setEssayTime(time) {
  const replace = time.replace('T', ' ');
  return replace.substring(0, replace.length - 3);
}

// 点击分页
function pageHandler() {
  getEssay();
}

// 设置时间
function setTime(time) {
  const firstLever = time.indexOf('-') + 1;
  const mid = time.indexOf('T');
  return time.substring(firstLever, mid);
}

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
async function getEssay() {
  loading.value = true;
  // 更新领域
  await setField();

  await api.get("/essay/page", {
    params: {
      "field": field.value,
      "currentPage": currentPage.value,
      "pageSize": pageSize.value
    }
  }).then(res => {
    if (res.data.total === 1) {
      // 显示文章
      const essay = res.data.lists[0];
      text.value = res.data.text;
      title.value = essay.title;
      author.value = essay.user.name;
      createTime.value = setEssayTime(essay.createTime);
      showEssay.value = true;
    } else {
      const dataLists = res.data.lists;
      const dataTotal = res.data.total;
      // 显示分页
      lists.value = dataLists;
      pageTotal.value = Math.ceil(dataTotal / pageSize.value);
      showEssay.value = false;
    }
  })
  loading.value = false;
}

// 获取轮播图
async function getCarousel() {
  loading.value = true;
  // 更新领域
  await setField();

  await api.get('/carousel/page', {
    params: {
      currentPage: currentPage.value,
      pageSize: pageSize.value
    }
  }).then(res => {
    const dataLists = res.data.lists;
    const dataTotal = res.data.total;
    // 显示分页
    const arr = [];
    dataLists.forEach(list => {
      const obj = {};
      Object.assign(obj, list.essay);
      Object.assign(obj, {id: list.essayId});
      arr.push(obj);
    })
    lists.value = arr;
    pageTotal.value = Math.ceil(dataTotal / pageSize.value);
    showEssay.value = false;
  })

  loading.value = false;
}

const showFriendLink = ref(false);

async function start() {
  loading.value = true;
  const id = $route.query[`${ESSAY_UNIQUE_ID}`];
  if (id) {
    await getEssayDetail(id);
  } else if (second.value === HEAD_ITEMS[0].children[0].label) {
    // 轮播图
    await getCarousel();
  } else if (second.value === HEAD_ITEMS[0].children[HEAD_ITEMS[0].children.length - 1].label) {
    // 友情连接
    showFriendLink.value = true;
  } else {
    await getEssay();
  }
  loading.value = false;
}

// 监控
watch(() => $route.fullPath, () => {
  start();
})

start();
</script>


<style scoped>

.super-link {
  transition: all .3s ease-in-out;
}

.super-link:hover {
  color: rgb(17, 141, 241);
}

.page-title {
  margin-left: 10px;
}

.page-title:before {
  content: "";
  display: inline-block;
  position: relative;
  left: -15px;
  top: 4px;
  bottom: 0;
  margin: auto;
  width: 10px;
  height: 30px;
  background: #125ca8;
}

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
