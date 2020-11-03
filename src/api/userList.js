import request from '@/utils/request'

export function getUserList(data) {
  return request({
    url: '/admin/user/list',
    method: 'get',
    params: data
  })
}

export function addUser(data) {
  return request({
    url: '/admin/user/add',
    method: 'post',
    data
  })
}

export function delUser(data) {
  return request({
    url: '/admin/user/del',
    method: 'delete',
    data
  })
}

export function updateUser(data) {
  return request({
    url: '/admin/user/update',
    method: 'post',
    data
  })
}

