import request from '@/utils/request'

export function getSignList(data) {
  return request({
    url: '/admin/sign/list',
    method: 'get',
    params: data
  })
}

