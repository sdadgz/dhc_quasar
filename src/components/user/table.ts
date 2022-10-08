export const ESSAY_COLUMNS = [
  {"field": "essayId", "label": "文章唯一标识", "align": "center"},
  {"field": "essay.title", "name": "title", "label": "标题", "align": "center"},
  {"field": "essay.createTime", "label": "上传时间", "align": "center"},
  {"field": "essay.user.name", "label": "用户名", "align": "center"},
  {"field": "field", "name": "field", "label": "位置", "align": "center"},
];

export const IMG_COLUMNS = [
  {"field": "url", "label": "原图", "align": "center", "name": "img"},
  {"field": "isDelete", "label": "是否删除", "align": "center", "name": "status"},
  {"field": "createTime", "label": "上传时间", "align": "center"},
  {"field": "reduceUrl", "label": "浓缩图", "align": "center"},
]
