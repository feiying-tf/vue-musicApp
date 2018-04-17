<template>
    <div class="player" v-show="playlist.length>0">
      <!-- vue提供的钩子函数 -->
      <transition name="normal"
                  @enter="enter"
                  @after-enter="afterEnter"
                  @leave="leave"
                  @after-leave="afterLeave">
        <div class="normal-player" v-show="fullScreen">
          <div class="background">
            <img width="100%" height="100%" :src="currentSong.image">
          </div>
          <div class="top">
            <div class="back" @click="back">
              <i class="icon-back"></i>
            </div>
            <h1 class="title" v-html="currentSong.name"></h1>
            <h2 class="subtitle" v-html="currentSong.singer"></h2>
          </div>
          <div class="middle"
               @touchstart.prevent="middleTouchStart"
               @touchmove.prevent="middleTouchMove"
               @touchend="middleTouchEnd">
            <div class="middle-l" ref="middleL">
              <div class="cd-wrapper" ref="cdWrapper">
                <div class="cd" :class="cdCls">
                  <img class="image" :src="currentSong.image">
                </div>
              </div>
              <!-- 播放器下面显示的歌词 -->
              <div class="playing-lyric-wrapper">
                <div class="playing-lyric">{{playingLyric}}</div>
              </div>
            </div>
            <scroll class="middle-r" ref="lyricList" :data="currentLyric && currentLyric.lines">
              <div class="lyric-wrapper">
                <div v-if="currentLyric">
                  <p ref="lyricLine"
                    class="text"
                    :class="{'current': currentLineNum === index}"
                    v-for="(line,index) in currentLyric.lines"
                    :key = line.id>{{line.txt}}</p>
                </div>
              </div>
            </scroll>
          </div>
          <div class="bottom">
            <!-- 显示当前的页面 -->
            <div class="dot-wrapper">
              <span class="dot" :class="{'active':currentShow==='cd'}"></span>
              <span class="dot" :class="{'active':currentShow==='lyric'}"></span>
            </div>
            <!-- 进度条部分开始 -->
            <div class="progress-wrapper">
              <span class="time time-l">{{format(currentTime)}}</span>
              <div class="progress-bar-wrapper">
                <progress-bar :percent="percent" @percentChange="onProgressBarChange"></progress-bar>
              </div>
              <!-- 显示歌曲的总时间 -->
              <span class="time time-r">{{format(currentSong.duration)}}</span>
            </div>
            <!-- 进度条部分结束 -->
            <div class="operators">
              <div class="icon i-left" @click="changeMode">
                <i :class="iconMode"></i>
              </div>
              <div class="icon i-left" :class="disableCls">
                <i @click="prev" class="icon-prev"></i>
              </div>
              <div class="icon i-center" :class="disableCls">
                <i @click="togglePlaying" :class="playIcon"></i>
              </div>
              <div class="icon i-right" :class="disableCls">
                <i @click="next" class="icon-next"></i>
              </div>
              <div class="icon i-right">
                <i @click="toggleFavorite(currentSong)" class="icon" :class="getFavoriteIcon(currentSong)"></i>
              </div>
            </div>
          </div>
        </div>
      </transition>
      <transition name="mini">
        <div class="mini-player" v-show="!fullScreen" @click = "open">
          <div class="icon">
            <img :class="cdCls" width="40" height="40" :src="currentSong.image">
          </div>
          <div class="text">
            <h2 class="name" v-html="currentSong.name"></h2>
            <p class="desc" v-html="currentSong.singer"></p>
          </div>
          <div class="control">
            <progress-circle :radius="radius" :percent="percent">
              <i @click.stop="togglePlaying" class="icon-mini" :class="miniIcon"></i>
            </progress-circle>
          </div>
          <div class="control" @click.stop="showPlaylist">
            <i class="icon-playlist"></i>
          </div>
        </div>
      </transition>
    <playlist ref="playlist"></playlist>
    <!-- 播放标签 -->
    <!-- 当歌曲可以播放的时候，会派发一个canplay事件 -->
    <!-- 当访问链接发生错误的时候，会派发一个error事件 -->
    <audio ref="audio" :src="currentSong.url" @play="ready" @error="error"
    @timeupdate="updateTime" @ended="end"></audio>
  </div>
</template>

