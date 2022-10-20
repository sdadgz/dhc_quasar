<template>
  <div class="q-pa-md q-gutter-md row">

    <!--   图片表   -->
    <q-card style="width: 96%" class="q-pa-md">

      <!--   按钮     -->
      <q-card-section class="q-pa-md q-gutter-md">
        <q-btn label="刷新" icon="refresh" color="blue-14" @click="refreshImg"
               :loading="refreshImgBtnLoading"/>
        <q-btn label="新增" icon="edit" color="secondary" @click="showUpload = true"/>
        <q-btn label="恢复" icon="restore" color="green-13" @click="recoverImgTable"
               :loading="recoverBtnLoading"/>
        <q-btn label="删除" icon="delete_forever" color="red" @click="deleteImg"/>
        <q-btn label="重置" icon="autorenew" color="cyan" @click="resetImgTableHandler"
               :loading="resetBtnLoading"/>
        <q-btn label="全选" icon="checklist_rtl" color="blue" class="absolute"
               v-morph:true:selected:233.tween="imgSelectedBtnMorph" @click="imgSelectedAll"/>
        <q-btn label="取消选中" icon="rule" color="indigo-13" class="absolute"
               v-morph:false:selected:233.tween="imgSelectedBtnMorph" @click="imgUnSelectedAll"/>
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
                <q-card-section>
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

    </q-card>

    <!--   上传图片   -->
    <q-dialog v-model="showUpload">
      <q-card class="q-pa-md">

        <!--    标题    -->
        <q-card-section class="row justify-between">
          <strong>图片上传</strong>
          <q-btn icon="close" v-close-popup flat round dense/>
        </q-card-section>

        <!--    图片简介    -->
        <q-card-section>
          <q-input v-model="imgUploadTitle" placeholder="图片简介（可选）">
            <template #append>
              <q-icon
                @click="resetImgUploadTitle"
                name="close"
                v-if="imgUploadTitle && imgUploadTitle.length > 0"
                class="cursor-pointer"
              />
            </template>
          </q-input>
        </q-card-section>

        <!--    上传器    -->
        <q-card-section>
          <q-uploader
            ref="imgUploader"
            multiple
            accept="image/*"
            hide-upload-btn
            label="图片上传器"
            color="indigo"
            :factory="imgUploadFn"
            @finish="uploadDone = true;getImg()"
            @uploaded="imgUploadFinish"
          />
        </q-card-section>

        <!--    提交重置按钮    -->
        <q-card-section class="row justify-between">
          <q-btn label="重置" color="amber" @click="resetImgUploader" icon="clear_all"/>
          <q-btn label="上传" color="orange" @click="imgUploadHandler" icon="upload"/>
        </q-card-section>

      </q-card>
    </q-dialog>
  </div>

</template>

<script setup>

import {CommFail, CommSeccess, CommWarn, DeleteConform} from "components/notifyTools";
import {
  CAROUSEL_HEIGHT,
  CAROUSEL_WIDTH,
  DEFAULT_DELAY,
  EMPTY_STRING,
  IMG_PAGE_SIZE, PAGE_MAX, SPLIT,
  START_PAGE
} from "components/MagicValue";
import {api} from "boot/axios";
import {ref} from "vue";
import {IMG_COLUMNS} from "components/user/table";
import {getRows, getSelectedString, goto, init, repeatArr, sleep, subArr} from "components/Tools";
import {SERVER_NAME} from "components/Models";
import {useRoute, useRouter} from "vue-router";

const $router = useRouter();

// 展示弹窗
const showUpload = ref(false);

// 取消当前页选中
function imgUnSelectedAll() {
  imgSelected.value = subArr(imgSelected.value, imgRows.value);
}

// 选中当前页全部图片
function imgSelectedAll() {
  imgSelected.value.push(...imgRows.value);
}

// 重置按钮点击
function resetImgTableHandler() {
  resetBtnLoading.value = true;
  resetImgTable();
  getImg();
  setTimeout(() => {
    resetBtnLoading.value = false;
  }, DEFAULT_DELAY);
}

const refreshImgBtnLoading = ref(false);
const resetBtnLoading = ref(false);
const imgQuery = ref(EMPTY_STRING); // 图片查询
const pageMax = ref(PAGE_MAX);
const uploadDone = ref(false); // 上传完成

