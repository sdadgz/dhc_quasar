<template>
  <div class="row q-pa-md q-gutter-md">

    <!--   文件表   -->
    <q-card class="q-pa-md">
      <!--    按钮    -->
      <q-card-section class="q-pa-md q-gutter-md">
        <q-btn label="刷新" icon="refresh" color="blue-14" @click="fileRefreshHandler"
               :loading="fileRefreshBtnLoading"/>
        <q-btn label="新增" icon="edit" color="secondary" @click="showUpload = true"/>
        <q-btn label="恢复" icon="restore" color="green-13"
               @click="fileRecoverHandler(getIdList(fileSelected))"/>
        <q-btn label="删除" icon="delete_forever" color="red"
               @click="fileDeleteHandler(getIdList(fileSelected))"/>
      </q-card-section>

      <!--    文件表    -->
      <q-card-section>
        <q-table
          title="文件"
          :columns="FILE_COLUMNS"
          :rows="fileRows"
          row-key="id"
          hide-pagination
          selection="multiple"
          v-model:selected="fileSelected"
          :selected-rows-label="getSelectedString"
          :loading="fileLoading"
          :pagination="pagination">

          <template #body="props">
            <q-tr :props="props" class="animated"
                  :style="{backgroundColor:props.selected ? '#e8e8e8' : '',transform: 'scale(1)'}">

              <!--        复选框        -->
              <q-td class="cursor-pointer">
                <q-checkbox v-model="props.selected"/>
              </q-td>

              <!--        标题        -->
              <q-td key="title" :props="props">
                {{ props.row.originalFilename }}
              </q-td>

              <!--        地址        -->
              <q-td key="url" :props="props">
                <q-btn label="点我复制链接" icon="content_copy" @click="copy(props.row.url)"
                       color="blue-12"/>
              </q-td>

              <!--       切换状态         -->
              <q-td key="isDelete" :props="props">
                <q-btn v-if="!props.row.isDelete" label="点我删除" icon="delete_forever" color="red"
                       @click="fileDeleteHandler([props.row.id])"/>
                <q-btn v-else label="点我恢复" icon="restore" color="green"
                       @click="fileRecoverHandler([props.row.id])"/>
              </q-td>

              <!--       上传时间         -->
              <q-td>
                {{ setTime(props.row.createTime, '011110') }}
              </q-td>

            </q-tr>
          </template>

        </q-table>
      </q-card-section>
    </q-card>

    <q-dialog v-model="showUpload">

      <!--   上传文件   -->
      <q-card class="q-pa-md">
        <!--    标题    -->
        <q-card-section class="row justify-between">
          <strong>上传文件</strong>
          <q-btn icon="close" dense round flat v-close-popup/>
        </q-card-section>

        <!--    标题    -->
        <q-card-section>
          <q-input v-model="fileTitle" placeholder="文件标题（默认文件名作为标题）">
            <template #append v-if="fileTitle && fileTitle.length > 0">
              <q-icon name="close" class="cursor-pointer" @click="resetFileTitle"/>
            </template>
          </q-input>
        </q-card-section>

        <!--    上传器    -->
        <q-card-section>
          <q-uploader label="上传文件" ref="fileUploader" multiple hide-upload-btn @uploaded="uploadFinish"
                      @finish="getFile" :factory="fileUploadFn"/>
        </q-card-section>

        <!--    按钮    -->
        <q-card-section class="row justify-between">
          <q-btn label="重置" icon="clear_all" color="secondary" @click="resetFile"/>
          <q-btn label="提交" icon="upload" color="blue-14" @click="commitFile"/>
        </q-card-section>
      </q-card>

    </q-dialog>
  </div>
</template>

<script setup>

