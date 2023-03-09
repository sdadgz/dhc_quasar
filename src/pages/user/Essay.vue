<template>
  <div class="row q-pa-md q-gutter-md">

    <!--   文章表   -->
    <q-card class="q-pa-md">

      <!--    头部按钮    -->
      <q-card-section class="q-pa-md q-gutter-md">
        <q-btn label="刷新" color="blue-14" icon="refresh" @click="refreshEssay"
               :loading="refreshEssayLoading"/>
        <q-btn label="删除" color="red" icon="delete_forever" @click="deleteSelected"/>
        <q-btn label="新增" icon="edit" color="secondary" @click="showUpload = true"/>
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
                @before-show="beforeShowHandler(props.row[`essay.title`], props.row.essayId)"
              >
                <transition
                  appear
                  enter-active-class="animated zoomIn"
                  leave-active-class="animated zoomOut"
                >
                  <div class="q-pa-md q-gutter-md">
                    <q-input v-model="inputField" dense autofocus v-close-popup
                             @keyup.enter="tableTitleSave"/>

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
                @before-show="beforeShowHandler(props.row.field, props.row.id);"
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
                            <q-item v-for="item in headItems" clickable v-close-popup
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
                            <template v-for="list in headItems">
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
                      <q-btn class="col-auto" @click="beforeShowHandler(props.row.field, props.row.id)"
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

    </q-card>

    <!--  文章上传弹出  -->
    <q-dialog v-model="showUpload">
      <q-card class="q-pa-md q-gutter-md">
        <!--    标题    -->
        <q-card-section class="row justify-between">
          <strong>文章上传</strong>
          <q-btn icon="close" flat round v-close-popup dense/>
        </q-card-section>

        <!--    用户输入标题    -->
        <q-card-section>
          <q-input v-model="inputEssayTitle" placeholder="输入文章标题（默认使用文件名作为标题）">
            <template v-slot:append>
              <q-icon
                v-if="inputEssayTitle && inputEssayTitle.length > 0"
                name="close"
                class="cursor-pointer"
                @click="resetInputEssayTitle"
              />
            </template>
          </q-input>
        </q-card-section>

        <!--    选择    -->
        <q-card-section class="row justify-between">
          <!--     一级     -->
          <div class="column col-auto margin-1" style="margin-left: 0;">
            <span class="col-auto">一级标题</span>
            <q-btn-dropdown class="col-auto" color="secondary" :label="essayLabel">
              <q-list>
                <q-item v-for="item in headItems" clickable v-close-popup @click="essayHandler_1(item)">
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
            <q-btn-dropdown class="col-auto" color="info" :label="essayField">
              <q-list v-if="essayLabel !== UNDEFINED">
                <q-item v-for="item in selected_1" v-close-popup clickable @click="essayHandler_2(item)">
                  <q-item-section>
                    {{ item.label }}
                  </q-item-section>
                </q-item>
              </q-list>
              <!--       缺省，显示全部       -->
              <q-list v-else>
                <template v-for="list in headItems">
                  <q-item v-for="item in list.children" clickable v-close-popup @click="essayHandler_2(item)">
                    <q-item-section>
                      {{ item.label }}
                    </q-item-section>
                  </q-item>
                </template>
              </q-list>
            </q-btn-dropdown>
          </div>

        </q-card-section>

        <!--    上传器    -->
        <q-card-section>
          <q-uploader
            ref="essayUploader"
            label="目前只支持docx格式"
            :factory="essayUploadFn"
            @finish="uploadDone = true;getEssay()"
            @uploaded="essayUploadFinish"
            accept=".docx"
            hide-upload-btn
            multiple
          />
        </q-card-section>

        <!--    重置和提交    -->
        <q-card-section class="row justify-between">
          <q-btn label="重置" color="orange-7" class="col-auto min-w-100" @click="essayReset"
                 icon="clear_all"/>
          <q-btn label="提交" color="blue-14" class="col-auto min-w-100" @click="essayCommit"
                 icon="upload"/>
        </q-card-section>

        <q-card-section>
          关于：轮播图和友情连接不在这里上传
        </q-card-section>

      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>

