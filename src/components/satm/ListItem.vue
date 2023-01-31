<template>
    <q-list>
      <!--   头   -->
      <q-item>
        <q-item-section class="text-primary text-h4 cursor-pointer" @click="goto(null)">
          <strong> {{ second }}</strong>
        </q-item-section>
      </q-item>
      <q-separator/>

      <!--   内容   -->
      <q-item v-for="item in lists" clickable>
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

// 传参
const props = defineProps(['secondIndex', 'firstIndex']);

// 刀
const $router = useRouter();

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
  $router.push('/' + headItems.value[firstIndex].label + LEVER + field +( !id ? '' : '?id=' + id));
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

</style>