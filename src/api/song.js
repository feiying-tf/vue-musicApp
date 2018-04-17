import {commonParams} from './config';
import axios from 'axios';

export function getLyric (mid) {
  // 访问自己设置的服务器（在自己的服务器中修改referer和host请求得到数据）
  const url = '/api/lyric';

  const data = Object.assign({}, commonParams, {
    songmid: mid,
    platform: 'yqq',
    hostUin: 0,
    needNewCode: 0,
    categoryId: 10000000,
    pcachetime: +new Date(),
    g_kt: 67232076,
    format: 'json'
  });
  return axios.get(url, {
    params: data
  }).then((res) => {
    return Promise.resolve(res.data);
  });
};
