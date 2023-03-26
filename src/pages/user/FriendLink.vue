<template>
  <div class="q-pa-md row q-gutter-md">

    <!--   友情连接表   -->
    <q-card class="q-pa-md">

      <!--    按钮    -->
      <q-card-section class="q-pa-md q-gutter-md">
        <q-btn label="刷新" color="blue-14" icon="refresh" @click="friendLinkBtnHandler"
               :loading="friendLinkBtnLoading"/>
        <q-btn label="删除" color="red" icon="delete_forever" @click="deleteFriendLinkHandler"/>
        <q-btn label="新增" icon="edit" color="secondary" @click="showUpload = true"/>
      </q-card-section>

      <!--    表    -->
      <q-card-section>
        <q-card-section>
          <q-table
              title="视频"
              :columns="FRIEND_LINK_USE_COLUMNS"
              :rows="friendLinkRows"
              row-key="id"
              selection="multiple"
              hide-pagination
              v-model:selected="friendLinkSelected"
              :selected-rows-label="getSelectedString"
              :loading="friendLinkLoading"
              :pagination="friendLinkPagination"
          >

            <template #body="props">
              <q-tr :props="props" class="animated"
                    :style="{backgroundColor:props.selected ? '#e8e8e8' : '',transform: 'scale(1)'}">

                <!--         复选框         -->
                <q-td class="cursor-pointer">
                  <q-checkbox v-model="props.selected"/>
                </q-td>

                <!--        标题          -->
                <q-td key="title" :props="props" class="cursor-pointer" title="点击编辑">
                  {{ props.row.label }}
                  <q-popup-edit
                      v-model="props.row.label"
                      v-slot="scope"
                      title="修改标题"
                      @before-show="friendLinkBeforeShowTitle(props.row.label)"
                  >
                    <transition
                        appear
                        enter-active-class="animated zoomIn"
                        leave-active-class="animated zoomOut"
                    >
                      <div class="q-pa-md q-gutter-md">
                        <q-input v-model="friendLinkPopEdit" dense autofocus/>

                        <!--           提交重置按钮           -->
                        <div class="row justify-between">
                          <q-btn class="col-auto" @click="friendLinkBeforeShowTitle(props.row.label)"
                                 color="secondary" label="重置"/>
                          <q-btn class="col-auto" color="primary" label="提交"
                                 @click="updateFriendLink(friendLinkPopEdit,null,props.row.id)"
                                 v-close-popup/>
                        </div>
                      </div>
                    </transition>
                  </q-popup-edit>
                </q-td>

                <!--         地址         -->
                <q-td key="url" :props="props" class="cursor-pointer" title="点击编辑">
                  {{ props.row.url }}
                  <q-popup-edit
                      v-model="props.row.url"
                      v-slot="scope"
                      title="修改标题"
                      @before-show="friendLinkBeforeShowTitle(props.row.url)"
                  >
                    <transition
                        appear
                        enter-active-class="animated zoomIn"
                        leave-active-class="animated zoomOut"
                    >
                      <div class="q-pa-md q-gutter-md">
                        <q-input v-model="friendLinkPopEdit" dense autofocus/>

                        <!--           提交重置按钮           -->
                        <div class="row justify-between">
                          <q-btn class="col-auto" @click="friendLinkBeforeShowTitle(props.row.url)"
                                 color="secondary" label="重置"/>
                          <q-btn class="col-auto" color="primary" label="提交"
                                 @click="updateFriendLink(null,friendLinkPopEdit,props.row.id)"
                                 v-close-popup/>
                        </div>
                      </div>
                    </transition>
                  </q-popup-edit>
                </q-td>

                <!--         图片         -->
                <q-td key="img" :props="props" style="cursor: zoom-in" title="查看原图">
                  <q-img
                      :src="props.row[`img.reduceUrl`] !== null ?
                       props.row[`img.reduceUrl`] : props.row[`img.url`]"
                      width="300px" @click="goto(props.row[`img.url`])">
                    <div v-if="props.row[`img.isDelete`]" class="absolute-bottom text-center"
                         style="background-color: rgba(255,0,0,0.51)">
                      这张图片已被删除，但友情连接未被删除！！！
                    </div>
                  </q-img>
                </q-td>
              </q-tr>
            </template>
          </q-table>

          <!--     分页     -->
          <div class="q-pa-lg flex flex-center" v-if="friendLinkPageTotal > 0">
            <q-pagination
                :max="friendLinkPageTotal"
                direction-links
                boundary-numbers
                :max-pages="pageMax"
                v-model="friendLinkCurrentPage"
                @click="getFriendLink"
            />
          </div>

          <!--     加载     -->
          <q-inner-loading :showing="friendLinkLoading">
            <q-spinner-gears size="50px" color="primary"/>
          </q-inner-loading>

        </q-card-section>
      </q-card-section>

    </q-card>

    <q-dialog v-model="showUpload" full-width>

      <!--   图片表   -->
      <q-card class="q-pa-md">

        <!--    标题    -->
        <q-card-section class="row justify-between">
          <strong>视频</strong>
          <q-btn icon="close" dense round flat v-close-popup/>
        </q-card-section>

        <!--   图片表     -->
        <q-card-section>
          <q-table
              title="图片"
              :columns="imgColumns"
              :rows="imgRows"
              row-key="id"
              hide-pagination
              selection="multiple"
              v-model:selected="imgSelected"
              :selected-rows-label="getSelectedString"
              :loading="imgTableLoading"
              :pagination="imgPagination"
              grid
          >

            <template v-slot:top-right>
              <q-input model-value="" v-model="imgQuery" placeholder="搜索（简介）" @keyup.enter="getImg"
                       @blur="getImg" style="width: 233px;">
                <template v-slot:append>
                  <q-icon name="search" class="cursor-pointer" @click="getImg"/>
                  <q-icon v-if="imgQuery && imgQuery.length > 0" name="close" class="cursor-pointer"
                          @click="imgQuery = EMPTY_STRING"/>
                </template>
              </q-input>
            </template>

            <template v-slot:item="props">
              <div class="q-pa-md col-md-3 col-xs-12">
                <q-card
                    class="animated cursor-pointer"
                    :class="props.selected ? 'selected' : ''"
                    @click="props.selected = !props.selected"
                >
                  <q-card-section style="padding: 0">
                    <q-img
                        :src="props.row.reduceUrl === null ? props.row.url : props.row.reduceUrl"
                        :ratio="CAROUSEL_WIDTH / CAROUSEL_HEIGHT"
                    >
                      <div class="absolute-bottom text-center"
                           :style="{backgroundColor: props.row.isDelete ? 'rgba(255,0,0,.5)' : ''}">
                        <span>{{
                            (props.row.title === null ? '' : props.row.title) + SPLIT +
                            mySetTime(props.row.createTime) +
                            (props.row.isDelete ? " 已删除" : "")
                          }}</span>
                      </div>
                    </q-img>
                  </q-card-section>

                  <!--        弹出代理          -->
                  <q-popup-proxy context-menu>
                    <q-slide-transition appear>
                      <q-list separator style="background-color: hotpink">
                        <!--          查看原图            -->
                        <q-item clickable v-ripple @click="goto(props.row.url)" v-close-popup>
                          <q-item-section>
                            查看原图
                          </q-item-section>
                        </q-item>

                        <!--            删除            -->
                        <q-item v-if="!props.row.isDelete" clickable v-ripple v-close-popup
                                @click="deleteImgHandler([props.row.id])">
                          <q-item-section>
                            删除
                          </q-item-section>
                        </q-item>

                        <!--           恢复             -->
                        <q-item v-else clickable v-ripple @click="recoverImg([props.row])"
                                v-close-popup>
                          <q-item-section>
                            恢复
                          </q-item-section>
                        </q-item>
                      </q-list>
                    </q-slide-transition>
                  </q-popup-proxy>
                </q-card>
              </div>
            </template>

          </q-table>

          <!--     分页     -->
          <div class="q-pa-lg flex flex-center" v-if="imgPageTotal > 0">
            <q-pagination
                :max="imgPageTotal"
                direction-links
                boundary-numbers
                :max-pages="pageMax"
                v-model="imgCurrentPage"
                @click="imgPageHandler"
            />
          </div>

          <!--     加载     -->
          <q-inner-loading :showing="imgTableLoading">
            <q-spinner-gears size="50px" color="primary"/>
          </q-inner-loading>
        </q-card-section>

        <!--    悬浮title    -->
        <q-card-section>
          <q-input :rules="notNull" v-model="friendLinkLabel" placeholder="标题"/>
        </q-card-section>

        <!--    地址    -->
        <!--          <q-input :rules="notNull" v-model="friendLinkUrl" placeholder="友情连接地址"/>-->

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
          <q-btn label="重置" icon="clear_all" color="secondary" @click="resetFriendLink"/>
          <q-btn label="上传" icon="upload" color="primary" @click="commitFriendLink"/>
        </q-card-section>

        <!--   tips    -->
        <q-card-section>
          关于：上面图片表选中一个图片作为封面
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>

