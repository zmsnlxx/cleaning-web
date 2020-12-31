import request from '@/utils/request'

export function getSignList(data) {
  return request({
    url: '/admin/sign/v2/list',
    method: 'get',
    params: data
  })
}

