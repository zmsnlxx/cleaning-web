import request from '@/utils/request'

export function login(data) {
  return request({
    url: '/admin/login/login',
    method: 'post',
    data
  })
}

export function getInfo() {
  return request({
    url: '/admin/login/user',
    method: 'get',
  })
}