import {ref} from "vue";
import {
  CODE_200,
  DEFAULT_DELAY,
  EMPTY_STRING,
  PAGE_MAX,
  PAGE_SIZE,
  SPLIT,
  START_PAGE,
  UNDEFINED, ZERO
} from "components/MagicValue";
import {SERVER_NAME} from "components/Models";
import {api} from "boot/axios";
import {getRows, init, sleep} from "components/Tools";
import {ESSAY_COLUMNS} from "components/user/table";
import {CommFail, CommSeccess, CommWarn, DeleteConform} from "components/notifyTools";
import {useRouter} from "vue-router";
import {banCarouselAndVideo} from "components/user/SecondTitle";

const $router = useRouter();

// 分页被点击
function pageHandler() {
  getEssay();
}

const showUpload = ref(false);
const inputField = ref(UNDEFINED);
const essayId = ref(ZERO);
const firstField = ref(UNDEFINED);
const secondField = ref(UNDEFINED);

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
      CommSeccess("修改成功");
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

// 二级标题选中
function tableSecondFieldHandler(item) {
  secondField.value = item.label;
  // 同步
  setInputField();
}

// 获取二级标题列表
function getHeadSon() {
  const first = firstField.value;
  let arr = [];
  arr.push({label: UNDEFINED});
  for (let i = 0; i < headItems.value.length; i++) {
    if (first === headItems.value[i].label) {
      arr = arr.concat(headItems.value[i].children);
    }
  }
  return arr;
}

// 二级标题点击
function essayHandler_2(item) {
  banCarouselAndVideo(item.label, headItems.value[0].children,()=>{
    essayField.value = item.label;
  },()=>CommWarn("不在此处上传"));
}

// essay置顶
async function essayTopHandler(id, status) {
  await api.put('/essay/toTop', null, {
    params: {
      id: id,
      status: status
    }
  }).then(res => {
    CommSeccess("修改成功");
  }).catch(res => {
    CommFail("修改失败");
  }).then(res => {
    getEssay();
  })
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
      CommSeccess("修改成功");
      return res;
    }
  }).catch(res => {
    CommFail("修改失败");
  }).then(res => {
    getEssay();
  })
}

// 一级标题选中
function tableFirstFieldHandler(item) {
  firstField.value = item.label;
  // 为了二级标题
  resetSecondField();
}

// 二级标题重置
function resetSecondField() {
  secondField.value = UNDEFINED;
  // 同步
  setInputField();
}

// 同步更新inputField
function setInputField() {
  inputField.value = firstField.value +
    (secondField.value === UNDEFINED ? EMPTY_STRING : SPLIT + secondField.value);
}

// 表格内弹出代理前
function beforeShowHandler(val, id) {
  inputField.value = val;
  essayId.value = id;
  initTableField();
}

// 位置绑定
function initTableField() {
  const split = inputField.value.split(SPLIT);
  firstField.value = split[0];
  secondField.value = split[1] ? split[1] : UNDEFINED;
}

// 查询文章
function searchEssay() {
  getEssay();
}

const inputEssayTitle = ref(EMPTY_STRING); // 用户输入标题
const essayLabel = ref(UNDEFINED); // 一级标题
const selected_1 = ref([]); // 选中的一级标题的children
const essayField = ref(UNDEFINED); // 文章领域 | 二级标题
const uploadDone = ref(false); // 上传完成
const essayUploadUrl = ref('/essay/upload'); // 文章上传地址
const tableLoading = ref(true); // 表格加载状态
const rows = ref([]);
const pageSize = ref(PAGE_SIZE);
const pageTotal = ref(3);
const currentPage = ref(START_PAGE);
const pagination = ref({rowsPerPage: pageSize.value}) // 表格显示的最大数量
const selected = ref([]);
const columns = ref(ESSAY_COLUMNS);
const queryField = ref(EMPTY_STRING);
const pageMax = ref(PAGE_MAX);
const uploadField = ref(EMPTY_STRING);
const essayUploader = ref(null); // 文章上传器
const refreshEssayLoading = ref(false);

