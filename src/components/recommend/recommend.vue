<template>
  <div class="recommend" ref="recommend">
    <scroll class="recommend-content" :data="discList" ref="scroll">
      <div>
        <!-- 当recommends获取到了以后再渲染 -->
        <div class="slider-wrapper" ref="sliderWrapper" v-if="recommends.length">
          <slider>
            <div v-for="item in recommends" :key=item.id>
              <a :href="item.linkUrl">
                <!-- 监听图片的加载事件 -->
                <!-- 当better-scroll中的click与fastclick发生冲突时，用fastclick中的needsclick忽略
                better-scroll的点击事件 -->
                <img class="needsclick" :src="item.picUrl" @load="loadImage">
              </a>
            </div>
          </slider>
        </div>
        <div class="recommend-list">
          <h1 class="list-title">热门歌单推荐</h1>
          <ul>
            <li @click="selectItem(item)" v-for="item in discList" class="item" :key = item.id>
              <div class="icon">
                <img width="60" height="60" v-lazy="item.imgurl">
              </div>
              <div class="text">
                <!-- v-html会将元素进行转义，然后当成HTML标签解析 -->
                <h2 class="name" v-html="item.creator.name"></h2>
                <p class="desc" v-html="item.dissname"></p>
              </div>
            </li>
          </ul>
        </div>
      </div>
      <div class="loading-container" v-show="!discList.length">
        <loading></loading>
      </div> -->
    </scroll>
    <router-view></router-view>
  </div>
</template>

<script type="text/ecmascript-6">
    import {getRecommend, getDiscList} from '../../api/recommend';
    import {ERR_OK} from '../../api/config';
    import Slider from '../../base/slider/slider';
    import Scroll from '../../base/scroll/scroll';
    import Loading from '../../base/loading/loading';
    import {playlistMixin} from 'common/js/mixin';
    import {mapMutations} from 'vuex';

    export default {
      mixins: [playlistMixin],
      data () {
        return {
          recommends: [],
          discList: [],
          checkLoaded: false
        };
      },
      created () {
          // 调用methods里面的方法；
          this._getRecommend();
          this._getDiscList();
      },
      components: {
        Slider,
        Scroll,
        Loading
      },
      methods: {
          handlePlaylist (playlist) {
            const bottom = playlist.length > 0 ? '60px' : '';
            this.$refs.recommend.style.bottom = bottom;
            this.$refs.scroll.refresh();
          },
          selectItem (item) {
            // 上传到vuex
            this.setDisc(item);
            this.$router.push({
              // 歌单详情页是通过歌单的dissid决定的
              path: `/recommend/${item.dissid}`
            });
          },
          _getRecommend () {
              getRecommend().then((res) => {
                  // 如果状态码等于ERR_OK
                  if (res.code === ERR_OK) {
                      this.recommends = res.data.slider;
                      // 将获取到的轮播图的数据传递给recommends
                      // this.recommends = res.data.slider;
                  }
              });
          },
          _getDiscList () {
            getDiscList().then((res) => {
              if (res.code === ERR_OK) {
                  this.discList = res.data.list;
              }
            });
          },
          loadImage () {
            if (!this.checkLoaded) {
              this.$refs.scroll.refresh();
              this.checkLoaded = true;
            }
          },
          ...mapMutations({
            setDisc: 'SET_DISC'
          })
      }
  };
</script>

<style lang="less" rel="stylesheet/less">
  @import "../../common/less/variable";
  .recommend {
    position: fixed;
    width: 100%;
    top: 88px;
    bottom: 0;
    .recommend-content {
      height: 100%;
      overflow: hidden;
      .slider-wrapper {
        position: relative;
        width: 100%;
        overflow: hidden;
      }
      .recommend-list {
        .list-title {
          height: 65px;
          line-height: 65px;
          text-align: center;
          font-size: @font-size-medium;
          color: @color-theme;
        }
        .item {
          display: flex;
          box-sizing: border-box;
          align-items: center;
          padding: 0 20px 20px 20px;
          .icon {
            flex: 0 0 60px;
            width: 60px;
            padding-right: 20px;
          }
          .text {
            display: flex;
            flex-direction: column;
            justify-content: center;
            flex: 1;
            line-height: 20px;
            overflow: hidden;
            font-size: @font-size-medium;
            .name {
              margin-bottom: 10px;
              color: @color-text;
            }
            .desc {
              color: @color-text-d;
            }
          }
        }
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
