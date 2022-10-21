import * as path from "path";
import {HEAD_ITEMS} from "components/main/head-item";
import {createRouter, createWebHistory} from "vue-router";

const routes = [
  {
    path: '/',
    redirect: '/首页' // 重定向到主页
  },
  {
    path: '/user',
    component: () => import('layouts/CMS.vue'),
    children: [
      {
        path: '',
        redirect: '/user/essay'
      },
      {
        path: 'firstTitle',
        component: () => import('pages/user/FirstTitle.vue')
      },
      {
        path: 'secondTitle',
        component: () => import('pages/user/SecondTitle.vue')
      },
      {
        path: 'essay',
        component: () => import('pages/user/Essay.vue')
      },
      {
        path: 'img',
        component: () => import('pages/user/Img.vue')
      },
      {
        path: 'carousel',
        component: () => import('pages/user/Carousel.vue')
      },
      {
        path: 'friendLink',
        component: () => import('pages/user/FriendLink.vue')
      },
      {
        path: 'video',
        component: () => import('pages/user/Video.vue')
      },
      {
        path: 'file',
        component: () => import('pages/user/File.vue')
      },
      {
        path: 'register',
        component: () => import('pages/user/Register.vue')
      }
    ]
  },
  {
    // 海克斯科技用户页
    path: '/user',
    component: () => import('layouts/EmptyLayout.vue'),
    children: [
      {
        path: 'login',
        component: () => import('pages/user/Login.vue')
      }
    ]
  },
  {
    // 首页及分页页
    path: '/首页',
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
