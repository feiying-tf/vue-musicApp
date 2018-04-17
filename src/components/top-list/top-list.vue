<template>
  <transition name="slide">
    <music-list :rank="rank" :title="title" :bg-image="bgImage" :songs="songs"></music-list>
  </transition>
</template>

<script type="text/ecmascript-6">
  import MusicList from '../music-list/music-list';
  import {getMusicList} from '../../api/rank';
  import { mapGetters } from 'vuex';
  import {ERR_OK} from '../../api/config';
  // import {mapGetters} from 'vuex'
  import {createSong} from '../../common/js/song';

  export default {
    computed: {
      title () {
        return this.topList.topTitle;
      },
      bgImage () {
        if (this.songs.length) {
          return this.songs[0].image;
        } else {
          return '';
        }
      },
      ...mapGetters([
        'topList'
      ])
    },
    data () {
      return {
        songs: [],
        rank: true
      };
    },
    created () {
      this._getMusicList();
    },
    methods: {
      _getMusicList () {
        // 如果在当前页面刷新，回到父路由
        if (!this.topList.id) {
          this.$router.push('/rank');
          return;
        }
        getMusicList(this.topList.id).then((res) => {
          if (res.code === ERR_OK) {
            this.songs = this._normalizeSongs(res.songlist);
          }
        });
      },
      _normalizeSongs (list) {
        const ret = [];
        list.forEach((item) => {
          const musicData = item.data;
          if (musicData.songid && musicData.albumid) {
            ret.push(createSong(musicData));
          }
        });
        return ret;
      }
    },
    components: {
      MusicList
    }
  };
</script>

<style lang="less" rel="stylesheet/less">
  .slide-enter-active, .slide-leave-active {
    transition: all 0.3s ease;
  }
  .slide-enter, .slide-leave-to {
    transform: translate3d(100%, 0, 0);
  }
</style>
