import jsonp from 'common/js/jsonp';
import {commonParams, options} from './config';
import axios from 'axios';
// import axios from 'axios';

export function getRecommend () {
    const url = 'https://c.y.qq.com/musichall/fcgi-bin/fcg_yqqhomepagerecommend.fcg';
    const data = Object.assign({}, commonParams, {
        platform: 'h5',
        uin: 0,
        needNewCode: 1
    });
    return jsonp(url, data, options);
}
export function getDiscList () {
    // 这儿采用普通的ajax请求
    const url = '/api/getDiscList';
    const data = Object.assign({}, commonParams, {
        platform: 'yqq',
        hostUin: 0,
        sin: 29,
        sortId: 5,
        needNewCode: 0,
        categoryId: 10000000,
        rnd: Math.random(),
        // 设置返回的数据格式
        format: 'json'
    });
    return axios.get(url, {
        params: data
    }).then((res) => {
        // 创建以完成的promise
        return Promise.resolve(res.data);
    });
}

export function getSongList (dissid) {
    console.log('这儿是disstid');
    console.log(dissid);
    // 这儿采用普通的ajax请求
    const url = '/api/getSongList';
    const data = Object.assign({}, commonParams, {
        disstid: dissid,
        type: 1,
        utf8: 1,
        onlysong: 0,
        platform: 'yqq',
        hostUin: 0,
        needNewCode: 0,
        g_tk: 5381,
        format: 'json'
    });
    return axios.get(url, {
        params: data
    }).then((res) => {
        return Promise.resolve(res.data);
    });
}