import {SERVER_NAME} from "components/Models";
import {ref, watch} from "vue";
import {CommFail, CommSuccess, CommWarn, DeleteConform} from "components/notifyTools";
import {useRouter} from "vue-router";
import {HEAD_ITEMS} from "components/main/head-item";
import {
  CAROUSEL_HEIGHT,
  CAROUSEL_WIDTH,
  CODE_200,
  DEFAULT_DELAY,
  EMPTY_STRING, FRIEND_LINK_PAGE_SIZE,
  HOME,
  IMG_PAGE_SIZE,
  PAGE_MAX,
  PAGE_SIZE,
  SPLIT,
  START_PAGE,
  UNDEFINED,
  ZERO
} from "components/MagicValue";
import {api} from "boot/axios";
import {
  CAROUSEL_COLUMNS,
  ESSAY_COLUMNS, FILE_COLUMNS,
  FRIEND_LINK_COLUMNS,
  FRIEND_LINK_USE_COLUMNS,
  IMG_COLUMNS
} from "components/user/table";
import {useQuasar} from "quasar";
import {
  copy,
  deleteHandler,
  getRows,
  goto,
  notNull, recoverHandler,
  repeatArr,
  setTime,
  sleep,
  subArr,
  uploadFinish
} from "components/Tools";

// 展示弹窗上传
const showUpload = ref(false);

// 点击删除
function fileDeleteHandler(idList) {
  DeleteConform(() => {
    deleteHandler(idList, '/file', () => {
      getFile();
      resetFileSelected();
    })
  })
}

// 点击恢复
function fileRecoverHandler(idList) {
  recoverHandler(idList, '/file', () => {
    getFile();
    resetFileSelected();
  })
}

// 重置文件选中
function resetFileSelected() {
  fileSelected.value = [];
}

const fileRefreshBtnLoading = ref(false);

// 点击刷新
async function fileRefreshHandler() {
  fileRefreshBtnLoading.value = true;
  await getFile();
  await sleep(DEFAULT_DELAY);
  fileRefreshBtnLoading.value = false;
}

// 获取文件
async function getFile() {
  fileLoading.value = true;
  await api.get('/file/page', {
    params: {
      currentPage: fileCurrentPage.value,
      pageSize: pageSize.value,
      title: filePageTitle.value
    }
  }).then(res => {
    const lists = res.data.lists;
    const total = res.data.total;

    fileRows.value = getRows(lists, FILE_COLUMNS);
    filePageTotal.value = Math.ceil(total / pageSize.value);
  })
  fileLoading.value = false;
}

const filePageTitle = ref(EMPTY_STRING);
const fileLoading = ref(true);
const fileSelected = ref([]);
const fileRows = ref([]);
const fileCurrentPage = ref(START_PAGE);
const filePageTotal = ref(3);

const fileUploader = ref(); // 文件上传器
const fileTitle = ref(EMPTY_STRING); // 文件标题

// 上传文件
function commitFile() {
  if (fileUploader) {
    fileUploader.value.upload();
  }
}

// 重置文件
function resetFile() {
  resetFileTitle();
  if (fileUploader) {
    fileUploader.value.reset();
  }
}

// 重置文件标题
function resetFileTitle() {
  fileTitle.value = EMPTY_STRING;
}

const videoUploader = ref(); // 视频上传器

// 文件上传工厂
function fileUploadFn() {
  return new Promise(resolve => {
    resolve({
      "url": SERVER_NAME + '/file/upload',
      "formFields": [
        {
          name: 'title',
          value: fileTitle.value
        }
      ],
      "fieldName": "file",
      "headers": [{
        "name": "token",
        "value": localStorage.getItem("token")
      }]
    })
  })
}

const friendLinkRows = ref([]); // 友情连接行数据
const friendLinkLoading = ref(true);
const friendLinkPageSize = ref(FRIEND_LINK_PAGE_SIZE);
const friendLinkPageTotal = ref(3);
const friendLinkCurrentPage = ref(START_PAGE);

// 获取友情连接
async function getFriendLink() {
  friendLinkLoading.value = true;

  await api.get('/friendLink/page', {
    params: {
      currentPage: friendLinkCurrentPage.value,
      pageSize: friendLinkPageSize.value
    }
  }).then(res => {
    const lists = res.data.lists;
    const total = res.data.total;

    friendLinkRows.value = getRows(lists, FRIEND_LINK_COLUMNS);
    friendLinkPageTotal.value = Math.ceil(total / friendLinkPageSize.value);
  })

  friendLinkLoading.value = false;
}

const carouselMorph = ref('true'); // 轮播图全选按钮变形

