import request from '@/utils/request'

export function getApplyList(data) {
  return request({
    url: '/admin/apply/list',
    method: 'get',
    params: data
  })
}

