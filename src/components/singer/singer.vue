<template>
  <div class="singer" ref="singer">
      <list-view @select="selectSinger" :data="singers" ref="list"></list-view>
      <!-- 挂载子路由 -->
      <router-view></router-view>
  </div>
</template>

<script type="text/ecmascript-6">
import {getSingerList} from '../../api/singer';
import {ERR_OK} from '../../api/config';
import Singer from '../../common/js/singer';
import ListView from '../../base/listview/listview';
import {mapMutations} from 'vuex';
import {playlistMixin} from 'common/js/mixin';

const HOT_NAME = '热门';
const HOT_SINGER_LENGTH = 10;

  export default {
    mixins: [playlistMixin],
    data () {
      return {
        singers: []
      };
    },
    created () {
      this._getSingerList();
    },
    components: {
      ListView
    },
    methods: {
      handlePlaylist (playlist) {
        const bottom = playlist.length > 0 ? '60px' : '';
        this.$refs.singer.style.bottom = bottom;
        // 嗲用list-view的refresh()
        this.$refs.list.refresh();
      },
      selectSinger (singer) {
        // 实现路由跳转的另外一种方法，与<router-link>等价
        this.$router.push({
          path: `/singer/${singer.id}`
        });
        // 进行提交
        this.setSinger(singer);
      },
      _getSingerList () {
        getSingerList().then((res) => {
          if (res.code === ERR_OK) {
            this.singers = this._normalizeSinger(res.data.list);
          }
        });
      },
      _normalizeSinger (list) {
        let map = {
          hot: {
            title: HOT_NAME,
            items: []
          }
        };
        list.forEach((item, index) => {
          // 将前面10条热门仿造hot属性里面
          if (index < HOT_SINGER_LENGTH) {
            map.hot.items.push(new Singer({
              id: item.Fsinger_mid,
              name: item.Fsinger_name
            }));
          }
          // 以字母名字作为key，将所有对应的元素放到这个数组里面
          const key = item.Findex;
          if (!map[key]) {
            map[key] = {
              title: key,
              items: []
            };
          }
          map[key].items.push(new Singer({
            id: item.Fsinger_mid,
            name: item.Fsinger_name
          }));
        });
        // return map;
        // 为了得到有序列表，需要处理map
        // console.log(map);
        let hot = [];
        let ret = [];
        for (let key in map) {
          let val = map[key];
          if (val.title === HOT_NAME) {
            hot.push(val);
          } else if (val.title.match(/[a-zA-Z]/)) {
            ret.push(val);
          }
        }
        // 对ret数组里面的对象进行排序
        ret.sort((a, b) => {
          return a.title.charCodeAt(0) - b.title.charCodeAt(0);
        });
        return hot.concat(ret);
      },
      // 这是一个辅助函数
      ...mapMutations({
        // 进行映射
        setSinger: 'SET_SINGER'
      })
    }
  };
</script>

<style lang="less" rel="stylesheet/less">
  .singer {
    position: fixed;
    top: 88px;
    bottom: 0;
    width: 100%;
  }
</style>
