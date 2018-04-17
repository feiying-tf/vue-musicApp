<template>
  <div class="slider" ref="slider">
    <div class = "slider-group" ref = "sliderGroup">
      <slot>
      </slot>
    </div>
    <div class="dots" >
        <!-- 循环生成小圆圈 -->
        <span class="dot" v-for="(item, index) in dots" :key=index :class="{active: currentPageIndex1 === index }"></span>
        <!-- <span class="dot" :class="{active: currentPageIndex === index }" v-for="(item, index) in dots" :key=index></span> -->
    </div>
  </div>
</template>

<script type="text/ecmascript-6">
//   import {addClass} from 'common/js/dom';
  import BScroll from 'better-scroll';
  import {addClass} from '../../common/js/dom';
    export default {
        data () {
            return {
                dots: [],
                // 当前显示的页面索引
                currentPageIndex: 0,
                currentPageIndex1: 0
            };
        },
        props: {
            loop: {
                type: Boolean,
                default: true
            },
            autoPlay: {
                type: Boolean,
                default: true
            },
            interval: {
                type: Number,
                default: 2000
            }
        },
        mounted () {
            // 与this.$nextTick作用一样，等dom加载完毕以后，再执行
            // better-scroll初始化
            // 20毫秒，因为浏览器的刷新事件时17ms一次
            setTimeout(() => {
                // 设置内容宽度
                this._setSliderWidth();
                // 初始化控制轮播图的小圆点,这个必须放在轮播图初始化前面，才能是5个
                this._initDots();
                // 初始化轮播
                this._initSlider();
                // this.slider.refresh();
                if (this.autoPlay) {
                    this._play();
                }
            }, 20);
            window.addEventListener('resize', () => {
                console.log(1111);
                if (!this.slider) {
                    return;
                }
                this._setSliderWidth(true);
                this.slider.refresh();
            });
        },
        // 组件被激活时调用
        activated () {
            if (this.autoPlay) {
                this._play();
            }
        },
        // 组件被移除时调用
        deactivated () {
            clearTimeout(this.timer);
        },
        // 组件销毁前调用
        beforeDestroy () {
            clearTimeout(this.timer);
        },
        methods: {
            _setSliderWidth (isResize) {
                // 获取sliderGroup里面的children
                this.children = this.$refs.sliderGroup.children;
                let width = 0;
                let sliderWidth = this.$refs.slider.clientWidth;
                for (let i = 0; i < this.children.length; i++) {
                    let child = this.children[i];
                    // 将每个child都添加slider-item这个类，确保它的样式是正确的
                    addClass(child, 'slider-item');
                    child.style.width = sliderWidth + 'px';
                    width += sliderWidth;
                }
                if (this.loop && !isResize) {
                    // 轮播的时候必须保证两边各有一张多余的图片，
                    // 所以宽度必须多加两个画面的宽度
                    width += 2 * sliderWidth;
                }
                this.$refs.sliderGroup.style.width = width + 'px';
            },
            _initSlider () {
                this.slider = new BScroll(this.$refs.slider, {
                    // 允许水平移动
                    scrollX: true,
                    // 不允许垂直移动
                    scrollY: false,
                    // 当快速滑动时开启滑动惯例
                    momentum: false,
                    // 获取滚动的当前页
                    snap: true,
                    // 设置无缝滚动
                    snapLoop: this.loop,
                    // 手指滑动的阈值，大于这个阈值，滑动到下一页
                    snapThreshold: 0.3,
                    // 轮播图切换的动画时间，400ms
                    snapSpeed: 400
                    // 允许点击
                    // click: true
                });
                this.slider.on('scrollEnd', () => {
                    // 获取当前页面的索引值
                    let pageIndex = this.slider.getCurrentPage().pageX;
                    // 当用手进行滚动时，对小圆点的状态进行更新
                    this.currentPageIndex1 = pageIndex - 1;
                    // 如果是循环滚动
                    if (this.loop) {
                        // 由于前面克隆了一张，所以这里减1
                        // 并且由于当页面滑到第六张的时候它会马上跳到第2张
                        // 然后小圆点就又跳到第一个位置了
                        pageIndex -= 1;
                    }
                    this.currentPageIndex = pageIndex;
                    // 如果要实现自动轮播。每次切换完毕之后就必须要重新
                    // 执行一次切换，如果不这样那么只会在初始化的时候执行一次
                    // 因为setTimeout只会执行一次
                    if (this.autoPlay) {
                        clearTimeout(this.timer);
                        this._play();
                    }
                });
                this.slider.on('beforeScrollStart', () => {
                    if (this.autoPlay) {
                        clearTimeout(this.timer);
                    }
                });
            },
            _initDots () {
                this.dots = new Array(this.children.length);
            },
            _play () {
                let pageIndex = this.currentPageIndex + 1;
                if (this.loop) {
                    pageIndex += 1;
                }
                // currentPageIndex1的序列号从0开始
                this.timer = setTimeout(() => {
                    // this.currentPageIndex1 = this.currentPageIndex;
                    this.currentPageIndex1 = (pageIndex - 1) > 4 ? 0 : (pageIndex - 1);
                    // 0代表y方向 400 代表时间间隔
                    this.slider.goToPage(pageIndex, 0, 500);
                }, this.interval);
            }
        },
        // 在组件销毁的时候尽量清除定时器
        destroyed () {
            clearTimeout(this.timer);
        }
    };
</script>

<style lang="less" rel="stylesheet/less">
  @import "../../common/less/variable";
  .slider {
    min-height: 1px;
    position: relative;
    .slider-group {
      position: relative;
      overflow: hidden;
      white-space: nowrap;
      .slider-item {
        float: left;
        box-sizing: border-box;
        overflow: hidden;
        text-align: center;
        a {
          display: block;
          width: 100%;
          overflow: hidden;
          text-decoration: none;
        }
        img {
          display: block;
          width: 100%;
        }
      }
    }
    .dots {
      position: absolute;
      right: 0;
      left: 0;
      bottom: 12px;
      text-align: center;
      font-size: 0;
      .dot {
        display: inline-block;
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
  }
</style>
