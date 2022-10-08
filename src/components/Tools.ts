// 遇到问题睡大觉
import {ESSAY_COLUMNS} from "./user/table";
import {DOT} from "./MagicValue";

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
export function getRows(lists: any, columns: any) {
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
