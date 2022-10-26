// 遇到问题睡大觉
import {ESSAY_COLUMNS, table} from "./user/table";
import {DOT, EMPTY_STRING, HEAD_ITEMS_STRING, TIME_OUT_LONG, TIME_STRING} from "./MagicValue";
import {Ref, ref} from "vue";
import {CommFail, CommSeccess, CommWarn} from "./notifyTools";
import {SERVER_PREFIX} from "./Models";
import {api} from "../boot/axios";
import {HEAD_ITEMS} from "./main/head-item";

export const notNull = ref([(val) => (val && val.length > 0) || '输入值为空']);

export async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 两数差
export function sub(x: number, y: number) {
  return x - y >= 0 ? x - y : y - x;
}

// 返回大
export function max(num: number, max: number) {
  return num > max ? num : max;
}

// 生成表格行
export function getRows(lists: any, columns: table[]) {
  const rows = [];
  for (let i = 0; i < lists.length; i++) {
    let obj = {};
    for (let j = 0; j < columns.length; j++) {
      Object.assign(obj, {[`${columns[j].field}`]: getItem(lists[i], columns[j].field)});
    }
    // 增加id去重
    Object.assign(obj, {"id": lists[i].id});
    rows.push(obj);
  }
  return rows;
}

// 获取对象内的值
function getItem(list, field) {
  const index = field.indexOf(DOT);
  if (index != -1) {
    // 深层对象
    const suffix = field.substring(index + 1);
    const listElement = list[`${field.substring(0, index)}`];
    return getItem(listElement, suffix);
  } else {
    return list[`${field}`];
  }
}

// 数组是否有重复值
export function repeatArr(l1: [number], l2: [number]) {
  for (let a of l1) {
    for (let b of l2) {
      if (a === b) {
        return false;
      }
    }
  }
  return true;
}

// 数组删除去重
export function subArr(baseArr: any, targetArr: any) {
  return baseArr.filter(item => {
    for (let a of targetArr) {
      if (a.id === item.id) {
        return false;
      }
    }
    return true;
  });
}

// 打开新窗口
export function goto(url: string) {
  window.open(url);
}

// 设置时间
export function setTime(time: string, type?: string): string {
  if (type === undefined) {
    type = '011000';
  }
  const times = time.split('T');
  const timeArr = [];
  timeArr.push(...times[0].split('-'));
  timeArr.push(...times[1].split(':'));
  let resArr = '';
  for (let i = 0; i < timeArr.length; i++) {
    if (type.charAt(i) === '1') {
      resArr += timeArr[i] + dataStr[i];
    }
  }
  return resArr;
}

const dataStr: string[] = ['年', '月', '日 ', '点', '分', ''];

// 图片上传之后
export function uploadFinish(info) {
  const res = JSON.parse(info.xhr.response);
  if (res.code === '499') {
    // 未登录
    CommFail("未登录");
    window.location.href = SERVER_PREFIX + '/user/login';
  } else if (res.code !== '200') {
    // 出现异常
    CommFail(res.msg);
  } else {
    // 正常处理
    CommSeccess("上传成功");
  }
}

// 复制
export function copy(url) {
  navigator.clipboard.writeText(url).then(() => {
    CommSeccess("复制成功");
  })
}

// 删除
export function deleteHandler(idList: number[], url: string, callback: () => void) {
  if (idList.length < 1) {
    CommWarn("请至少选择一个");
    return;
  }
  api.delete(url, {
    data: {
      idList: idList
    }
  }).then(res => {
    CommSeccess("删除成功");
  }).catch(res => {
    CommFail("删除失败");
  }).then(res => {
    callback();
  })
}

// 恢复
export function recoverHandler(idList: number[], url: string, callback?: () => void) {
  if (idList.length < 1) {
    CommWarn("请至少选择一个");
    return;
  }
  api.put(url, {
    idList: idList
  }).then(res => {
    CommSeccess("恢复成功");
  }).catch(res => {
    CommFail("恢复失败");
  }).then(res => {
    callback();
  })
}

// 选中几项
export function getSelectedString(e: any) {
  return `已选择${e}项`;
}

// 初始化获取一二级标题
export async function init(fun: () => void, ref: Ref) {
  ref.value = await getHeadItem();
  fun();
}

// 获取一二级标题
async function getHeadItem() {
  if (timeOut()) {
    return await api.get('/headItem').then(res => {
      localStorage.setItem(HEAD_ITEMS_STRING, JSON.stringify(res.data));
      return res.data;
    })
  }
  return JSON.parse(localStorage.getItem(HEAD_ITEMS_STRING));
}

// 将空字符串转化为null
export function emptyToNull(str: string | number) {
  return str === EMPTY_STRING ? null : str;
}

// 超时
function timeOut() {
  const now = new Date().valueOf();
  const time = Number.parseInt(localStorage.getItem(TIME_STRING));
  if (!isNaN(time) && time + TIME_OUT_LONG > now) {
    return false;
  }
  localStorage.setItem(TIME_STRING, now.toString());
  return true;
}
