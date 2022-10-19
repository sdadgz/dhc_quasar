<template>
  <q-page-container class="q-pa-md q-gutter-md">
    <div class="row">

      <!--   文章上传   -->
      <q-card class="container col-auto">
        <!--    标题    -->
        <q-card-section><strong>文章上传</strong></q-card-section>

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
            @finish="uploadDone = true;getEssay()"
            @uploaded="essayUploadFinish"
            accept=".docx"
            hide-upload-btn
            multiple
          />
        </q-card-section>

        <!--    重置和提交    -->
        <q-card-section class="row justify-between">
          <q-btn label="重置" color="orange-7" class="col-auto min-w-100" @click="essayReset" icon="clear_all"/>
          <q-btn label="提交" color="blue-14" class="col-auto min-w-100" @click="essayCommit" icon="upload"/>
        </q-card-section>

        <q-card-section>
          关于：轮播图和友情连接不在这里上传
        </q-card-section>

      </q-card>

      <!--   文章表   -->
      <q-card class="container col-auto">

        <!--    头部按钮    -->
        <q-card-section class="q-pa-md q-gutter-md">
          <q-btn label="刷新" color="blue-14" icon="refresh" @click="refreshEssay" :loading="refreshEssayLoading"/>
          <q-btn label="删除" color="red" icon="delete_forever" @click="deleteSelected"/>
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
              <q-input model-value="" v-model="queryField" placeholder="搜索（位置）"
                       @blur="searchEssay" @keyup.enter="searchEssay" style="width: 233px">
                <template v-slot:append>
                  <q-icon name="search" class="cursor-pointer" @click="searchEssay"/>
                  <q-icon v-if="queryField && queryField.length > 0" name="close"
                          class="cursor-pointer" @click="queryField = EMPTY_STRING"/>
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
                        <div class="column col margin-1" style="margin-left: 0;">
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
                        <div class="column col margin-1" style="margin-right: 0;">
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

      </q-card>

      <!--   上传图片   -->
      <q-card class="container col-auto">

        <!--    标题    -->
        <q-card-section>
          <strong>图片上传</strong>
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

      <!--   图片表   -->
      <q-card class="container col-auto" style="width: 96vw">

        <!--   按钮     -->
        <q-card-section class="q-pa-md q-gutter-md">
          <q-btn label="刷新" icon="refresh" color="blue-14" @click="refreshImg" :loading="refreshImgBtnLoading"/>
          <q-btn label="恢复" icon="restore" color="green-13" @click="recoverImgTable" :loading="recoverBtnLoading"/>
          <q-btn label="删除" icon="delete_forever" color="red" @click="deleteImg"/>
          <q-btn label="重置" icon="autorenew" color="cyan" @click="resetImgTableHandler" :loading="resetBtnLoading"/>
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

      <!--   上传轮播图   -->
      <q-card class="container col-auto">

        <!--    标题    -->
        <q-card-section>
          <strong>轮播图上传</strong>
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

      <!--   轮播图表   -->
      <q-card class="container col-auto" style="width: 96vw">

        <!--    标题    -->
        <q-card-section><strong>轮播图</strong></q-card-section>

        <!--    按钮    -->
        <q-card-section class="q-pa-md q-gutter-md">
          <q-btn label="刷新" color="blue-14" icon="refresh" :loading="carouselRefreshBtnLoading"
                 @click="carouselRefreshBtnHandler"/>
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
          <q-table title="轮播图" :columns="CAROUSEL_COLUMNS" :rows="carouselRows" row-key="id" hide-pagination
                   selection="multiple" v-model:selected="carouselSelected" :selected-rows-label="getSelectedString"
                   grid :pagination="carouselPagination" :loading="carouselTableLoading">

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
                  <q-card-section>
                    <q-img
                      :src="props.row['img.reduceUrl'] === null ? props.row['img.url'] : props.row['img.reduceUrl']"
                      :ratio="CAROUSEL_WIDTH / CAROUSEL_HEIGHT"
                    >
                      <div class="absolute-bottom text-center"
                           :style="{backgroundColor: props.row['img.isDelete'] ? 'rgba(255,0,0,.5)' : ''}">
                        <span>
                          {{
                            props.row['img.isDelete'] ? '这张图片已被删除，但轮播图未被删除！！！' : props.row['essay.title']
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

      <!--   友情连接上传   -->
      <q-card class="container col-auto">

        <!--    标题    -->
        <q-card-section><strong>友情连接</strong></q-card-section>

        <!--    悬浮title    -->
        <q-card-section>
          <q-input :rules="notNull" v-model="friendLinkLabel" placeholder="友情连接标题"/>
        </q-card-section>

        <!--    地址    -->
        <q-card-section>
          <q-input :rules="notNull" v-model="friendLinkUrl" placeholder="友情连接地址"/>
        </q-card-section>

        <!--    按钮    -->
        <q-card-section class="row justify-between">
          <q-btn label="重置" icon="clear_all" color="secondary" @click="resetFriendLink"/>
          <q-btn label="上传" icon="upload" color="primary" @click="commitFriendLink"/>
        </q-card-section>

        <!--   tips    -->
        <q-card-section>
          关于：上面图片表选中一个图片作为友情连接图片
        </q-card-section>

      </q-card>

      <!--   友情连接表   -->
      <q-card class="container col-auto">

        <!--    按钮    -->
        <q-card-section class="q-pa-md q-gutter-md">
          <q-btn label="刷新" color="blue-14" icon="refresh" @click="friendLinkBtnHandler"
                 :loading="friendLinkBtnLoading"/>
          <q-btn label="删除" color="red" icon="delete_forever" @click="deleteFriendLinkHandler"/>
        </q-card-section>

        <!--    表    -->
        <q-card-section>
          <q-card-section>
            <q-table
              title="友情连接"
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
                  <q-td key="img" :props="props" class="cursor-pointer" title="查看原图">
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

      <!--   上传视频   -->
      <q-card class="container col-auto">
        <!--    标题    -->
        <q-card-section><strong>上传视频</strong></q-card-section>

        <!--    用户输入标题    -->
        <q-card-section>
          <q-input v-model="videoInputTitle" placeholder="视频标题（默认文件名做为标题）">
            <template #append>
              <q-icon v-if="videoInputTitle && videoInputTitle.length >0" name="close"
                      @click="resetVideoTitle" class="cursor-pointer"/>
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
                <q-item v-for="item in HEAD_ITEMS" clickable v-close-popup
                        @click="videoFirst = item.label;resetVideoSecond()">
                  <q-item-section>
                    {{ item.label }}
                  </q-item-section>
                </q-item>
              </q-list>
            </q-btn-dropdown>
          </div>

          <!--    二级      -->
          <div class="column col-auto">
            <span class="col-auto">二级标题</span>
            <q-btn-dropdown class="col-auto" color="info" :label="videoSecond">
              <q-list v-for="father in HEAD_ITEMS">
                <div v-if="father.label === videoFirst">
                  <q-item v-for="item in father.children" v-close-popup clickable
                          @click="videoSecond = item.label">
                    <q-item-section>
                      {{ item.label }}
                    </q-item-section>
                  </q-item>
                </div>
              </q-list>
            </q-btn-dropdown>
          </div>
        </q-card-section>

        <!--    上传器    -->
        <q-card-section>
          <q-uploader label="上传视频" accept="video/*" ref="videoUploader" multiple hide-upload-btn
                      @uploaded="uploadFinish" @finish="getFile();getEssay()" :factory="videoUploadFn"/>
        </q-card-section>

        <!--    按钮    -->
        <q-card-section class="row justify-between">
          <q-btn label="重置" icon="clear_all" color="secondary" @click="resetVideo"/>
          <q-btn label="提交" icon="upload" color="blue-14" @click="commitVideoHandler"/>
        </q-card-section>

        <!--    tips    -->
        <q-card-section>关于：轮播图和友情链接不在这里上传</q-card-section>

      </q-card>

      <!--   上传文件   -->
      <q-card class="container col-auto">
        <!--    标题    -->
        <q-card-section><strong>上传文件</strong></q-card-section>

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

      <!--   文件表   -->
      <q-card class="container col-auto">
        <!--    按钮    -->
        <q-card-section class="q-pa-md q-gutter-md">
          <q-btn label="刷新" icon="refresh" color="blue-14" @click="fileRefreshHandler"
                 :loading="fileRefreshBtnLoading"/>
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

      <!--   注册海克斯科技用户   -->
      <q-card class="container col-auto" style="width: 460px;">

        <!--    标题    -->
        <q-card-section>
          <strong>注册新用户</strong>
        </q-card-section>

        <!--    用户名    -->
        <q-card-section>
          <q-input v-model="registerUsername" label="用户名" :rules="notNull"/>
        </q-card-section>

        <!--    密码    -->
        <q-card-section>
          <q-input v-model="registerPassword" label="密码" :rules="notNull" type="password"/>
        </q-card-section>

        <!--    确认密码    -->
        <q-card-section>
          <q-input v-model="registerPasswordP" label="确认密码" :rules="sameRule" type="password"/>
        </q-card-section>

        <!--    按钮    -->
        <q-card-section class="row justify-between">
          <q-btn label="重置" icon="clear_all" color="secondary" @click="resetRegister"/>
          <q-btn label="提交" icon="upload" color="primary" @click="commitRegister"/>
        </q-card-section>
      </q-card>

      <!--   关于   -->
      <q-card class="container col-auto">
        <q-card-section><strong>关于</strong></q-card-section>
        <q-card-section>我进不去后台哇，先能用，怎么排版到时候在改</q-card-section>
        <q-card-section>杂七杂八的按钮先仍这里吧</q-card-section>
        <q-card-section>
          <q-btn @click="goHome" color="positive" icon="home" label="回到主页"/>
        </q-card-section>
      </q-card>

    </div>
  </q-page-container>
</template>

<script setup>

import {SERVER_NAME} from "components/Models";
import {ref, watch} from "vue";
import {CommFail, CommSeccess, CommWarn, DeleteConform} from "components/notifyTools";
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

const $q = useQuasar();
const $router = useRouter();

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

// 提交注册
function commitRegister() {
  if (registerUsername.value.length < 1 || registerPassword.value.length < 1 ||
    registerPasswordP.value !== registerPassword.value) {
    CommWarn("请完善表单");
    return;
  }

  api.post('/user/register', {
    name: registerUsername.value,
    password: registerPassword.value
  }).then(res => {
    CommSeccess("注册成功");
  }).catch(res => {
    CommFail("注册失败");
  }).then(res => {
    resetRegister();
  })
}

// 重置注册
function resetRegister() {
  registerUsername.value = EMPTY_STRING;
  registerPassword.value = EMPTY_STRING;
  registerPasswordP.value = EMPTY_STRING;
}

const registerUsername = ref(EMPTY_STRING);
const registerPassword = ref(EMPTY_STRING);
const registerPasswordP = ref(EMPTY_STRING);

// 确认密码验证
const sameRule = ref([(val) => (val && val === registerPassword.value && val.length > 0)
  || '两次输入的密码不同'])

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
    url: url
  }).then(res => {
    CommSeccess("修改成功");
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
function commitFriendLink() {
  // 未填写input
  if (friendLinkLabel.value.length <= 0 && friendLinkUrl.value.length <= 0) {
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
    imgId: friendLinkImgId.value
  }).then(res => {
    CommSeccess("上传成功");
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
    CommSeccess("删除成功");
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
    CommSeccess("上传成功");
  }).catch(res => {
    CommFail("上传失败");
  }).then(res => {
    resetCarouselUpload();
    getCarousel();
  })
}

// 重置图片上传title
function resetImgUploadTitle() {
  imgUploadTitle.value = EMPTY_STRING;
}

const imgQuery = ref(EMPTY_STRING); // 图片查询
const imgUploadTitle = ref(EMPTY_STRING); // 图片上传简介

// 选中当前页全部图片
function imgSelectedAll() {
  imgSelected.value.push(...imgRows.value);
}

// 取消当前页选中
function imgUnSelectedAll() {
  imgSelected.value = subArr(imgSelected.value, imgRows.value);
}

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

const refreshImgBtnLoading = ref(false);

// 图片表刷新
async function refreshImg() {
  refreshImgBtnLoading.value = true;
  await resetImgSelected();
  await getImg();
  await sleep(DEFAULT_DELAY);
  refreshImgBtnLoading.value = false;
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

// 获取数组中的idList
function getIdList(arr) {
  const res = [];
  arr.forEach(item => {
    res.push(item.id);
  })
  return res;
}

// 按钮动画
const resetBtnLoading = ref(false);
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

// 上传图片按钮
function imgUploadHandler() {
  if (imgUploader) {
    imgUploader.value.upload();
  }
}

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

// 查询文章
function searchEssay() {
  getEssay();
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
      CommSeccess("修改成功");
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

// 位置重置
function resetTableField() {
  resetFirstField();
  resetSecondField();
}

// 一级标题选中
function tableFirstFieldHandler(item) {
  firstField.value = item.label;
  // 为了二级标题
  resetSecondField();
  // 同步
  // setInputField();
}

// 一级标题重置
function resetFirstField() {
  firstField.value = UNDEFINED;
  // 同步
  setInputField();
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
    CommSeccess("修改成功");
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

const essayUploadUrl = ref('/essay/upload'); // 文章上传地址
const essayField = ref(UNDEFINED); // 文章领域 | 二级标题
const uploadDone = ref(false); // 上传完成
const essayLabel = ref(UNDEFINED); // 一级标题
const selected_1 = ref([]); // 选中的一级标题的children
const essayUploader = ref(null); // 文章上传器

// 文章重置
function essayReset() {
  resetInputEssayTitle();
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

const refreshEssayLoading = ref(false);

// 文章重置选择
function resetEssaySelected() {
  selected.value = [];
}

// 刷新按钮
async function refreshEssay() {
  refreshEssayLoading.value = true;
  await resetEssaySelected();
  await getEssay();
  await sleep(DEFAULT_DELAY);
  refreshEssayLoading.value = false;
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

const inputEssayTitle = ref(EMPTY_STRING); // 用户输入标题

// 用户输入标题重置
function resetInputEssayTitle() {
  inputEssayTitle.value = EMPTY_STRING;
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
