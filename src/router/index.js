import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'

/**
 * Note: sub-menu only appear when route children.length >= 1
 * Detail see: https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 *
 * hidden: true                   if set true, item will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu
 *                                if not set alwaysShow, when item has more than one children route,
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noRedirect           if set noRedirect will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    roles: ['admin','editor']    control the page roles (you can set multiple roles)
    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
    icon: 'svg-name'/'el-icon-x' the icon show in the sidebar
    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
 */

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
export const constantRoutes = [
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },

  {
    path: '/404',
    component: () => import('@/views/404'),
    hidden: true
  },

  {
    path: '/',
    component: Layout,
    redirect: '/user',
    meta: { icon: 'el-icon-s-help' },
    children: [
      {
        path: 'user',
        name: 'User',
        component: () => import('@/views/user/index'),
        meta: { title: '人员管理', icon: 'el-icon-user-solid' }
      }
    ]
  },
  
  {
    path: '/cleaning',
    component: Layout,
    redirect: '/cleaning/index',
    meta: { icon: 'el-icon-s-grid' },
    children: [
      {
        path: 'index',
        name: 'Cleaning',
        component: () => import('@/views/cleaning/index'),
        meta: { title: '保洁点管理', icon: 'el-icon-s-home' }
      }
    ]
  },

  {
    path: '/report',
    component: Layout,
    redirect: '/report/index',
    meta: { icon: 'el-icon-s-grid' },
    children: [
      {
        path: 'index',
        name: 'Report',
        component: () => import('@/views/report/index'),
        meta: { title: '报表管理', icon: 'el-icon-s-home' }
      }
    ]
  },

  {
    path: '/holiday',
    component: Layout,
    redirect: '/holiday/index',
    name: 'Inspection',
    meta: { icon: 'el-icon-s-help' },
    children: [
      {
        path: 'index',
        name: 'Holiday',
        component: () => import('@/views/holiday/index'),
        meta: { title: '请假管理', icon: 'el-icon-message-solid' }
      }
    ]
  },

  {
    path: '/sign',
    component: Layout,
    redirect: '/sign/index',
    meta: { icon: 'el-icon-s-comment' },
    children: [
      {
        path: 'index',
        name: 'Sign',
        component: () => import('@/views/sign/index'),
        meta: { title: '签到管理', icon: 'el-icon-s-comment' }
      }
    ]
  },

  {
    path: '/mall',
    component: Layout,
    redirect: '/mall/index',
    meta: { icon: 'el-icon-s-comment' },
    children: [
      {
        path: 'index',
        name: 'Mall',
        component: () => import('@/views/mall/index'),
        meta: { title: '积分商城管理', icon: 'el-icon-s-comment' }
      }
    ]
  },

  {
    path: '/exchange',
    component: Layout,
    redirect: '/exchange/index',
    meta: { icon: 'el-icon-s-comment' },
    children: [
      {
        path: 'index',
        name: 'Exchange',
        component: () => import('@/views/exchange/index'),
        meta: { title: '积分兑换', icon: 'el-icon-s-comment' }
      }
    ]
  },

  {
    path: '/video',
    component: Layout,
    redirect: '/video/index',
    meta: { icon: 'el-icon-s-comment' },
    children: [
      {
        path: 'index',
        name: 'Video',
        component: () => import('@/views/video/index'),
        meta: { title: '视频管理', icon: 'el-icon-s-comment' }
      }
    ]
  },

  {
    path: '/auth',
    component: Layout,
    redirect: '/auth/index',
    meta: { icon: 'el-icon-s-comment' },
    children: [
      {
        path: 'index',
        name: 'Auth',
        component: () => import('@/views/auth/index'),
        meta: { title: '权限开启管理', icon: 'el-icon-s-comment' }
      }
    ]
  },

  {
    path: '/warehouse',
    component: Layout,
    redirect: '/warehouse/index',
    meta: { icon: 'el-icon-s-comment' },
    children: [
      {
        path: 'index',
        name: 'Warehouse',
        component: () => import('@/views/warehouse/index'),
        meta: { title: '仓库管理', icon: 'el-icon-s-comment' }
      }
    ]
  },

  {
    path: '/commodity',
    component: Layout,
    redirect: '/commodity/index',
    meta: { icon: 'el-icon-s-comment' },
    children: [
      {
        path: 'index',
        name: 'Commodity',
        component: () => import('@/views/commodity/index'),
        meta: { title: '商品品类', icon: 'el-icon-s-comment' }
      }
    ]
  },

  {
    path: '/claim',
    component: Layout,
    redirect: '/claim/index',
    meta: { icon: 'el-icon-s-comment' },
    children: [
      {
        path: 'index',
        name: 'Claim',
        component: () => import('@/views/claim/index'),
        meta: { title: '申领记录', icon: 'el-icon-s-comment' }
      }
    ]
  },
  {
    path: '/consume',
    component: Layout,
    redirect: '/consume/index',
    meta: { icon: 'el-icon-s-comment' },
    children: [
      {
        path: 'index',
        name: 'Consume',
        component: () => import('@/views/consume/index'),
        meta: { title: '消耗记录', icon: 'el-icon-s-comment' }
      }
    ]
  },


  // 404 page must be placed at the end !!!
  { path: '*', redirect: '/404', hidden: true }
]

const createRouter = () => new Router({
  // mode: 'history', // require service support
  mode: 'hash',
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
