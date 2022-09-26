import * as path from "path";
import {HEAD_ITEMS} from "components/head-item";

const routes = [
  {
    path: '/',
    redirect: '/' + HEAD_ITEMS[0].label // 重定向到主页
  },
  {
    path: '/:first',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('pages/IndexPage.vue')
      },
      {
        path: ':second',
        component: () => import('pages/IndexPage.vue')
      }
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    redirect: '/'
  }
]

export default routes
