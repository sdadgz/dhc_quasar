<template>
  <div class="cont column">
    <!--  标题  -->
    <div class="col full-width row justify-between" style="margin-bottom: 10px">
      <span class="title">{{ second }}</span>
      <span class="sub-title" @click="goto(null)">更多>></span>
    </div>

    <!--  列  -->
    <q-list class="col">
      <q-item v-for="item in lists" v-ripple class="super-link" clickable @click="goto(item.id)">
        <q-item-section style="max-width: 10px;color: #999999">●</q-item-section>
        <q-item-section>
          <span>
          {{ item.title }}
          </span>
        </q-item-section>
        <q-item-section class="col-shrink">
          {{ setTime(item.createTime) }}
        </q-item-section>
      </q-item>
    </q-list>
  </div>
</template>

<script setup>

import {ref, watch} from "vue";
import {api} from "boot/axios";
import {EMPTY_STRING, ESSAY_UNIQUE_ID, HOME_LIST_MAX_SIZE, LEVER, SPLIT, UNDEFINED} from "components/MagicValue";
import {useRouter} from "vue-router";
import {init} from "components/Tools";

const $router = useRouter();

const props = defineProps(['secondIndex', 'firstIndex']);
const index = props.secondIndex;
const firstIndex = props.firstIndex;

const lists = ref([]); // 获取的内容

// 跳转
function goto(id) {
  gotoEssay(id, second.value);
}

// 跳转
function gotoEssay(id, field) {
  // let routeUrl = $router.resolve({
  //   path: '/' + headItems.value[firstIndex].label + LEVER + field,
  //   query: {[`${ESSAY_UNIQUE_ID}`]: id}
  // })
  // window.open(routeUrl.href, '_blank');
  $router.push('/' + headItems.value[firstIndex].label + LEVER + field + (id && '?id=' + id || ''));
}

// 获取列表分页
async function getContext() {
  // 轮播图特殊处理
  await api.get('/essay/page', {
    params: {
      currentPage: 1,
      pageSize: HOME_LIST_MAX_SIZE,
      field: first.value + SPLIT + second.value
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

let first = ref(EMPTY_STRING);
let second = ref(EMPTY_STRING);

const headItems = ref([]);

watch(() => headItems.value, () => {
  first.value = headItems.value[firstIndex].label;
  second.value = headItems.value[firstIndex].children[index].label;
  start();
}, {deep: true})

init(headItems);
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

.super-link {
  transition: all .3s ease-in-out;
}

.super-link:hover {
  color: rgb(17, 141, 241);
}

</style>
