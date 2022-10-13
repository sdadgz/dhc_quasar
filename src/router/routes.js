import * as path from "path";
import {HEAD_ITEMS} from "components/main/head-item";
import {createRouter, createWebHistory} from "vue-router";

const routes = [
  {
    path: '/',
    redirect: '/' + HEAD_ITEMS[0].label // 重定向到主页
  },
  {
    // 海克斯科技用户页
    path: '/user',
    component: () => import('layouts/EmptyLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('pages/user/User.vue')
      },
      {
        path: 'login',
        component: () => import('pages/user/Login.vue')
      }
    ]
  },
  {
    // 首页及分页页
    path: '/' + HEAD_ITEMS[0].label,
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('pages/main/HomePage.vue')
      }
    ]
  },
  {
    // 分页页
    path: '/:first',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: ':second?',
        component: () => import('pages/main/MainPage.vue') // 指向分页
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
