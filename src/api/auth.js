import request from '@/utils/request'

export function getOrgList(data) {
  return request({
    url: '/admin/org/list',
    method: 'get',
    params: data
  })
}

export function addOrg(data) {
  return request({
    url: '/admin/org/add',
    method: 'post',
    data
  })
}

export function closeOrg(data) {
  return request({
    url: '/admin/org/close',
    method: 'post',
    data
  })
}

export function appQrcode(data) {
  return request({
    url: '/admin/qrcode/appQrcode',
    method: 'get',
    params: data
  })
}

export function updateOrg(data) {
  return request({
    url: '/admin/org/update',
    method: 'post',
    data
  })
}

