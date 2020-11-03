import request from '@/utils/request'

export function orgChange(data) {
  return request({
    url: '/admin/org/change',
    method: 'get',
    params: data
  })
}

export function updateLeave(data) {
  return request({
    url: '/admin/leave/pass',
    method: 'post',
    data
  })
}

