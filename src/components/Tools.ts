// 遇到问题睡大觉
import {ESSAY_COLUMNS, table} from "./user/table";
import {DOT} from "./MagicValue";
import {ref} from "vue";
import {CommFail, CommSeccess} from "./notifyTools";
import {SERVER_PREFIX} from "./Models";

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
export function setTime(time) {
  const firstLever = time.indexOf('-') + 1;
  const mid = time.indexOf('T');
  return time.substring(firstLever, mid);
}

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
