import request from '@/utils/request'

export function getIntegralList(data) {
  return request({
    url: '/admin/integral/list',
    method: 'get',
    params: data
  })
}

export function updateIntegral(data) {
  return request({
    url: '/admin/integral/pass',
    method: 'post',
    data
  })
}