</template>

<script setup>

import {CommFail, CommSuccess, CommWarn, DeleteConform} from "components/notifyTools";
import {deleteHandler, getRows, goto, init, notNull, repeatArr, sleep} from "components/Tools";
import {ref, watch} from "vue";
import {
  CAROUSEL_HEIGHT,
  CAROUSEL_WIDTH,
  DEFAULT_DELAY,
  EMPTY_STRING,
  FRIEND_LINK_PAGE_SIZE, IMG_PAGE_SIZE, PAGE_MAX, PAGE_SIZE,
  SPLIT,
  START_PAGE,
  UNDEFINED,
  ZERO
} from "components/MagicValue";
import {api} from "boot/axios";
import {
  CAROUSEL_COLUMNS,
  ESSAY_COLUMNS,
  FILE_COLUMNS,
  FRIEND_LINK_COLUMNS,
  FRIEND_LINK_USE_COLUMNS,
  IMG_COLUMNS
} from "components/user/table";
import {SERVER_NAME, SERVER_PREFIX} from "components/Models";

// 修改友情链接为视频专区
const videoFirst = ref();
const videoSecond = ref();
const uploadDone = ref(false);
const videoEssayId = ref();

// 图片上传之后
function uploadFinish(info) {
  const res = JSON.parse(info.xhr.response);
  if (res.code === '499') {
    // 未登录
    CommFail("未登录");
    window.location.href = SERVER_PREFIX + '#/user/login';
  } else if (res.code !== '200') {
    // 出现异常
    CommFail(res.msg);
  } else {
    // 正常处理
    videoEssayId.value = res.data.id;
    api.get('/essay/text', {
      params: {
        id: res.data.id
      }
    }).then(r => {
      friendLinkUrl.value = r.data.text;
      uploadDone.value = true;
    })
    CommSuccess("上传成功");
  }
}

