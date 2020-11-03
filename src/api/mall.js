import request from '@/utils/request'

export function getGoodsList(data) {
  return request({
    url: '/admin/goods/list',
    method: 'get',
    params: data
  })
}

export function addGoods(data) {
  return request({
    url: '/admin/goods/add',
    method: 'post',
    data
  })
}

export function delGoods(data) {
  return request({
    url: '/admin/goods/del',
    method: 'delete',
    data
  })
}


export function getQiNiuToken() {
  return request({
    url: '/admin/upload/token',
    method: 'get',
  })
}

export function updateGoods(data) {
  return request({
    url: '/admin/goods/update',
    method: 'post',
    data
  })
}

