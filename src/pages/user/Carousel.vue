<template>
  <div class="row q-pa-md q-gutter-md">

    <!--   轮播图表   -->
    <q-card class="q-pa-md" style="width: 96%">

      <!--    标题    -->
      <q-card-section><strong>轮播图</strong></q-card-section>

      <!--    按钮    -->
      <q-card-section class="q-pa-md q-gutter-md">
        <q-btn label="刷新" color="blue-14" icon="refresh" :loading="carouselRefreshBtnLoading"
               @click="carouselRefreshBtnHandler"/>
        <q-btn label="新增" icon="edit" color="secondary" @click="showUpload = true"/>
        <q-btn label="删除" color="red" icon="delete_forever" @click="carouselDeleteHandler"/>
        <q-btn label="重置" icon="autorenew" color="cyan" @click="carouselResetBtnHandler"
               :loading="carouselResetBtnLoading"/>
        <q-btn label="全选" icon="checklist_rtl" color="blue" class="absolute"
               v-morph:true:carousel:233.tween="carouselMorph" @click="carouselSelectRows"/>
        <q-btn label="取消选中" icon="rule" color="indigo-13" class="absolute"
               v-morph:false:carousel:233.tween="carouselMorph" @click="carouselUnSelectRows"/>
      </q-card-section>

      <!--    表格    -->
      <q-card-section>
        <q-table title="轮播图" :columns="carouselColumns" :rows="carouselRows" row-key="id"
                 hide-pagination selection="multiple" v-model:selected="carouselSelected"
                 :selected-rows-label="getSelectedString" grid :pagination="carouselPagination"
                 :loading="carouselTableLoading">

          <!--      右上      -->
          <template v-slot:top-right>
            <q-input v-model="carouselQuery" placeholder="搜索（文章标题）" @keyup.enter="getCarousel"
                     @blur="getCarousel" style="width: 233px;">
              <template v-slot:append>
                <q-icon name="search" class="cursor-pointer" @click="getCarousel"/>
                <q-icon name="close" class="cursor-pointer" @click="carouselQuery = EMPTY_STRING"
                        v-if="carouselQuery && carouselQuery.length > 0"/>
              </template>
            </q-input>
          </template>

          <!--      卡片      -->
          <template v-slot:item="props">
            <div class="q-pa-md col-md-3 col-xs-12">
              <q-card
                class="animated cursor-pointer"
                :class="props.selected ? 'selected' : ''"
                @click="props.selected = !props.selected"
              >
                <q-card-section style="padding: 0">
                  <q-img
                    :src="props.row['img.reduceUrl'] === null ?
                     props.row['img.url'] : props.row['img.reduceUrl']"
                    :ratio="CAROUSEL_WIDTH / CAROUSEL_HEIGHT"
                  >
                    <div class="absolute-bottom text-center"
                         :style="{backgroundColor: props.row['img.isDelete'] ? 'rgba(255,0,0,.5)' : ''}">
                        <span>
                          {{
                            props.row['img.isDelete'] ?
                              '这张图片已被删除，但轮播图未被删除！！！' : props.row['essay.title']
                          }}
                        </span>
                    </div>
                  </q-img>
                </q-card-section>

                <!--        弹出代理          -->
                <q-popup-proxy context-menu>
                  <q-slide-transition appear>
                    <q-list separator>
                      <!--          查看原图            -->
                      <q-item clickable v-ripple @click="goto(props.row['img.url'])">
                        <q-item-section>
                          查看原图
                        </q-item-section>
                      </q-item>

                      <!--           删除             -->
                      <q-item clickable v-ripple @click="deleteCarousel([props.row.id])">
                        <q-item-section>删除</q-item-section>
                      </q-item>
                    </q-list>
                  </q-slide-transition>
                </q-popup-proxy>
              </q-card>
            </div>
          </template>

        </q-table>

        <!--     分页     -->
        <div class="q-pa-lg flex flex-center" v-if="carouselPageTotal > 0">
          <q-pagination
            :max="carouselPageTotal"
            direction-links
            boundary-numbers
            :max-pages="pageMax"
            v-model="carouselCurrentPage"
            @click="getCarousel"
          />
        </div>

        <!--     加载     -->
        <q-inner-loading :showing="carouselTableLoading">
          <q-spinner-gears size="50px" color="primary"/>
        </q-inner-loading>
      </q-card-section>

    </q-card>

    <!--   弹出新增   -->
    <q-dialog v-model="showUpload" full-width>
      <q-card style="width: 96vw" class="q-pa-md">

        <!--    标题    -->
        <q-card-section class="row justify-between">
          <strong>轮播图上传</strong>
          <q-btn icon="close" dense round v-close-popup flat/>
        </q-card-section>

        <!--    表格    -->
        <q-card-section>
          <q-table
            title="文章"
            :columns="columns"
            :rows="rows"
            row-key="id"
            hide-pagination
            selection="multiple"
            v-model:selected="selected"
            :selected-rows-label="getSelectedString"
            :loading="tableLoading"
            :pagination="pagination"
          >

            <template v-slot:top-right>
              <q-input model-value="" v-model="queryField" placeholder="搜索（位置）" @blur="searchEssay"
                       @keyup.enter="searchEssay" style="width: 233px">
                <template v-slot:append>
                  <q-icon name="search" class="cursor-pointer" @click="searchEssay"/>
                  <q-icon v-if="queryField && queryField.length > 0" name="close" class="cursor-pointer"
                          @click="queryField = EMPTY_STRING"/>
                </template>
              </q-input>
            </template>

            <!--      标题      -->
            <template v-slot:body-cell-title="props">
              <q-td :props="props" class="cursor-pointer" title="点击编辑">
                {{ props.value }}
                <q-popup-edit
                  v-model="props.row.title"
                  v-slot="scope"
                  title="修改标题"
                  @before-show="beforeShowHandler(props.row[`essay.title`],props.row.essayId)"
                >
                  <transition
                    appear
                    enter-active-class="animated zoomIn"
                    leave-active-class="animated zoomOut"
                  >
                    <div class="q-pa-md q-gutter-md">
                      <q-input v-model="inputField" dense autofocus/>

                      <!--           提交重置按钮           -->
                      <div class="row justify-between">
                        <q-btn class="col-auto"
                               @click="beforeShowHandler(props.row[`essay.title`],props.row.essayId)"
                               color="secondary" label="重置"/>
                        <q-btn class="col-auto" @click="tableTitleSave" color="primary" label="提交"
                               v-close-popup/>
                      </div>
                    </div>
                  </transition>
                </q-popup-edit>
              </q-td>
            </template>

            <!--     位置       -->
            <template v-slot:body-cell-field="props">
              <q-td :props="props" class="cursor-pointer" title="点击编辑">
                {{ props.value }}
                <!--       弹出代理         -->
                <q-popup-edit
                  v-model="props.row.field"
                  v-slot="scope"
                  title="修改位置"
                  @before-show="beforeShowHandler(props.row.field,props.row.id);"
                >
                  <transition
                    appear
                    enter-active-class="animated zoomIn"
                    leave-active-class="animated zoomOut"
                  >
                    <div class="q-pa-md q-gutter-md">
                      <q-input v-model="inputField" dense autofocus readonly/>

                      <!--          下拉选项            -->
                      <div class="row justify-between">

                        <!--     一级     -->
                        <div class="column col-auto margin-1" style="margin-left: 0;margin-right: 10px">
                          <span class="col-auto">一级标题</span>
                          <q-btn-dropdown class="col-auto" color="secondary" :label="firstField">
                            <q-list>
                              <q-item v-for="item in HEAD_ITEMS" clickable v-close-popup
                                      @click="tableFirstFieldHandler(item)">
                                <q-item-section>
                                  {{ item.label }}
                                </q-item-section>
                              </q-item>
                            </q-list>
                          </q-btn-dropdown>
                        </div>

                        <!--    二级      -->
                        <div class="column col-auto margin-1" style="margin-right: 0;">
                          <span class="col-auto">二级标题</span>
                          <q-btn-dropdown class="col-auto" color="info" :label="secondField">
                            <q-list v-if="firstField !== UNDEFINED">
                              <q-item v-for="item in getHeadSon()" v-close-popup clickable
                                      @click="tableSecondFieldHandler(item)">
                                <q-item-section>
                                  {{ item.label }}
                                </q-item-section>
                              </q-item>
                            </q-list>
                            <!--       缺省，显示全部       -->
                            <q-list v-else>
                              <template v-for="list in HEAD_ITEMS">
                                <q-item v-for="item in list.children" clickable v-close-popup
                                        @click="tableSecondFieldHandler(item)">
                                  <q-item-section>
                                    {{ item.label }}
                                  </q-item-section>
                                </q-item>
                              </template>
                            </q-list>
                          </q-btn-dropdown>
                        </div>

                      </div>

                      <!--          提交重置按钮            -->
                      <div class="row justify-between">
                        <q-btn class="col-auto" @click="beforeShowHandler(props.row.field,props.row.id)"
                               color="secondary" label="重置"/>
                        <q-btn class="col-auto" @click="tableFieldSave" color="primary" label="提交"
                               v-close-popup/>
                      </div>
                    </div>
                  </transition>
                </q-popup-edit>
              </q-td>
            </template>

            <!--      置顶      -->
            <template v-slot:body-cell-toTop="props">
              <q-td :props="props">
                <q-toggle v-model="props.row[`essay.toTop`]"
                          @click="essayTopHandler(props.row.essayId,props.row[`essay.toTop`])"/>
              </q-td>
            </template>

          </q-table>

          <!--     分页     -->
          <div class="q-pa-lg flex flex-center" v-if="pageTotal > 0">
            <q-pagination
              :max="pageTotal"
              direction-links
              boundary-numbers
              :max-pages="pageMax"
              v-model="currentPage"
              @click="pageHandler"
            />
          </div>

          <!--     加载     -->
          <q-inner-loading :showing="tableLoading">
            <q-spinner-gears size="50px" color="primary"/>
          </q-inner-loading>

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

        <!--    简介    -->
        <q-card-section>
          <span>我偷懒了，上面文章选一个，下面图片选一个，然后点上传</span>
        </q-card-section>

        <!--    按钮    -->
        <q-card-section class="row justify-between">
          <q-btn label="重置" icon="clear_all" color="secondary" @click="resetCarouselUpload"/>
          <q-btn label="上传" icon="upload" color="primary" @click="carouseUploadHandler"/>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>

