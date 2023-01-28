interface DrawerList {
  label: string,
  url: string,
  selected: boolean,
  icon: string
}

export const DRAWER_LIST: DrawerList[] = [
  {label: '一级标题', url: 'firstTitle', selected: false, icon: 'title'},
  {label: '二级标题', url: 'secondTitle', selected: false, icon: 'subtitles'},
  {label: '文章', url: 'essay', selected: false, icon: 'article'},
  {label: '图片', url: 'img', selected: false, icon: 'image'},
  {label: '轮播图', url: 'carousel', selected: false, icon: 'collections'},
  {label: '视频专栏', url: 'friendLink', selected: false, icon: 'link'},
  {label: '视频', url: 'video', selected: false, icon: 'smart_display'},
  {label: '文件', url: 'file', selected: false, icon: 'description'},
  {label: '用户', url: 'register', selected: false, icon: 'person'},
]
