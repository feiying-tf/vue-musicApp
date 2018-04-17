<template>
  <transition name="slide">
    <music-list :title="title" :bg-image="bgImage" :songs="songs"></music-list>
  </transition>
</template>

<script type="text/ecmascript-6">
  // import MusicList from 'components/music-list/music-list'
  import {getSingerDetail} from '../../api/singer';
  import {ERR_OK} from '../../api/config';
  import {createSong} from '../../common/js/song';
  // 取数据
  import {mapGetters} from 'vuex';
  import MusicList from '../../components/music-list/music-list';

  export default {
    data () {
      return {
        songs: []
      };
    },
    components: {
      MusicList
    },
    computed: {
      title () {
        return this.singer.name;
      },
      bgImage () {
        return this.singer.avatar;
      },
      ...mapGetters([
        'singer'
      ])
    },
    created () {
      this._getDetail();
      // 这儿是点击页面时传过来的数据
    },
    methods: {
      _getDetail () {
        // 如果在子路由里面直接刷新，这时由于没有id，所以不会获取到数据，
        // 那么就跳转到父路由上面
        if (!this.singer.id) {
          this.$router.push('/singer');
          return;
        }
        // 通过jsonp获取数据
        getSingerDetail(this.singer.id).then((res) => {
          if (res.code === ERR_OK) {
            // 传入返回的数据中的list属性，最终this.songs是一个由很多单歌（每个单歌都是对象）
            // 组成的数组
            // 这儿是通过jsonp申请得到的数据
            this.songs = this._normalizeSongs(res.data.list);
          }
        });
      },
      // 将每首歌的所需数据放到一个对象里面，然后全部push到一个数组里面
      _normalizeSongs (list) {
        let ret = [];
        list.forEach(item => {
          // es6中的解构语法，musicDate=item.musicData
          let {musicData} = item;
          if (musicData.songid && musicData.albummid) {
            ret.push(createSong(musicData));
          }
        });
        return ret;
      }
    }
  };
</script>

<style lang="less" rel="stylesheet/less">
  @import "../../common/less/variable";
  .singer-detail {
    position: fixed;
    z-index: 100;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: @color-background;
  }
  .slide-enter-active, .slide-leave-active {
    transition: all .3s;
  }
  .slide-enter, .slide-leave-to {
    transform: translate3d(100%, 0, 0);
  }
</style>
