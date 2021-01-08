import request from '@/utils/request'

export function updateWarehouse(data) {
  return request({
    url: '/admin/warehouse/update',
    method: 'post',
    data
  })
}

export function getWarehouseList(data) {
  return request({
    url: '/admin/warehouse/list',
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
