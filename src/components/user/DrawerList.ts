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
]
