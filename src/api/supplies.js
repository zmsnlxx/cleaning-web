import request from '@/utils/request'

export function addSupplies(data) {
  return request({
    url: '/admin/supplies/add',
    method: 'post',
    data
  })
}

export function updateSupplies(data) {
  return request({
    url: '/admin/supplies/update',
    method: 'post',
    data
  })
}

export function delSupplies(data) {
  return request({
    url: '/admin/supplies/del',
    method: 'delete',
    data
  })
}

export function getSuppliesList(data) {
  return request({
    url: '/admin/supplies/list',
    method: 'get',
    params: data
  })
}

export function getSuppliesTypes() {
  return request({
    url: '/admin/supplies/types',
    method: 'get',
  })
}