// 已选几项
function getSelectedString(e) {
  return `已选择${e}项`;
}

// 删除文章
function deleteSelected() {
  DeleteConform(deleteEssayHandler);
}

// 删除文章handler
function deleteEssayHandler() {
  // 至少选择一个
  const essayList = selected.value;
  const idList = [];
  essayList.forEach(item => {
    idList.push(item.essayId);
  })

  if (essayList.length < 1) {
    CommWarn("至少选一个啊");
    return;
  }

  api.delete('/essay', {
    data: {
      "idList": idList
    }
  }).then(res => {
    if (res.code === CODE_200) {
      CommSeccess("删除成功");
    } else {
      CommFail("删除失败");
    }
  }).catch(res => {
    CommFail("删除失败");
  }).then(res => {
    resetEssaySelected();
    getEssay();
  })
}

// 刷新按钮
async function refreshEssay() {
  refreshEssayLoading.value = true;
  await resetEssaySelected();
  await getEssay();
  await sleep(DEFAULT_DELAY);
  refreshEssayLoading.value = false;
}

// 文章重置选择
function resetEssaySelected() {
  selected.value = [];
}

// 文章提交
function essayCommit() {
  // 重置上传领域
  resetField();

  if (essayField.value === UNDEFINED) {
    if (essayLabel.value === UNDEFINED) {
      // 俩都没有
      CommWarn("还没有选择文章放在哪里");
      return;
    }
  }

  // 处理上传field，空格隔开，单个表根 两个表正常
  if (essayLabel.value !== UNDEFINED) {
    // 一级存在值，仍里头
    uploadField.value = essayLabel.value;
  }
  // 二级
  if (essayField.value !== UNDEFINED) { // 有二级能开始了
    if (essayLabel.value !== UNDEFINED) { // 有一级不用匹配了芜湖
      uploadField.value += SPLIT + essayField.value;
    } else { // 没有指定一级，淦，得匹配了
      const m = matching(essayField.value);
      if (m) {
        uploadField.value += m + SPLIT + essayField.value;
      } else {
        CommWarn("模棱两可，存在：" + essayField.value + " 的值不唯一");
        return;
      }
    }
  }

  // 开始上传
  if (essayUploader) {
    essayUploader.value.upload();
  }
}

// 根据二级匹配唯一的一级
function matching(val) {
  const ansArr = [];
  headItems.value.forEach(item => {
    item.children.forEach(child => {
      if (child.label === val) {
        ansArr.push(item.label);
      }
    })
  })
  return ansArr.length === 1 ? ansArr[0] : false;
}

// 文章重置
function essayReset() {
  resetInputEssayTitle();
  essayReset_1(); // 重置一级标题
  essayReset_2(); // 重置二级标题
  essayUploaderReset(); // 重置上传器
  resetField(); // 重置上传领域
}

// 一级标题重置
function essayReset_1() {
  essayLabel.value = UNDEFINED;
}

// 上传器重置
function essayUploaderReset() {
  if (essayUploader) {
    essayUploader.value.reset();
  }
}

// 重置提交领域
function resetField() {
  uploadField.value = EMPTY_STRING;
}

// 文章上传之后哦
function essayUploadFinish(info) {
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

// 文章上传工厂
function essayUploadFn() {
  return new Promise(resolve => {
    resolve({
      "url": SERVER_NAME + essayUploadUrl.value,
      "formFields": [
        {
          "name": "field",
          "value": uploadField.value
        },
        {
          "name": "title",
          "value": inputEssayTitle.value
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

// 用户输入标题重置
function resetInputEssayTitle() {
  inputEssayTitle.value = EMPTY_STRING;
}

// 一级标题点击
function essayHandler_1(item) {
  // 改变按钮label
  essayLabel.value = item.label;
  // 为了二级
  selected_1.value = item.children;
  essayReset_2();
}

// 二级标题重置
function essayReset_2() {
  essayField.value = UNDEFINED;
}

// 初始化
function start() {
  getEssay();
}

const headItems = ref([]);

init(headItems, start);
</script>

<style scoped>

</style>
