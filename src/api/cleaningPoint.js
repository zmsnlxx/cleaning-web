import request from '@/utils/request'

export function getCleaningPointList(data) {
  return request({
    url: '/admin/cleaningPoint/list',
    method: 'get',
    params: data
  })
}

export function addCleaningPoint(data) {
  return request({
    url: '/admin/cleaningPoint/add',
    method: 'post',
    data
  })
}

export function updateCleaningPoint(data) {
  return request({
    url: '/admin/cleaningPoint/update',
    method: 'put',
    data
  })
}

export function delCleaningPoint(data) {
  return request({
    url: '/admin/cleaningPoint/del',
    method: 'delete',
    data
  })
}

export function getCleaningQrcode(data) {
  return request({
    url: '/admin/cleaningPoint/cleaningQrcode',
    method: 'get',
    params: data
  })
}

export function getInspectionQrcode(data) {
  return request({
    url: '/admin/cleaningPoint/inspectionQrcode',
    method: 'get',
    params: data
  })
}

