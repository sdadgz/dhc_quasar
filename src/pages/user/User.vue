<template>
  <q-page-container class="q-pa-md q-gutter-md">
    <div class="row">
      <!--   文章上传   -->
      <q-card class="container col-auto">
        <!--    标题    -->
        <q-card-section><strong>文章上传</strong></q-card-section>

        <!--    选择    -->
        <q-card-section class="row">
          <!--     一级     -->
          <div class="column col margin-1" style="margin-left: 0;">
            <span class="col-auto">一级标题</span>
            <q-btn-dropdown class="col-auto" color="secondary" :label="essayLabel">
              <q-list>
                <q-item v-for="item in HEAD_ITEMS" clickable v-close-popup @click="essayHandler_1(item)">
                  <q-item-section>
                    {{ item.label }}
                  </q-item-section>
                </q-item>
              </q-list>
            </q-btn-dropdown>
          </div>

          <!--    二级      -->
          <div class="column col margin-1" style="margin-right: 0;">
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
                <template v-for="list in HEAD_ITEMS">
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
            @finish="uploadDone = true"
            @uploaded="essayUploadFinish"
            accept=".docx"
            hide-upload-btn
          />
        </q-card-section>

        <!--    重置和提交    -->
        <q-card-section class="row justify-between">
          <q-btn label="重置" color="orange-7" class="col-auto min-w-100" @click="essayReset"/>
          <q-btn label="提交" color="blue-14" class="col-auto min-w-100" @click="essayCommit"/>
        </q-card-section>
      </q-card>

      <!--   关于   -->
      <q-card class="container col-auto">
        <q-card-section><strong>关于</strong></q-card-section>
        <q-card-section>我进不去后台哇，先能用，怎么排版到时候在改</q-card-section>
        <q-card-section>杂七杂八的按钮先仍这里吧</q-card-section>
        <q-card-section>
          <q-btn @click="goHome" color="positive" label="回到主页"/>
        </q-card-section>
      </q-card>
    </div>
  </q-page-container>
</template>

<script setup>

import {SERVER_NAME} from "components/Models";
import {ref} from "vue";
import {CommFail, CommSeccess, CommWarn} from "components/notifyTools";
import {useRouter} from "vue-router";
import {HEAD_ITEMS} from "components/head-item";
import {EMPTY_STRING, HOME, SPLIT, UNDEFINED} from "components/MagicValue";
import {api} from "boot/axios";

const $router = useRouter();

const essayUploadUrl = ref('/essay/upload'); // 文章上传地址
const essayField = ref(UNDEFINED); // 文章领域 | 二级标题
const uploadDone = ref(false); // 上传完成
const essayLabel = ref(UNDEFINED); // 一级标题
const selected_1 = ref([]); // 选中的一级标题的children
const essayUploader = ref(null); // 文章上传器

// 文章重置
function essayReset() {
  essayReset_1(); // 重置一级标题
  essayReset_2(); // 重置二级标题
  essayUploaderReset(); // 重置上传器
  resetField(); // 重置上传领域
}

const uploadField = ref(EMPTY_STRING);

// 重置提交领域
function resetField() {
  uploadField.value = EMPTY_STRING;
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
    } else {
      // 用一级标题替代
      // uploadField = essayLabel.value;
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
  HEAD_ITEMS.forEach(item => {
    item.children.forEach(child => {
      if (child.label === val) {
        ansArr.push(item.label);
      }
    })
  })
  return ansArr.length === 1 ? ansArr[0] : false;
}

// 一级标题重置
function essayReset_1() {
  essayLabel.value = UNDEFINED;
}

// 二级标题重置
function essayReset_2() {
  essayField.value = UNDEFINED;
}

// 上传器重置
function essayUploaderReset() {
  if (essayUploader) {
    essayUploader.value.reset();
  }
}

// 到主页
function goHome() {
  $router.push(HOME);
}

// 一级标题点击
function essayHandler_1(item) {
  // 改变按钮label
  essayLabel.value = item.label;
  // 为了二级
  selected_1.value = item.children;
  essayReset_2();
}

// 二级标题点击
function essayHandler_2(item) {
  essayField.value = item.label;
}

// 文章上传工厂
function essayUploadFn() {
  return new Promise(resolve => {
    resolve({
      "url": SERVER_NAME + essayUploadUrl.value,
      "formFields": [{
        "name": "field",
        "value": uploadField.value
      }],
      "fieldName": "file",
      "headers": [{
        "name": "token",
        "value": localStorage.getItem("token")
      }]
    })
  })
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

</script>

<style scoped>

.i-test {
  position: relative;
  overflow: hidden;
  height: 1080px;
  width: 2000px;
}

.container {
  padding: 2.33rem;
  margin: 1rem;
}

.margin-1 {
  margin: 10px;
}

.min-w-100 {
  min-width: 100px;
}

</style>

<style>

/* 只能仍这里了，会出现样式污染 */
.document {
  font-size: 16px;
}

img {
  width: 100%;
}

</style>
