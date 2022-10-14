<template>
  <div class="cont column">
    <!-- 标题 -->
    <div class="full-width col row justify-between" style="margin-bottom: 10px">
      <span class="title">友情连接</span>
      <span class="sub-title" @click="goto">更多>></span>
    </div>

    <!-- 列表 -->
    <div class="full-width">
      <q-list>
        <q-item v-for="item in lists" @click="goto(item.url)">
          <q-item-section>
            <q-img :src="item.src" :title="item.label"/>
          </q-item-section>
        </q-item>
      </q-list>
    </div>
  </div>
</template>

<script setup>

import {HEAD_ITEMS} from "components/main/head-item";
import {ESSAY_UNIQUE_ID, FRIEND_LINK_PAGE_SIZE, LEVER, START_PAGE} from "components/MagicValue";
import {useRouter} from "vue-router";
import {goto, setTime} from "components/Tools";
import {api} from "boot/axios";
import {ref} from "vue";

const $router = useRouter();

const currentPage = ref(START_PAGE);
const pageSize = ref(FRIEND_LINK_PAGE_SIZE);
const pageTotal = ref(3);
const lists = ref([]);

// 获取分页数据
async function getFriendLink() {
  await api.get('/friendLink/page', {
    params: {
      currentPage: currentPage.value,
      pageSize: pageSize.value
    }
  }).then(res => {
    const dataLists = res.data.lists;
    const dataTotal = res.data.total;

    lists.value = dataLists;
    pageTotal.value = Math.ceil(dataTotal / pageSize.value);
  })
}

function start() {
  getFriendLink();
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

.super-link {
  transition: all .3s ease-in-out;
}

.super-link:hover {
  color: rgb(17, 141, 241);
}

</style>
