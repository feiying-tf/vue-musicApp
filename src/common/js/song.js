import {getLyric} from '../../api/song';
import {ERR_OK} from '../../api/config';
import {Base64} from 'js-base64';

export default class Song {
    constructor ({id, mid, singer, name, album, duration, image, url}) {
        this.id = id;
        this.mid = mid;
        this.singer = singer;
        this.name = name;
        this.duration = duration;
        this.image = image;
        this.url = url;
        this.album = album;
    }
    getLyric () {
        if (this.lyric) {
            return Promise.resolve(this.lyric);
        }
        const str = 'no lyric';
        return new Promise((resolve, reject) => {
            getLyric(this.mid).then((res) => {
                if (res.retcode === ERR_OK) {
                    this.lyric = Base64.decode(res.lyric);
                    resolve(this.lyric);
                } else {
                    reject(str);
                }
            });
        });
    }
}
export function createSong (musicData) {
    return new Song({
        id: musicData.songid,
        mid: musicData.songmid,
        singer: filterSinger(musicData.singer),
        name: musicData.songname,
        album: musicData.albumname,
        duration: musicData.interval,
        image: `https://y.gtimg.cn/music/photo_new/T002R300x300M000${musicData.albummid}.jpg?max_age=2592000`,
        // 音乐地址
        // url: `http://ws.stream.qqmusic.qq.com/C100${musicData.songmid}.m4a?fromtag=38`
        url: `http://dl.stream.qqmusic.qq.com/C400${musicData.songmid}.m4a?guid=106795008&vkey=AE1D90F43963ABF97FAE0968D8581710AF21B640A32A93C45FF503192B6D352DCCE278E904C9FCC09D883B9AA30BEEDDBE7112C05DA7603D&fromtag=38`
    });
}
export function filterSinger (singer) {
    let ret = [];
    if (!singer) {
        return '';
    }
    singer.forEach((s) => {
        ret.push(s.name);
    });
    return ret.join('/');
}