import {ref, watch} from "vue";
import {CommFail, CommSuccess, CommWarn, DeleteConform} from "components/notifyTools";
import {HEAD_ITEMS} from "components/main/head-item";
import {
  CAROUSEL_HEIGHT,
  CAROUSEL_WIDTH,
  DEFAULT_DELAY,
  EMPTY_STRING, FRIEND_LINK_PAGE_SIZE,
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
  IMG_COLUMNS
} from "components/user/table";
import {
  getRows,
  goto,
  repeatArr,
  sleep,
  subArr,
} from "components/Tools";

// 展示弹出上传
const showUpload = ref(false);
const carouselColumns = ref(CAROUSEL_COLUMNS);

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

// 轮播图删除按钮
function carouselDeleteHandler() {
  DeleteConform(() => {
    deleteCarousel(getIdList(carouselSelected.value));
  })
}

// 删除轮播图
function deleteCarousel(idList) {
  if (idList.length < 1) {
    CommWarn("请至少选择一个");
    return;
  }
  api.delete('/carousel', {
    data: {
      idList: idList
    }
  }).then(res => {
    CommSuccess("删除成功");
  }).catch(res => {
    CommFail("删除失败");
  }).then(res => {
    carouselResetAllSelected();
    getCarousel();
  })
}

const carouselMorph = ref('true'); // 轮播图全选按钮变形