<script type="text/ecmascript-6">
  import {mapGetters, mapMutations, mapActions} from 'vuex';
  // import {mapGetters, mapMutations, mapActions} from 'vuex'
  import animations from 'create-keyframe-animation';
  import {prefixStyle} from '../../common/js/dom';
  import ProgressBar from '../../base/progress-bar/progress-bar';
  import ProgressCircle from '../../base/progress-circle/progress-circle';
  import {playMode} from '../../common/js/config';
  // import {shuffle} from '../../common/js/util';
  import Lyric from 'lyric-parser';
  import Scroll from '../../base/scroll/scroll';
  import {playerMixin} from '../../common/js/mixin';
  import Playlist from '../playlist/playlist';
  const transform = prefixStyle('transform');
  const transitionDuration = prefixStyle('transitionDuration');
  export default {
    mixins: [playerMixin],
    data () {
        return {
          songReady: false,
          currentTime: 0,
          radius: 32,
          currentLyric: null,
          currentLineNum: 0,
          currentShow: 'cd',
          playingLyric: ''
        };
      },
    computed: {
      cdCls () {
        // 这儿如果是pause，那么暂停的时候，图片会变成原来的样子
        // 如果是play pause，那么就会停止在当前状态
        return this.playing ? 'play' : 'play pause';
      },
      miniIcon () {
        return this.playing ? 'icon-pause-mini' : 'icon-play-mini';
      },
      playIcon () {
        return this.playing ? 'icon-pause' : 'icon-play';
      },
      // 如果this.song还没准备好，元素的一切点击无效
      disableCls () {
        // console.log(this.songReady);
        return this.songReady ? '' : 'disable';
      },
      percent () {
        // 计算进度的百分比
        return this.currentTime / this.currentSong.duration;
      },
      // 获取数据
      ...mapGetters([
        'fullScreen',
        'playing',
        'currentIndex'
      ])
    },
    created () {
      this.touch = {};
    },
    methods: {
      back () {
        this.setFullScreen(false);
      },
      end () {
        // 如果当前模式是循环播放
        if (this.mode === playMode.loop) {
          this.loop();
        } else {
          this.next();
        }
      },
      loop () {
        this.$refs.audio.currentTime = 0;
        this.$refs.audio.play();
        if (this.currentLyric) {
          // 将歌词偏移到最开始的地方
          this.currentLyric.seek(0);
        }
      },
      // 下一首歌
      next () {
        // 如果歌曲没有转备好，就不让点下一首
        if (!this.songReady) {
          return;
        }
        if (this.playlist.length === 1) {
          this.loop();
          return;
        } else {
          let index = this.currentIndex + 1;
          if (index === this.playlist.length) {
            index = 0;
          }
          // 上传歌曲索引
          this.setCurrentIndex(index);
          // 如果暂停的时候点击下一曲，那么就修改当前的playing状态
          if (!this.playing) {
            this.togglePlaying();
          }
        }
        // 将songReady至于false
        this.songReady = false;
      },
      // 上一首歌
      prev () {
        // 如果歌曲没有转备好，就不让点下一首
        if (!this.songReady) {
          return;
        }
        if (this.playlist.length === 1) {
          this.loop();
          return;
        } else {
          let index = this.currentIndex - 1;
          if (index === -1) {
            index = this.playlist.length - 1;
          }
          // 上传歌曲索引
          this.setCurrentIndex(index);
          // 如果暂停的时候点击下一曲，那么就修改当前的playing状态
          if (!this.playing) {
            this.togglePlaying();
          }
        }
        this.songReady = false;
      },
      ready () {
        this.songReady = true;
        this.savePlayHistory(this.currentSong);
      },
      // 如果没有网络或者下一首歌曲不存在
      error () {
        this.songReady = true;
      },
      updateTime (e) {
        // 将audio播放的当前时间传给定义的currentTime
        this.currentTime = e.target.currentTime;
        // this.$refs.time.innerHTML = this.format(this.currentTime);
      },
      // 将获取的时间戳进行转换
      format (interval) {
        // 向下取整
        interval = interval | 0;
        let minute = interval / 60 | 0;
        let second = interval % 60;
        second = second.toString();
        second = second.padStart(2, '0');
        return `${minute}:${second}`;
      },
      // 控制条发生变化时
      onProgressBarChange (percent) {
        const currentTime = this.currentSong.duration * percent;
        // 设置当前播放的时间
        this.$refs.audio.currentTime = this.currentSong.duration * percent;
        if (!this.playing) {
          this.togglePlaying();
        }
        // 对歌词进行偏移
        if (this.currentLyric) {
          this.currentLyric.seek(currentTime * 1000);
        }
      },
      getLyric () {
        this.currentSong.getLyric().then((lyric) => {
          if (this.currentSong.lyric !== lyric) {
            return;
          }
          this.currentLyric = new Lyric(lyric, this.handleLyric);
          // 如果是播放状态
          if (this.playing) {
            this.currentLyric.play();
          }
        }).catch(() => {
           this.currentLyric = null;
           this.playingLyric = '';
           this.currentLineNum = 0;
        });
      },
      // lineNum 是当前播放的行数
      handleLyric ({lineNum, txt}) {
        this.currentLineNum = lineNum;
        // 当当前播放的行数超过第5行时，开始向上滚，
        // 这样就可以保证高亮的部分一直在中间
        if (lineNum > 5) {
          let lineEl = this.$refs.lyricLine[lineNum - 5];
          this.$refs.lyricList.scrollToElement(lineEl, 1000);
        } else {
          this.$refs.lyricList.scrollTo(0, 0, 1000);
        }
        this.playingLyric = txt;
      },
      // 显示歌曲小列表
      showPlaylist () {
        this.$refs.playlist.show();
      },
      // 实现滑动
      middleTouchStart (e) {
        this.touch.initiated = true;
        const touch = e.touches[0];
        this.touch.startX = touch.pageX;
        this.touch.startY = touch.pageY;
      },
      middleTouchMove (e) {
        if (!this.touch.initiated) {
          return;
        }
        const touch = e.touches[0];
        const deltaX = touch.pageX - this.touch.startX;
        const deltaY = touch.pageY - this.touch.startY;
        // 如果纵向的偏移值大于横向的偏移值便认为是纵向滑动
        if (Math.abs(deltaY) > Math.abs(deltaX)) {
          return;
        }
        const left = this.currentShow === 'cd' ? 0 : -window.innerWidth;
        // width是歌词的偏移量
        const offsetWidth = Math.min(0, Math.max(-window.innerWidth, left + deltaX));
        this.touch.percent = Math.abs(offsetWidth / window.innerWidth);
        console.log(this.$refs.lyricList);
        // 如果是设置组件的dom，就必须加上$el
        this.$refs.lyricList.$el.style[transform] = `translate3d(${offsetWidth}px, 0, 0)`;
        // 手指触碰移动的时候不产生动画
        this.$refs.lyricList.$el.style[transitionDuration] = 0;
        this.$refs.middleL.style.opacity = 1 - this.touch.percent;
        this.$refs.middleL.style[transitionDuration] = 0;
      },
      middleTouchEnd () {
        // 决定歌词最后的位置
        let offsetWidth;
        let opacity;
        if (this.currentShow === 'cd') {
          if (this.touch.percent > 0.1) {
            offsetWidth = -window.innerWidth;
            opacity = 0;
            this.currentShow = 'lyric';
          } else {
            offsetWidth = 0;
            opacity = 1;
          }
        } else {
          if (this.touch.percent < 0.9) {
            offsetWidth = 0;
            this.currentShow = 'cd';
            opacity = 1;
          } else {
            offsetWidth = -window.innerWidth;
            opacity = 0;
          }
        }
        const time = 300;
        this.$refs.lyricList.$el.style[transform] = `translate3d(${offsetWidth}px, 0, 0)`;
        // 让过渡效果持续300ms
        this.$refs.lyricList.$el.style[transitionDuration] = `${time}ms`;
        this.$refs.middleL.style.opacity = opacity;
        this.$refs.middleL.style[transitionDuration] = `${time}ms`;
      },
      open () {
        this.setFullScreen(true);
      },
      enter (el, done) {
        const {x, y, scale} = this._getPosAndScale();
        let animation = {
          0: {
            transform: `translate3d(${x}px, ${y}px, 0) scale(${scale})`
          },
          60: {
            transform: `translate3d(0, 0, 0) scale(${1.1})`
          },
          100: {
            transform: `translate3d(0, 0, 0) scale(${1})`
          }
        };
        // 注册动画
        animations.registerAnimation({
          name: 'move',
          animation,
          presets: {
            // 动画时间
            duration: 400,
            // 线性
            easing: 'linear'
          }
        });
        // 运行动画
        animations.runAnimation(this.$refs.cdWrapper, 'move', done);
      },
      afterEnter () {
        animations.unregisterAnimation('move');
        // 清空动画
        this.$refs.cdWrapper.style.animation = '';
      },
      leave (el, done) {
        this.$refs.cdWrapper.style.transition = 'all 0.6s';
        const {x, y, scale} = this._getPosAndScale();
        this.$refs.cdWrapper.style[transform] = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
        // 当动画执行完了，就调用done执行函数
        this.$refs.cdWrapper.addEventListener('transitionend', done);
      },
      afterLeave () {
        this.$refs.cdWrapper.style.transition = '';
        this.$refs.cdWrapper.style[transform] = '';
      },
      togglePlaying () {
        if (!this.songReady) {
          return;
        }
        this.setPlayingState(!this.playing);
        // 当切换当前播放模式的时候，歌词的播放模式也跟着修改
        if (this.currentLyric) {
          this.currentLyric.togglePlay();
        }
      },
      _getPosAndScale () {
        const targetWidth = 40;
        const paddingLeft = 40;
        // const paddingBottom = 30;
        const paddingTop = 80;
        const width = window.innerWidth * 0.8;
        const scale = targetWidth / width;
        const x = -(window.innerWidth / 2 - paddingLeft);
        const y = window.innerHeight - paddingTop - width / 2 - paddingTop;
        return {
          x,
          y,
          scale
        };
      },
      ...mapMutations({
        setFullScreen: 'SET_FULL_SCREEN'
      }),
      ...mapActions([
        'savePlayHistory'
      ])
    },
    watch: {
      currentSong (newSong, oldSong) {
        if (!newSong.id) {
          return;
        }
        if (newSong.id === oldSong.id) {
          return;
        }
        // 每次切换歌曲必须将对应的Lyric给停止掉
        // 否则内部就会有多个定时器，当切换歌曲时，造成歌词的跳动
        if (this.currentLyric) {
          this.currentLyric.stop();
        }
        clearTimeout(this.timer);
        this.timer = setTimeout(() => {
          this.$refs.audio.play();
          this.getLyric();
        }, 1000);
      },
      playing (newPlaying) {
        const audio = this.$refs.audio;
        this.$nextTick(() => {
          newPlaying ? audio.play() : audio.pause();
        });
      }
    },
    components: {
      ProgressBar,
      ProgressCircle,
      Scroll,
      Playlist
    }
  };