// 获取轮播图
async function getCarousel() {
  carouselTableLoading.value = true;

  await api.get('/carousel/page', {
    params: {
      currentPage: carouselCurrentPage.value,
      pageSize: carouselPageSize.value,
      title: (carouselQuery.value === EMPTY_STRING ? null : carouselQuery.value)
    }
  }).then(res => {
    const lists = res.data.lists;
    const total = res.data.total;

    carouselRows.value = getRows(lists, CAROUSEL_COLUMNS);
    carouselPageTotal.value = Math.ceil(total / carouselPageSize.value);

  })

  carouselTableLoading.value = false;
}

const carouselCurrentPage = ref(START_PAGE);
const carouselPageTotal = ref(3);
const carouselPageSize = ref(PAGE_SIZE);
const carouselQuery = ref(EMPTY_STRING);
const carouselRows = ref([]);
const carouselSelected = ref([]);
const carouselTableLoading = ref(true);
const imgQuery = ref(EMPTY_STRING); // 图片查询
const imgSelectedBtnMorph = ref('true');

// 当前页是否选中图片
function imgIsEmpty() {
  if (!imgSelected || !imgRows) {
    return true;
  }
  const selectedList = getIdList(imgSelected.value);
  const rowsList = getIdList(imgRows.value);
  return repeatArr(selectedList, rowsList);
}

// 当前页是否选中轮播图
function carouselIsEmpty() {
  if (!carouselSelected || !carouselRows) {
    return true;
  }
  const s = getIdList(carouselSelected.value);
  const r = getIdList(carouselRows.value);
  return repeatArr(s, r);
}

// 获取数组中的idList
function getIdList(arr) {
  const res = [];
  arr.forEach(item => {
    res.push(item.id);
  })
  return res;
}

const imgUploader = ref(null); // 图片上传器
const imgRows = ref([]);
const imgSelected = ref([]);
const imgTableLoading = ref(true);
const imgCurrentPage = ref(START_PAGE);
const imgPageTotal = ref(3);
const imgPageSize = ref(IMG_PAGE_SIZE);

// 获取图片
async function getImg() {
  imgTableLoading.value = true;

  await api.get('/img/page', {
    params: {
      "currentPage": imgCurrentPage.value,
      "pageSize": imgPageSize.value,
      title: imgQuery.value === EMPTY_STRING ? null : imgQuery.value
    }
  }).then(res => {
    const lists = res.data.lists;
    const total = res.data.total;

    imgRows.value = getRows(lists, IMG_COLUMNS);

    imgPageTotal.value = Math.ceil(total / imgPageSize.value);

  }).then(res => {
    imgTableLoading.value = false;
    updateImgMorph();
  })
}

// 分页表内
const essayId = ref(ZERO);

// 分页表
const tableLoading = ref(true); // 表格加载状态
const pageSize = ref(PAGE_SIZE);
const pagination = ref({rowsPerPage: pageSize.value}) // 表格显示的最大数量
const selected = ref([]);
const rows = ref([]);
const queryField = ref(EMPTY_STRING);
const pageTotal = ref(3);
const currentPage = ref(START_PAGE);

// 获取essay
async function getEssay() {
  tableLoading.value = true;

  await api.get('/field', {
    params: {
      "field": queryField.value,
      "currentPage": currentPage.value,
      "pageSize": pageSize.value
    }
  }).then(res => {
    const lists = res.data.lists;
    const total = res.data.total;

    // 表格数据
    rows.value = getRows(lists, ESSAY_COLUMNS);

    // 总数
    pageTotal.value = Math.ceil(total / pageSize.value);

  })

  tableLoading.value = false;
}

// 已选几项
function getSelectedString(e) {
  return `已选择${e}项`;
}

const essayUploader = ref(null); // 文章上传器

function start() {
  getCarousel();
  getImg();
  getEssay();
  getFriendLink();
  getFile();
}

// 更新全选按钮model
function updateImgMorph() {
  imgSelectedBtnMorph.value = imgIsEmpty() ? 'true' : 'false';
}

// 更新轮播图全选按钮
function updateCarouselMorph() {
  carouselMorph.value = carouselIsEmpty() ? 'true' : 'false';
}

watch(() => carouselSelected.value, () => {
  updateCarouselMorph();
}, {deep: true})

watch(() => imgSelected.value, () => {
  updateImgMorph();
}, {deep: true})

start();
</script>

<style scoped>

</style>