// 视频上传工厂
function videoUploadFn() {
  return new Promise(resolve => {
    resolve({
      "url": SERVER_NAME + '/essay/video',
      "formFields": [
        {
          name: 'title',
          value: friendLinkLabel.value
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

// 设置一二级标题
function setTitle() {
  videoFirst.value = headItems.value[0].label;
  videoSecond.value = headItems.value[0].children[headItems.value[0].children.length - 1].label;
}

// 上传弹窗
const showUpload = ref(false);

const imgPageSize = ref(IMG_PAGE_SIZE);

// 设置时间
function mySetTime(time) {
  const firstLever = time.indexOf('-') + 1;
  const mid = time.indexOf('T');
  return time.substring(firstLever, mid);
}

// 图片表重置
function resetImgTable() {
  // 输入框重置
  imgQuery.value = EMPTY_STRING;
  resetImgSelected();
}

// 删除图片
function deleteImgHandler(idList) {
  console.log(idList);
  if (idList.length < 1) {
    CommWarn("至少选一个啊");
    return;
  }
  api.delete('/img', {
    data: {
      idList: idList,
    }
  }).then(res => {
    CommSuccess("删除成功");
  }).catch(res => {
    CommFail("删除失败");
  }).then(res => {
    getImg();
    resetImgTable();
  })
}

// 恢复图片
function recoverImg(idList) {
  idList = getIdList(idList);
  api.put('/img', {
    idList: idList,
  }).then(res => {
    CommSuccess("恢复成功");
  }).catch(res => {
    CommFail("恢复失败");
  }).then(res => {
    getImg();
  }).then(res => {
    resetImgTable();
  })
}

const imgColumns = ref(IMG_COLUMNS);
const imgPagination = ref({rowsPerPage: imgPageSize.value})

// 图片分页点击
function imgPageHandler() {
  getImg();
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
const fileRows = ref([]);
const fileCurrentPage = ref(START_PAGE);
const filePageTotal = ref(3);
const fileUploader = ref(); // 文件上传器
const videoUploader = ref(); // 视频上传器
const friendLinkBtnLoading = ref(false);

// 删除友情连接
function deleteFriendLinkHandler() {
  DeleteConform(() => {
    const idList = getIdList(friendLinkSelected.value);
    deleteHandler(idList, '/friendLink', () => {
      getFriendLink();
      resetFriendLink();
    })
  })
}

// 刷新按钮
async function friendLinkBtnHandler() {
  friendLinkBtnLoading.value = true;
  await getFriendLink();
  await sleep(DEFAULT_DELAY);
  friendLinkBtnLoading.value = false;
}

const friendLinkRows = ref([]); // 友情连接行数据
const friendLinkSelected = ref([]); // 友情连接选中
const friendLinkLoading = ref(true);
const friendLinkPageSize = ref(FRIEND_LINK_PAGE_SIZE);
const friendLinkPagination = ref({rowsPerPage: friendLinkPageSize.value});
const friendLinkPageTotal = ref(3);
const friendLinkCurrentPage = ref(START_PAGE);
const friendLinkPopEdit = ref(EMPTY_STRING); // 友情连接弹出输入框

// 提交
function updateFriendLink(title, url, id) {
  api.put('/friendLink/update', {
    id: id,
    label: title,
    url: url,
  }).then(res => {
    CommSuccess("修改成功");
  }).catch(res => {
    CommFail("修改失败");
  }).then(res => {
    getFriendLink();
  })
}

// 友情连接弹出前
function friendLinkBeforeShowTitle(val) {
  friendLinkPopEdit.value = val;
}

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

const friendLinkLabel = ref(EMPTY_STRING); // 上传友情连接的label
const friendLinkUrl = ref(EMPTY_STRING); // 友情连接地址
const friendLinkImgId = ref(ZERO); // 友情连接图片

// 提交友情连接
async function commitFriendLink() {
  uploadDone.value = false;
  await videoUploader && videoUploader.value.upload();

  while (!uploadDone.value) {
    await sleep(2333);
  }

  // 未填写input
  if (friendLinkLabel.value.length <= 0 || friendLinkUrl.value.length <= 0) {
    CommWarn("请完善表单");
    return;
  }
  // 未选择图片
  if (imgSelected.value.length !== 1) {
    CommWarn("请选择一张图片");
    return;
  }

  // 设置imgId
  friendLinkImgId.value = imgSelected.value[0].id;

  // 上传
  api.post('/friendLink/upload', {
    label: friendLinkLabel.value,
    url: friendLinkUrl.value,
    imgId: friendLinkImgId.value,
    essayId: videoEssayId.value
  }).then(res => {
    CommSuccess("上传成功");
  }).catch(res => {
    CommFail("上传失败");
  }).then(res => {
    getFriendLink();
    resetFriendLink();
  })
}

// 重置友情连接标题
function resetFriendLinkLabel() {
  friendLinkLabel.value = EMPTY_STRING;
}

// 重置友情连接地址
function resetFriendLinkUrl() {
  friendLinkUrl.value = EMPTY_STRING;
}

// 重置友情连接
function resetFriendLink() {
  resetFriendLinkLabel();
  resetFriendLinkUrl();
  resetImgSelected();
  resetFriendLinkSelected();
}

function resetFriendLinkSelected() {
  friendLinkSelected.value = [];
}

// const carouselMorph = ref('true'); // 轮播图全选按钮变形

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
// const carouselSelected = ref([]);
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
// function carouselIsEmpty() {
//   if (!carouselSelected || !carouselRows) {
//     return true;
//   }
//   const s = getIdList(carouselSelected.value);
//   const r = getIdList(carouselRows.value);
//   return repeatArr(s, r);
// }

// 获取数组中的idList
function getIdList(arr) {
  const res = [];
  arr.forEach(item => {
    res.push(item.id);
  })
  return res;
}

// 图片表重置选中
function resetImgSelected() {
  imgSelected.value = [];
}

const imgUploader = ref(null); // 图片上传器
const imgRows = ref([]);
const imgSelected = ref([]);
const imgTableLoading = ref(true);
const imgCurrentPage = ref(START_PAGE);
const imgPageTotal = ref(3);

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
const pageMax = ref(PAGE_MAX);
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
  setTitle();
}

// 更新全选按钮model
function updateImgMorph() {
  imgSelectedBtnMorph.value = imgIsEmpty() ? 'true' : 'false';
}

// 更新轮播图全选按钮
// function updateCarouselMorph() {
//   carouselMorph.value = carouselIsEmpty() ? 'true' : 'false';
// }

// watch(() => carouselSelected.value, () => {
//   updateCarouselMorph();
// }, {deep: true})

watch(() => imgSelected.value, () => {
  updateImgMorph();
}, {deep: true})

const headItems = ref([]);

init(headItems, start);
</script>

<style scoped>

.animated {
  transition: all .35s ease-in-out;
}

.selected {
  background-color: #999999;
  transform: scale(0.9);
}

</style>