// 轮播图全选当前页
function carouselSelectRows() {
  carouselSelected.value.push(...carouselRows.value);
}

// 轮播图取消当前页选中
function carouselUnSelectRows() {
  carouselSelected.value = subArr(carouselSelected.value, carouselRows.value);
}

const carouselResetBtnLoading = ref(false); // 轮播图重置按钮动画

// 轮播图重置按钮按下
async function carouselResetBtnHandler() {
  carouselResetBtnLoading.value = true;
  await carouselResetAllSelected();
  await sleep(DEFAULT_DELAY);
  carouselResetBtnLoading.value = false;
}

// 轮播图重置所有选中
function carouselResetAllSelected() {
  carouselSelected.value = [];
}

const carouselRefreshBtnLoading = ref(false); // 轮播图刷新按钮动画

// 刷新按钮按下
async function carouselRefreshBtnHandler() {
  carouselRefreshBtnLoading.value = true;
  await getCarousel();
  await sleep(DEFAULT_DELAY);
  carouselRefreshBtnLoading.value = false;
}

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
const carouselPagination = ref({rowsPerPage: carouselPageSize.value});
const carouselTableLoading = ref(true);

// 上传轮播图重置
function resetCarouselUpload() {
  resetEssaySelected();
  resetImgSelected();
}

