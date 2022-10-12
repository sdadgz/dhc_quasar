<template>
  <div class="cont column">
    <!--  标题  -->
    <div class="full-width col row justify-between" style="margin-bottom: 10px">
      <span class="title">{{ second }}</span>
      <span class="sub-title" @click="goto(null)">更多>></span>
    </div>

    <!--  列  -->
    <q-list>
      <q-item v-for="item in lists" clickable v-ripple @click="goto(item.id)"
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

  </div>
</template>

<script setup>

import {HEAD_ITEMS} from "components/head-item";
import {ref} from "vue";
import {api} from "boot/axios";
import {ESSAY_UNIQUE_ID, HOME_LIST_MAX_SIZE, LEVER, SPLIT} from "components/MagicValue";
import {useRouter} from "vue-router";

const $router = useRouter();

const props = defineProps(['index']);
const index = props.index;
const first = HEAD_ITEMS[0].label;
const second = HEAD_ITEMS[0].children[index].label;

const lists = ref([]); // 获取的内容

// 跳转
function goto(id) {
  gotoEssay(id, second);
}

// 跳转
function gotoEssay(id, field) {
  let routeUrl = $router.resolve({
    path: '/' + HEAD_ITEMS[0].label + LEVER + field,
    query: {[`${ESSAY_UNIQUE_ID}`]: id}
  })
  window.open(routeUrl.href, '_blank');
}

// 获取列表分页
async function getContext() {
  // 轮播图特殊处理
  await api.get('/essay/page', {
    params: {
      currentPage: 1,
      pageSize: HOME_LIST_MAX_SIZE,
      field: first + SPLIT + second
    }
  }).then(res => {
    lists.value = res.data.lists;
  })
}

// 设置时间
function setTime(time) {
  const firstLever = time.indexOf('-') + 1;
  const mid = time.indexOf('T');
  return time.substring(firstLever, mid);
}

function start() {
  getContext();
}

start();
</script>

<style scoped>

.sub-title {
  font-weight: bold;
  margin-top: 8px;
  color: #125ca8;
  cursor: pointer;
  font-size: 14px;
}

.title {
  font-size: 24px;
  font-weight: bold;
  color: #125ca8;
}

.cont {
  width: 100%;
  margin: 0;
  padding: 30px 25px 25px;
}

.lis {
  line-height: 2rem;
}

.super-link {
  transition: all .3s ease-in-out;
}

.super-link:hover {
  color: rgb(17, 141, 241);
}

</style>
