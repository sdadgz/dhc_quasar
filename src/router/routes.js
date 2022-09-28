import * as path from "path";
import {HEAD_ITEMS} from "components/head-item";
import {createRouter, createWebHistory} from "vue-router";

const routes = [
  {
    path: '/',
    redirect: '/' + HEAD_ITEMS[0].label // 重定向到主页
  },
  {
    path: '/' + HEAD_ITEMS[0].label,
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('pages/HomePage.vue')
      }
    ]
  },
  {
    path: '/user',
    component: () => import('layouts/EmptyLayout.vue'),
    children: [
      {
        path: 'login',
        component: () => import('pages/Login.vue')
      }
    ]
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