// 设置时间
function mySetTime(time) {
  const firstLever = time.indexOf('-') + 1;
  const mid = time.indexOf('T');
  return time.substring(firstLever, mid);
}

// 图片表刷新
async function refreshImg() {
  refreshImgBtnLoading.value = true;
  await resetImgSelected();
  await getImg();
  await sleep(DEFAULT_DELAY);
  refreshImgBtnLoading.value = false;
}

const recoverBtnLoading = ref(false);

// 图片表恢复按钮
function recoverImgTable() {
  recoverBtnLoading.value = true;
  if (imgSelected.value.length > 0) {
    recoverImg(imgSelected.value);
  } else {
    CommWarn("未选择图片");
  }

  setTimeout(() => {
    recoverBtnLoading.value = false;
  }, DEFAULT_DELAY);
}

// 图片表重置
function resetImgTable() {
  // 输入框重置
  imgQuery.value = EMPTY_STRING;
  resetImgSelected();
}

// 图片表重置选中
function resetImgSelected() {
  imgSelected.value = [];
}

// 删除图片被点击
function deleteImg() {
  DeleteConform(() => deleteImgHandler(getIdList(imgSelected.value)));
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
    CommSeccess("删除成功");
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
    CommSeccess("恢复成功");
  }).catch(res => {
    CommFail("恢复失败");
  }).then(res => {
    getImg();
  }).then(res => {
    resetImgTable();
  })
}

const imgColumns = ref(IMG_COLUMNS);
const imgUploadUrl = ref('/img/upload'); // 图片上传路径
const imgUploader = ref(null); // 图片上传器
const imgRows = ref([]);
const imgSelected = ref([]);
const imgTableLoading = ref(true);
const imgCurrentPage = ref(START_PAGE);
const imgPageTotal = ref(3);
const imgPageSize = ref(IMG_PAGE_SIZE);
const imgPagination = ref({rowsPerPage: imgPageSize.value})

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

// 当前页是否选中图片
function imgIsEmpty() {
  if (!imgSelected || !imgRows) {
    return true;
  }
  const selectedList = getIdList(imgSelected.value);
  const rowsList = getIdList(imgRows.value);
  return repeatArr(selectedList, rowsList);
}

// 获取数组中的idList
function getIdList(arr) {
  const res = [];
  arr.forEach(item => {
    res.push(item.id);
  })
  return res;
}

const imgSelectedBtnMorph = ref('true');

// 更新全选按钮model
function updateImgMorph() {
  imgSelectedBtnMorph.value = imgIsEmpty() ? 'true' : 'false';
}

// 图片分页点击
function imgPageHandler() {
  getImg();
}

// 重置图片上传器
function resetImgUploader() {
  resetImgUploadTitle();
  if (imgUploader) {
    imgUploader.value.reset();
  }
}

// 重置图片上传title
function resetImgUploadTitle() {
  imgUploadTitle.value = EMPTY_STRING;
}

// 上传图片按钮
function imgUploadHandler() {
  if (imgUploader) {
    imgUploader.value.upload();
  }
}

const imgUploadTitle = ref(EMPTY_STRING); // 图片上传简介

// 图片上传工厂
function imgUploadFn() {
  return new Promise(resolve => {
    resolve({
      "url": SERVER_NAME + imgUploadUrl.value,
      "formFields": [
        {
          "name": "reduceX",
          "value": CAROUSEL_WIDTH * 2
        },
        {
          'name': "reduceY",
          "value": CAROUSEL_HEIGHT * 2
        },
        {
          name: 'title',
          value: imgUploadTitle.value
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

// 图片上传之后
function imgUploadFinish(info) {
  const res = JSON.parse(info.xhr.response);
  if (res.code === '499') {
    // 未登录
    CommFail("未登录");
    $router.push("/user/login");
  } else if (res.code !== '200') {
    // 出现异常
    CommFail(res.msg);
  } else {
    // 正常处理
    CommSeccess("上传成功");
  }
}

// 初始化
function start() {
  getImg();
}

init(start);
</script>

<style scoped>

</style>
