<template>
  <div class="cont column">
    <!-- 标题 -->
    <div class="full-width col row justify-between" style="margin-bottom: 10px">
      <span class="title">友情连接</span>
      <span class="sub-title" @click="gotoMore">更多>></span>
    </div>

    <!-- 列表 -->
    <div class="full-width row">
      <div class="col-3 friend-link-card" v-for="item in lists">
        <img class="friend-link-item cursor-pointer" :src="item.img.url" :alt="item.label"
             @click="goto(item.url)"/>
      </div>
    </div>
  </div>
</template>

<script setup>

import {FRIEND_LINK_PAGE_SIZE, LEVER, START_PAGE} from "components/MagicValue";
import {useRouter} from "vue-router";
import {goto, init} from "components/Tools";
import {api} from "boot/axios";
import {ref} from "vue";

const $router = useRouter();

// 去更多
function gotoMore() {
  const first = headItems.value[0].label;
  const second = headItems.value[0].children[headItems.value[0].children.length - 1].label;
  $router.push('/' + first + LEVER + second);
}

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

const headItems = ref([]);

init(headItems, start);
</script>

<style scoped>

.friend-link-card {
  padding: 5px 15px;
}

.friend-link-item {
  width: 260px;
  height: 60px;
  border: 1px solid #ddd;
  vertical-align: middle;
}

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