</script>

<style lang="less" rel="stylesheet/less">
  @import "../../common/less/variable";
  @import "../../common/less/mixin";

  .player
    .normal-player {
      position: fixed;
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
      z-index: 150;
      background: @color-background;
      .background {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        z-index: -1;
        opacity: 0.6;
        filter: blur(20px);
      }
      .top {
        position: relative;
        margin-bottom: 25px;
        .back {
          position: absolute;
          top: 0;
          left: 6px;
          z-index: 50;
          .icon-back {
            display: block;
            padding: 9px;
            font-size: @font-size-large-x;
            color: @color-theme;
            transform: rotate(-90deg);
          }
        }
        .title {
          width: 70%;
          margin: 0 auto;
          line-height: 40px;
          text-align: center;
          .no-wrap();
          font-size: @font-size-large;
          color: @color-text;
        }
        .subtitle {
          line-height: 20px;
          text-align: center;
          font-size: @font-size-medium;
          color: @color-text;
        }
      }
      .middle {
        position: fixed;
        width: 100%;
        top: 80px;
        bottom: 170px;
        white-space: nowrap;
        font-size: 0;
        .middle-l {
          display: inline-block;
          vertical-align: top;
          position: relative;
          width: 100%;
          height: 0;
          padding-top: 80%;
          .cd-wrapper {
            position: absolute;
            left: 10%;
            top: 0;
            width: 80%;
            height: 100%;
            .cd {
              width: 100%;
              height: 100%;
              box-sizing: border-box;
              border: 10px solid rgba(255, 255, 255, 0.1);
              border-radius: 50%;
              &.play {
                animation: rotate 20s linear infinite;
              }
              &.pause {
                animation-play-state: paused;
              }
              .image {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                height: 100%;
                border-radius: 50%;
              }
            }
          }
          .playing-lyric-wrapper {
            width: 80%;
            margin: 30px auto 0 auto;
            overflow: hidden;
            text-align: center;
            .playing-lyric {
              height: 20px;
              line-height: 20px;
              font-size: @font-size-medium;
              color: @color-text-l;
            }
          }
        }
        .middle-r {
          display: inline-block;
          vertical-align: top;
          width: 100%;
          height: 100%;
          overflow: hidden;
          .lyric-wrapper {
            width: 80%;
            margin: 0 auto;
            overflow: hidden;
            text-align: center;
            .text {
              line-height: 32px;
              color: @color-text-l;
              font-size: @font-size-medium;
              &.current {
                color: @color-text;
              }
            }
          }
        }
      }
      .bottom {
        position: absolute;
        bottom: 50px;
        width: 100%;
        .dot-wrapper {
          text-align: center;
          font-size: 0;
          .dot {
            display: inline-block;
            vertical-align: middle;
            margin: 0 4px;
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: @color-text-l;
            &.active {
              width: 20px;
              border-radius: 5px;
              background: @color-text-ll;
            }
          }
        }
        .progress-wrapper {
          display: flex;
          align-items: center;
          width: 80%;
          margin: 0px auto;
          padding: 10px 0;
          .time {
            color: @color-text;
            font-size: @font-size-small;
            flex: 0 0 30px;
            line-height: 30px;
            width: 30px;
            &.time-l {
              text-align: left;
            }
            &.time-r {
              text-align: right;
            }
          }
          .progress-bar-wrapper {
            flex: 1;
          }
        }
        .operators {
          display: flex;
          align-items: center;
          .icon {
            flex: 1;
            color: @color-theme;
            &.disable {
              color: @color-theme-d;
            }
            i {
              font-size: 30px;
            }
          }
          .i-left {
            text-align: right;
          }
          .i-center {
            padding: 0 20px;
            text-align: center;
            i {
              font-size: 40px;
            }
          }
          .i-right {
            text-align: left;
          }
          .icon-favorite {
            color: @color-sub-theme;
          }
        }
      }
      &.normal-enter-active, &.normal-leave-active {
        transition: all 0.4s;
        .top, .bottom {
          transition: all 0.4s cubic-bezier(0.86, 0.18, 0.82, 1.32);
        }
      }
      &.normal-enter, &.normal-leave-to {
        opacity: 0;
        .top {
          transform: translate3d(0, -100px, 0);
        }
        .bottom {
          transform: translate3d(0, 100px, 0);
        }
      }
    }
    .mini-player {
      display: flex;
      align-items: center;
      position: fixed;
      left: 0;
      bottom: 0;
      z-index: 180;
      width: 100%;
      height: 60px;
      background: @color-highlight-background;
      &.mini-enter-active, &.mini-leave-active {
        transition: all 0.4s;
      }
      &.mini-enter, &.mini-leave-to {
        opacity: 0;
      }
      .icon {
        flex: 0 0 40px;
        width: 40px;
        padding: 0 10px 0 20px;
        img {
          border-radius: 50%;
          &.play {
            // css3 播放动画
            animation: rotate 10s linear infinite;
          }
          &.pause {
            // css3 动画播放状态
            animation-play-state: paused;
          }
        }
      }
      .text {
        display: flex;
        flex-direction: column;
        justify-content: center;
        flex: 1;
        line-height: 20px;
        overflow: hidden;
        .name {
          margin-bottom: 2px;
          .no-wrap();
          font-size: @font-size-medium;
          color: @color-text;
        }
        .desc {
          .no-wrap();
          font-size: @font-size-small;
          color: @color-text-d;
        }
      }
      .control {
        flex: 0 0 30px;
        width: 30px;
        padding: 0 10px;
        .icon-play-mini, .icon-pause-mini, .icon-playlist {
          font-size: 30px;
          color: @color-theme-d;
        }
        .icon-mini {
          font-size: 32px;
          position: absolute;
          left: 0;
          top: 0;
        }
      }
    }
    // 自定义动画
  @keyframes rotate {
    0% {
      transform: rotate(0);
    }
    100% {
      transform: rotate(360deg);
    }
  }
</style>
