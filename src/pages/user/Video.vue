<template>
  <div class="q-pa-md row q-gutter-md">
    <!--   上传视频   -->
    <q-card class="q-pa-md">
      <!--    标题    -->
      <q-card-section>
        <strong>上传视频</strong>
      </q-card-section>

      <!--    用户输入标题    -->
      <q-card-section>
        <q-input v-model="videoInputTitle" placeholder="视频标题（默认文件名做为标题）">
          <template #append>
            <q-icon
                v-if="videoInputTitle && videoInputTitle.length >0"
                name="close"
                @click="resetVideoTitle" class="cursor-pointer"
            />
          </template>
        </q-input>
      </q-card-section>

      <!--    上传领域    -->
      <q-card-section class="row justify-between">
        <!--     一级     -->
        <div class="column col-auto">
          <span class="col-auto">一级标题</span>
          <q-btn-dropdown class="col-auto" color="secondary" :label="videoFirst">
            <q-list>
              <q-item
                  v-for="item in headItems"
                  v-close-popup
                  clickable
                  @click="videoFirst = item.label;resetVideoSecond()"
              >
                <q-item-section>{{ item.label }}</q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
        </div>

        <!--    二级      -->
        <div class="column col-auto">
          <span class="col-auto">二级标题</span>
          <q-btn-dropdown class="col-auto" color="info" :label="videoSecond">
            <q-list v-for="father in headItems">
              <div v-if="father.label === videoFirst">
                <q-item
                    v-for="item in father.children"
                    v-close-popup
                    clickable
                    @click="videoSecond = item.label"
                >
                  <q-item-section>{{ item.label }}</q-item-section>
                </q-item>
              </div>
            </q-list>
          </q-btn-dropdown>
        </div>
      </q-card-section>

      <!--    上传器    -->
      <q-card-section>
        <q-uploader
            ref="videoUploader"
            label="上传视频"
            accept="video/*"
            multiple
            hide-upload-btn
            @uploaded="uploadFinish"
            @finish="getFile();getEssay()" :factory="videoUploadFn"
        />
      </q-card-section>

      <!--    按钮    -->
      <q-card-section class="row justify-between">
        <q-btn label="重置" icon="clear_all" color="secondary" @click="resetVideo"/>
        <q-btn label="提交" icon="upload" color="blue-14" @click="commitVideoHandler"/>
      </q-card-section>

      <!--    tips    -->
      <q-card-section>关于：轮播图不在这里上传</q-card-section>
    </q-card>
  </div>
</template>

<script setup>

import {SERVER_NAME} from "components/Models";
import {ref, watch} from "vue";
import {CommFail, CommSeccess, CommWarn, DeleteConform} from "components/notifyTools";
import {useRouter} from "vue-router";
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
  goto, init,
  notNull, recoverHandler,
  repeatArr,
  setTime,
  sleep,
  subArr,
  uploadFinish
} from "components/Tools";

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
const fileRows = ref([]);
const fileCurrentPage = ref(START_PAGE);
const filePageTotal = ref(3);
const fileUploader = ref(); // 文件上传器
const videoFirst = ref(UNDEFINED);
const videoSecond = ref(UNDEFINED);

// 提交视频
function commitVideoHandler() {
  if (videoFirst.value === UNDEFINED) {
    CommWarn("未选择一级标题");
    return;
  }

  if (videoUploader) {
    videoUploader.value.upload();
  }
}

// 重置视频
function resetVideo() {
  resetVideoFirst();
  resetVideoSecond();
  resetVideoTitle();
  if (videoUploader) {
    videoUploader.value.reset();
  }
}

// 重置视频一级标题
function resetVideoFirst() {
  videoFirst.value = UNDEFINED;
}

// 重置视频二级标题
function resetVideoSecond() {
  videoSecond.value = UNDEFINED;
}

// 重置视频标题
function resetVideoTitle() {
  videoInputTitle.value = EMPTY_STRING;
}

const videoInputTitle = ref(EMPTY_STRING); // 用户上传输入标题
const videoUploader = ref(); // 视频上传器

// 视频上传工厂
function videoUploadFn() {
  return new Promise(resolve => {
    resolve({
      "url": SERVER_NAME + '/essay/video',
      "formFields": [
        {
          name: 'title',
          value: videoInputTitle.value
        },
        {
          name: 'field',
          value: videoFirst.value + (videoSecond.value === UNDEFINED ? '' : SPLIT + videoSecond.value)
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

const headItems = ref([]);

init(headItems, start);
</script>

<style scoped>

</style>