// 上传轮播图按钮
function carouseUploadHandler() {
  if (selected.value.length !== 1) {
    CommWarn("请选择一个文章");
    return;
  }
  if (imgSelected.value.length !== 1) {
    CommWarn("请选择一个图片");
    return;
  }

  const essayId = selected.value[0].essayId;
  const imgId = imgSelected.value[0].id;

  api.post('/carousel/upload', {
    essayId: essayId,
    imgId: imgId
  }).then(res => {
    CommSuccess("上传成功");
  }).catch(res => {
    CommFail("上传失败");
  }).then(res => {
    resetCarouselUpload();
    getCarousel();
  })
}

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

// 图片分页点击
function imgPageHandler() {
  getImg();
}

// 查询文章
function searchEssay() {
  getEssay();
}

// 分页表内
const firstField = ref(UNDEFINED);
const secondField = ref(UNDEFINED);
const inputField = ref(UNDEFINED);
const essayId = ref(ZERO);

// 表格内弹出代理前
function beforeShowHandler(val, id) {
  inputField.value = val;
  essayId.value = id;
  initTableField();
}

// 表格内标题保存
function tableTitleSave() {
  api.put('/essay/update', null, {
    params: {
      "id": essayId.value,
      "title": inputField.value
    }
  }).then(res => {
    const status = res.data.status;
    if (status) {
      CommSuccess("修改成功");
      return res;
    }
  }).catch(res => {
    CommFail("修改失败");
  }).then(res => {
    getEssay();
  })
}

// 表格内位置修改
function tableFieldSave() {
  api.put('/essay/update', null, {
    params: {
      'id': essayId.value,
      'field': inputField.value
    }
  }).then(res => {
    const status = res.data.status;
    if (status) {
      CommSuccess("修改成功");
      return res;
    } else {
      CommFail("修改失败");
    }
  }).catch(e => {
    CommFail("修改失败");
  }).then(res => {
    getEssay();
  })
}

// 位置绑定
function initTableField() {
  const split = inputField.value.split(SPLIT);
  firstField.value = split[0];
  secondField.value = split[1] ? split[1] : UNDEFINED;
}

// 同步更新inputField
function setInputField() {
  inputField.value = firstField.value +
    (secondField.value === UNDEFINED ? EMPTY_STRING : SPLIT + secondField.value);
}

// 一级标题选中
function tableFirstFieldHandler(item) {
  firstField.value = item.label;
  // 为了二级标题
  resetSecondField();
  // 同步
  // setInputField();
}

// 二级标题选中
function tableSecondFieldHandler(item) {
  secondField.value = item.label;
  // 同步
  setInputField();
}

// 二级标题重置
function resetSecondField() {
  secondField.value = UNDEFINED;
  // 同步
  setInputField();
}

// 获取二级标题列表
function getHeadSon() {
  const first = firstField.value;
  let arr = [];
  arr.push({label: UNDEFINED});
  for (let i = 0; i < HEAD_ITEMS.length; i++) {
    if (first === HEAD_ITEMS[i].label) {
      arr = arr.concat(HEAD_ITEMS[i].children);
    }
  }
  return arr;
}

// 分页表
const tableLoading = ref(true); // 表格加载状态
const pageSize = ref(PAGE_SIZE);
const pagination = ref({rowsPerPage: pageSize.value}) // 表格显示的最大数量
const selected = ref([]);
const columns = ref(ESSAY_COLUMNS);
const rows = ref([]);
const queryField = ref(EMPTY_STRING);
const pageTotal = ref(3);
const pageMax = ref(PAGE_MAX);
const currentPage = ref(START_PAGE);

// 分页被点击
function pageHandler() {
  getEssay();
}

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

// essay置顶
async function essayTopHandler(id, status) {
  await api.put('/essay/toTop', null, {
    params: {
      id: id,
      status: status
    }
  }).then(res => {
    CommSuccess("修改成功");
  }).catch(res => {
    CommFail("修改失败");
  }).then(res => {
    getEssay();
  })
}

// 已选几项
function getSelectedString(e) {
  return `已选择${e}项`;
}

const essayUploader = ref(null); // 文章上传器

// 文章重置选择
function resetEssaySelected() {
  selected.value = [];
}

// 设置时间
function mySetTime(time) {
  const firstLever = time.indexOf('-') + 1;
  const mid = time.indexOf('T');
  return time.substring(firstLever, mid);
}

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

.animated {
  transition: all .35s ease-in-out;
}

.selected {
  background-color: #999999;
  transform: scale(0.9);
}

</style>
