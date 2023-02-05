<template>
  <q-list>
    <!--   头   -->
    <q-item>
      <q-item-section class="text-primary text-h4 cursor-pointer" @click="gotoContent(null)">
        <strong> {{ second }}</strong>
      </q-item-section>
    </q-item>
    <q-separator/>

    <!--   内容   -->
    <q-item v-for="item in lists" clickable @click="gotoContent(item.id)">
      <q-item-section style="max-width: 10px;color: #999999">●</q-item-section>
      <q-item-section>
        {{ item.title }}
      </q-item-section>
      <q-item-section style="text-align: right">
        {{ setTime(item.createTime) }}
      </q-item-section>
    </q-item>
  </q-list>
</template>

<script setup lang="ts">

import {useRouter} from "vue-router";
import {ref, watch} from "vue";
import {EMPTY_STRING, HOME_LIST_MAX_SIZE, LEVER, SPLIT} from "../MagicValue";
import {api} from "../../boot/axios";
import {init} from "../Tools";
import {ListItemsLength} from "./Satm";

// 传参
const props = defineProps(['firstIndex', 'secondIndex']);

// 刀
const $router = useRouter();

const firstIndex = props.firstIndex;
const secondIndex = props.secondIndex;

// 获取的内容
const lists = ref([]);

// 总跳转
function gotoContent(id) {
  $router.push('/satm/content' + (id ? '?id=' + id :
      '?field=' + headItems.value[firstIndex].label + SPLIT + headItems.value[firstIndex].children[secondIndex].label));
}

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
  $router.push('/' + headItems.value[firstIndex].label + LEVER + field + (!id ? '' : '?id=' + id));
}

// 获取列表分页
async function getContext() {
  // 轮播图特殊处理
  await api.get('/essay/page', {
    params: {
      currentPage: 1,
      pageSize: ListItemsLength,
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

let first = ref(EMPTY_STRING);
let second = ref(EMPTY_STRING);

function start() {
  getContext();
}

// 头
const headItems = ref([]);

// 监视
watch(() => headItems.value, () => {
  first.value = headItems.value[firstIndex].label;
  second.value = headItems.value[firstIndex].children[secondIndex].label;
  start();
}, {deep: true})

init(headItems);
</script>

<style scoped>

</style>