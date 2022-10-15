export const ESSAY_COLUMNS: table[] = [
  {"field": "essayId", "label": "文章唯一标识", "align": "center"},
  {"field": "essay.title", "name": "title", "label": "标题（点击编辑）", "align": "center"},
  {"field": "essay.createTime", "label": "上传时间", "align": "center"},
  {"field": "essay.user.name", "label": "用户名", "align": "center"},
  {"field": "field", "name": "field", "label": "位置（点击编辑）", "align": "center"},
];

export const IMG_COLUMNS: table[] = [
  {"field": "url", "label": "原图", "align": "center", "name": "img"},
  {"field": "isDelete", "label": "是否删除", "align": "center", "name": "status"},
  {"field": "createTime", "label": "上传时间", "align": "center"},
  {"field": "reduceUrl", "label": "浓缩图", "align": "center"},
  {field: "title", label: "简介", align: 'center'}
]

export const CAROUSEL_COLUMNS: table[] = [
  {field: 'essay.title', label: '标题', align: "center"},
  {field: 'img.url', label: '原图地址', align: "center"},
  {field: 'img.reduceUrl', label: '浓缩图地址', align: "center"},
  {field: 'img.isDelete', label: '图片是否存在', align: "center"},
  {field: 'essayId', label: '文章唯一标识', align: "center"}
]

export const FRIEND_LINK_COLUMNS: table[] = [
  {field: 'label', label: '标题', align: "center", name: 'title'},
  {field: 'url', label: '地址', align: "center", name: 'url'},
  {field: 'img.reduceUrl', label: '浓缩图', align: "center", name: 'img'},
  {field: 'img.url', label: '原图', align: "center", name: 'imgo'},
  {field: 'img.isDelete', label: '是否删除', align: "center"},
]

export const FRIEND_LINK_USE_COLUMNS: table[] = [
  {field: 'label', label: '标题', align: "center", name: 'title'},
  {field: 'url', label: '地址', align: "center", name: 'url'},
  {field: 'img.reduceUrl', label: '浓缩图', align: "center", name: 'img'},
]

// 接口
export interface table {
  field: string,
  label: string,
  align?: 'left' | 'right' | 'center',
  name?: string
}
