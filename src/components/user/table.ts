// 文章
export const ESSAY_COLUMNS: table[] = [
  {"field": "essayId", "label": "文章唯一标识", "align": "center"},
  {"field": "essay.title", "name": "title", "label": "标题（点击编辑）", "align": "center"},
  {"field": "essay.createTime", "label": "上传时间", "align": "center"},
  {"field": "essay.user.name", "label": "用户名", "align": "center"},
  {"field": "field", "name": "field", "label": "位置（点击编辑）", "align": "center"},
  {"field": "essay.toTop", "name": "toTop", "label": "置顶", "align": "center"},
];

// 图片
export const IMG_COLUMNS: table[] = [
  {"field": "url", "label": "原图", "align": "center", "name": "img"},
  {"field": "isDelete", "label": "是否删除", "align": "center", "name": "status"},
  {"field": "createTime", "label": "上传时间", "align": "center"},
  {"field": "reduceUrl", "label": "浓缩图", "align": "center"},
  {field: "title", label: "简介", align: 'center'}
]

// 轮播图
export const CAROUSEL_COLUMNS: table[] = [
  {field: 'essay.title', label: '标题', align: "center"},
  {field: 'img.url', label: '原图地址', align: "center"},
  {field: 'img.reduceUrl', label: '浓缩图地址', align: "center"},
  {field: 'img.isDelete', label: '图片是否存在', align: "center"},
  {field: 'essayId', label: '文章唯一标识', align: "center"}
]

// 友情链接，全部数据
export const FRIEND_LINK_COLUMNS: table[] = [
  {field: 'label', label: '标题', align: "center", name: 'title'},
  {field: 'url', label: '地址', align: "center", name: 'url'},
  {field: 'img.reduceUrl', label: '浓缩图', align: "center", name: 'img'},
  {field: 'img.url', label: '原图', align: "center", name: 'imgo'},
  {field: 'img.isDelete', label: '是否删除', align: "center"},
]

// 友情连接，使用在显示表格上
export const FRIEND_LINK_USE_COLUMNS: table[] = [
  {field: 'label', label: '标题', align: "center", name: 'title'},
  {field: 'url', label: '地址', align: "center", name: 'url'},
  {field: 'img.reduceUrl', label: '浓缩图', align: "center", name: 'img'},
]

// 文件
export const FILE_COLUMNS: table[] = [
  {field: 'originalFilename', label: '文件名', align: "center", name: 'title'},
  {field: 'url', label: '地址', align: "center", name: 'url'},
  {field: 'isDelete', label: '是否删除', align: "center", name: 'isDelete'},
  {field: 'createTime', label: '上传时间', align: "center"},
]

// 用户表
export const USER_COLUMNS: table[] = [
  {label: '用户id', field: 'id', align: "center"},
  {label: '用户名（点击编辑）', field: 'name', align: "center", name: 'name'},
]

// 一级标题
export const FIRST_TITLE_COLUMNS: table[] = [
  {label: 'id', field: 'id', align: "center"},
  {label: '一级标题', field: 'title', align: "center", name: 'title'},
  {label: '优先级', field: 'order', align: "center", name: "order"},
]

// 二级标题
export const SECOND_TITLE_COLUMNS: table[] = [
  {label: 'id', field: 'id', align: "center"},
  {label: '一级标题', field: 'firstTitle.title', align: "center"},
  {label: '二级标题', field: 'title', align: "center", name: 'title'},
  {label: '优先级', field: 'order', align: "center", name: 'order'},
]

// 接口
export interface table {
  field: string,
  label: string,
  align?: 'left' | 'right' | 'center',
  name?: string
}
