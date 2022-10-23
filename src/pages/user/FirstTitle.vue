<template>
  <div class="q-pa-md q-gutter-md row">
    <q-card class="q-pa-md">

      <!--   一堆按钮   -->
      <q-card-section class="q-pa-md q-gutter-md">
        <q-btn label="刷新" icon="refresh" color="blue-14"/>
      </q-card-section>

      <!--   表   -->
      <q-card-section>

        <!--    表    -->
        <q-table title="一级标题" :columns="FIRST_TITLE_COLUMNS" :rows="firstTitleRows" row-key="id"
                 hide-pagination selection="multiple" v-model:selected="firstTitleSelected"
                 :loading="firstTitleLoading" :pagination="firstTitlePagination"
                 :selected-rows-label="getSelectedString">

        </q-table>

        <!--     加载     -->
        <q-inner-loading :showing="firstTitleLoading">
          <q-spinner-gears size="50px" color="primary"/>
        </q-inner-loading>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>

import {ref} from "vue";
import {FIRST_TITLE_COLUMNS} from "components/user/table";
import {getRows, getSelectedString, init} from "components/Tools";
import {PAGE_SIZE, START_PAGE} from "components/MagicValue";
import {api} from "boot/axios";

const firstTitlePageSize = ref(PAGE_SIZE);
const firstTitleRows = ref([]);
const firstTitleLoading = ref(true);
const firstTitleSelected = ref([]);
const firstTitlePagination = ref({rowsPerPage: firstTitlePageSize.value});
const currentPage = ref(START_PAGE);
const pageTotal = ref(3);

// 获取一级标题
async function getFirstTitle() {
  firstTitleLoading.value = true;

  await api.get('/firstTitle', {
    params: {
      currentPage: currentPage.value,
      pageSize: firstTitlePageSize.value
    }
  }).then(res => {
    const lists = res.data.lists;
    const total = res.data.total;

    firstTitleRows.value = getRows(lists, FIRST_TITLE_COLUMNS);
    pageTotal.value = Math.ceil(total / firstTitlePageSize.value);
  })

  firstTitleLoading.value = false;
}

function start() {
  getFirstTitle();
}

init(start);
</script>

<style scoped>

</style>
