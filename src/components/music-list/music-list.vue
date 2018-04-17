<template>
  <div class="music-list">
    <div class="back" @click="back">
      <i class="icon-back"></i>
    </div>
    <h1 class="title" v-html="title"></h1>
    <div class="bg-image" :style="bgStyle" ref="bgImage">
      <div class="play-wrapper">
        <div class="play" v-show="songs.length>0" ref="playBtn" @click="random">
          <i class = "icon-play"></i>
          <span class = "text">随机播放全部</span>
        </div>
      </div>
      <div class="filter" ref="filter"></div>
    </div>
    <div class="bg-layer" ref="layer"></div>
    <scroll :data="songs" @scroll="scroll"
            :listen-scroll="listenScroll" :probe-type="probeType" class="list" ref="list">
      <div class="song-list-wrapper">
        <song-list :rank="rank" :songs="songs" @select="selectItem"></song-list>
      </div>
      <div v-show="!songs.length" class="loading-container">
        <loading></loading>
      </div>
    </scroll>
  </div>
</template>

<script type="text/ecmascript-6">
  import Scroll from '../../base/scroll/scroll';
  import Loading from '../../base/loading/loading';
  import SongList from '../../base/song-list/song-list';
  import {prefixStyle} from 'common/js/dom';
  import {playlistMixin} from '../../common/js/mixin';
  import {mapActions} from 'vuex';

  const RESERVED_HEIGHT = 40;
  const transform = prefixStyle('transform');
  const backdrop = prefixStyle('backdrop-filter');
  export default {
    // 当使用以后，mixin里面的方法就相当于定义在了当前组件中，如果有相同的方法
    // 那么当前组件的方法就会覆盖mixin里面的方法
    mixins: [playlistMixin],
    // bgImage、title是sing-tatail的父路由传递过来的，songs是singer-detail发送jsonp请求返回来的数据；
    props: {
      bgImage: {
        type: String,
        default: ''
      },
      songs: {
        type: Array,
        default: function () { return []; }
      },
      title: {
        type: String,
        default: ''
      },
      rank: {
        type: Boolean,
        default: false
      }
    },
    components: {
      Scroll,
      SongList,
      Loading
    },
    computed: {
      bgStyle () {
        return `background-image: url(${this.bgImage})`;
      }
    },
    created () {
      this.probeType = 3;
      this.listenScroll = true;
    },
    mounted () {
      this.imageHeight = this.$refs.bgImage.clientHeight;
      // 限定layer的偏移距离
      this.minTranslateY = -this.imageHeight + RESERVED_HEIGHT;
      // 根Dom元素
      this.$refs.list.$el.style.top = `${this.imageHeight}px`;
    },
    data () {
      return {
        scrollY: 0
      };
    },
    methods: {
      handlePlaylist (playlist) {
        const bottom = playlist.length > 0 ? '60px' : '';
        this.$refs.list.$el.style.bottom = bottom;
        this.$refs.list.refresh();
      },
      scroll (pos) {
        this.scrollY = pos.y;
      },
      back () {
        this.$router.back();
      },
      selectItem (item, index) {
        // 进行提交
        this.selectPlay({
          list: this.songs,
          index
        });
      },
      random () {
        this.randomPlay({
          list: this.songs
        });
      },
      // 映射到actions
      ...mapActions([
        'selectPlay',
        'randomPlay'
      ])
    },
    watch: {
      scrollY (newY) {
        // 因为滚动的距离为负的,所以这儿取max
        let translateY = Math.max(this.minTranslateY, newY);
        let zIndex = 0;
        let scale = 1;
        let blur = 0;
        this.$refs.layer.style[transform] = `translate3d(0, ${translateY}px, 0)`;
        // 单向下滚动的时候，让上面的图片的大小随着
        // 滚动而变化
        const percent = Math.abs(newY / this.imageHeight);
        if (newY > 0) {
          scale = 1 + percent;
          zIndex = 10;
        } else if (newY < this.minTranslateY) {
          // 将图片的层提高，盖住歌曲列表
          zIndex = 10;
          // 固定背景图片的高度
          this.$refs.bgImage.style.paddingTop = 0;
          this.$refs.bgImage.style.height = `${RESERVED_HEIGHT}px`;
          this.$refs.playBtn.style.display = 'none';
        } else {
          zIndex = 0;
          this.$refs.bgImage.style.paddingTop = '70%';
          this.$refs.bgImage.style.height = 0;
          this.$refs.playBtn.style.display = '';
        }
        if (newY < 0) {
          blur = Math.min(20 * percent, 20);
        }
        this.$refs.filter.style[backdrop] = `blur(${blur}px)`;
        this.$refs.filter.style[backdrop] = `blur(${blur}px)`;

        this.$refs.bgImage.style.zIndex = zIndex;
        this.$refs.bgImage.style[transform] = `scale(${scale})`;
      }
    }
  };
</script>

<style lang="less" rel="stylesheet/less">
  @import "../../common/less/variable";
  @import "../../common/less/mixin";
  .music-list {
    position: fixed;
    z-index: 100;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    background: @color-background;
    .back {
      position: absolute;
      top: 0;
      left: 6px;
      z-index: 50;
      .icon-back {
        display: block;
        padding: 10px;
        font-size: @font-size-large-x;
        color: @color-theme;
      }
    }
    .title {
      position: absolute;
      top: 0;
      left: 10%;
      z-index: 40;
      width: 80%;
      .no-wrap();
      text-align: center;
      line-height: 40px;
      font-size: @font-size-large;
      color: @color-text;
    }
    .bg-image {
      position: relative;
      width: 100%;
      height: 0;
      padding-top: 70%;
      // 固定顶部，当放大的时候顶部不动
      transform-origin: top;
      background-size: cover;
      .play-wrapper {
        position: absolute;
        bottom: 20px;
        z-index: 50;
        width: 100%;
        .play {
          box-sizing: border-box;
          width: 135px;
          padding: 7px 0;
          margin: 0 auto;
          text-align: center;
          border: 1px solid @color-theme;
          color: @color-theme;
          border-radius: 100px;
          font-size: 0;
          .icon-play {
            display: inline-block;
            vertical-align: middle;
            margin-right: 6px;
            font-size: @font-size-medium-x;
          }
          .text {
            display: inline-block;
            vertical-align: middle;
            font-size: @font-size-small;
          }
        }
      }
      .filter {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(7, 17, 27, 0.4);
      }
    }
    .bg-layer {
      position: relative;
      height: 100%;
      background: @color-background;
    }
    .list {
      position: fixed;
      top: 0;
      bottom: 0;
      width: 100%;
      background: @color-background;
      .song-list-wrapper {
        padding: 20px 30px;
      }
      .loading-container {
        position: absolute;
        width: 100%;
        top: 50%;
        transform: translateY(-50%);
      }
    }
  }
</style>
