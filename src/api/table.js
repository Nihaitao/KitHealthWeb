import request from '@/utils/request'

export function getList(params) {
  return request({
    url: '/scene',
    method: 'get',
    params
  })
}

export function translate(params) {
  return request({
    url: '/translate',
    method: 'get',
    params
  })
}

export function add(data) {
  return request({
    url: '/addscene',
    method: 'post',
    data
  })
}

export function remove(data) {
  return request({
    url: '/removescene',
    method: 'post',
    data
  })
}

export function top(data) {
  return request({
    url: '/top',
    method: 'post',
    data
  })
}
