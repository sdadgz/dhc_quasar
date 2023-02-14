import {Notify} from 'quasar'
import {api} from "../boot/axios";
import {CODE_200} from "./MagicValue";

export function LoadingNotify() {
  return Notify.create({
    type: 'ongoing',
    message: "正在加载",
    position: 'top',
  });
}

export function LoadingSucceed(not: any) {
  not({
    icon: 'done',
    color: 'positive',
    type: 'positive',
    message: "加载成功"
  })
}

export function LoadingFail(not: any) {
  not({
    icon: 'error',
    color: 'negative',
    type: 'positive',
    message: "加载失败"
  })
}

//一般类型操作成功
export function CommSeccess(message: any) {
  Notify.create({
    icon: 'done',
    color: 'positive',
    message: message,
    position: 'top',
    group: message,
  })
}

export function CommFail(message?: any) {
  Notify.create({
    icon: 'error',
    color: 'negative',
    message: message,
    position: 'top',
    group: message || '出错了',
  })
}

export function CommWarn(message: any) {
  Notify.create({
    icon: 'error',
    type: 'warning',
    message: message,
    position: 'top',
    group: message,
  })
}

// 删除
export function DeleteConform(fun: () => void) {
  Notify.create({
    message: '确定要删除所选项目吗？',
    type: 'negative',
    position: 'top',
    actions: [
      {
        label: '确定', color: 'yellow', handler: fun
      },
      {
        label: '取消', color: 'white'
      }
    ]
  })
}

// 新删除
export function DeleteConformNew(idList: number[], url: string, fun?: () => void) {
  DeleteConform(() => {
    // 至少选择一个
    if (idList.length < 1) {
      CommWarn("至少选一个啊");
      return;
    }

    api.delete(url, {
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
      if (fun) {
        fun();
      }
    })
  })
}
