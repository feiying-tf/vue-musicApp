<template>
    <scroll class="listview"
            :data="data"
            ref="listview"
            :listenScroll="listenScroll"
            @scroll="scroll"
            :probeType="probeType">
        <!-- 列表 -->
        <ul>
            <li v-for="group in data" class="list-group" :key="group.id" ref="listGroup">
                <h2 class="list-group-title">{{group.title}}</h2>
                <ul>
                    <li @click="selectItem(item)" v-for="item in group.items" class="list-group-item" :key="item.id">
                        <img v-lazy="item.avatar" class="avatar">
                        <span class="name">{{item.name}}</span>
                    </li>
                </ul>
            </li>
        </ul>
        <!-- 快速导航 -->
        <div class="list-shortcut" @touchstart="onShortcutTouchStart" @touchmove.stop.prevent="onShortcutTouchMove">
            <ul>
                <li v-for="(item,index) in shortcutList"
                class="item"
                :key="item.id"
                :class="{'current': currentIndex === index}"
                :data-index="index"
                >
                    {{item}}
                </li>
            </ul>
        </div>
        <!-- 列表title -->
        <div class="list-fixed" v-show="fixedTitle" ref="fixed">
            <h1 class="fixed-title">{{fixedTitle}}</h1>
        </div>
        <div v-show="!data.length" class="loading-container">
            <loading></loading>
        </div>
    </scroll>
</template>

<script type="text/ecmascript-6">
    import Scroll from '../scroll/scroll';
    import {getData} from '../../common/js/dom';
    import Loading from '../loading/loading';
    // 获取元素定义时的高度
    const ANCHOR_HRIGHT = 18;
    const TITLE_HEIGHT = 30;
    export default {
        props: {
            data: {
                type: Array,
                default: function () { return []; }
            }
        },
        created () {
            this.touch = {};
            // 将这个listenScroll传递给scroll组件
            this.listenScroll = true;
            this.listHeight = [];
            // 如果要监听实时滚动(scroll组件默认为1，如果为1，当手离开以后的滚动就无法检测)
            this.probeType = 3;
        },
        data () {
            return {
                scrollY: -1,
                currentIndex: 0,
                diff: -1
            };
        },
        components: {
            Scroll,
            Loading
        },
        methods: {
            selectItem (item) {
                this.$emit('select', item);
            },
            onShortcutTouchStart (e) {
                // 获取当前被点击元素的索引
                let anchorIndex = getData(e.target, 'index');
                // 获取第一个触碰的手指的信息
                let firstTouch = e.touches[0];
                this.touch.y1 = firstTouch.pageY;
                // 记录第一次点击的dom索引
                this.touch.anchorIndex = anchorIndex;
                this._scrollTo(anchorIndex);
            },
            onShortcutTouchMove (e) {
                let firstTouch = e.touches[0];
                this.touch.y2 = firstTouch.pageY;
                // 获取手指滑动时y轴上面的偏移,然后除以每个元素的高度，那么得到经过的dom数；
                // |0相当于Math.floor(),向下取整；
                let delta = (this.touch.y2 - this.touch.y1) / ANCHOR_HRIGHT | 0;
                // 获取到手指滑动到的地方的索引
                let anchorIndex = parseInt(this.touch.anchorIndex) + delta;
                this._scrollTo(anchorIndex);
            },
            refresh () {
                this.$refs.listview.refresh();
            },
            scroll (pos) {
                // 获取滚动的y方向的距离
                this.scrollY = pos.y;
            },
            _scrollTo (index) {
                // 处理导航栏上下多余地方的点击
                if (!index && (index !== 0)) {
                    return;
                }
                // 处理滑动的时候超出边界的情况
                if (index < 0) {
                    index = 0;
                } else if (index > this.listHeight.length - 2) {
                    index = this.listHeight.length - 2;
                }
                this.scrollY = -this.listHeight[index];
                // 第一个参数是dom，第二个参数是动画时间
                this.$refs.listview.scrollToElement(this.$refs.listGroup[index], 0);
            },
            // 计算每个group的高度
            _calculateHeight () {
                this.listHeight = [];
                const list = this.$refs.listGroup;
                let height = 0;
                this.listHeight.push(height);
                for (let i = 0; i < list.length; i++) {
                    let item = list[i];
                    height += item.clientHeight;
                    this.listHeight.push(height);
                }
            }
        },
        watch: {
            // 当数据发生变化时，就计算group的高度
            data () {
                setTimeout(() => {
                    this._calculateHeight();
                }, 20);
            },
            scrollY (newY) {
                const listHeight = this.listHeight;
                // 当滚动到顶部，newY>0
                if (newY > 0) {
                    this.currentIndex = 0;
                    return;
                }
                // 在中间部分滚动
                for (let i = 0; i < listHeight.length - 1; i++) {
                    let height1 = listHeight[i];
                    let height2 = listHeight[i + 1];
                    if (!height2 || (-newY >= height1 && -newY < height2)) {
                        this.currentIndex = i;
                        // 列表title的偏移值
                        this.diff = height2 + newY;
                        // console.log(this.diff);
                        return;
                    }
                }
                // 当滚动到底部，且-newY大于最后一个元素的上限
                this.currentIndex = listHeight.length - 2;
                this.currentIndex = 0;
            },
            diff (newVal) {
                // console.log(111);
                let fixedTop = (newVal > 0 && newVal < TITLE_HEIGHT) ? newVal - TITLE_HEIGHT : 0;
                if (this.fixedTop === fixedTop) {
                    return;
                }
                this.fixedTop = fixedTop;
                this.$refs.fixed.style.transform = `translate3d(0, ${fixedTop}px, 0)`;
            }
            // diff(newVal) {
            //     let fixedTop = (newVal > 0 && newVal < TITLE_HEIGHT) ? newVal - TITLE_HEIGHT : 0
            //     if (this.fixedTop === fixedTop) {
            //         return;
            //     }
            //     this.fixedTop = fixedTop;
            //     this.$refs.fixed.style.transform = `translate3d(0,${fixedTop}px,0)`;
            // }
        },
        computed: {
            // title的集合数组
            shortcutList () {
                return this.data.map((group) => {
                    return group.title.substr(0, 1);
                });
            },
            fixedTitle () {
                if (this.scrollY > 0) {
                    return '';
                }
                return this.data[this.currentIndex] ? this.data[this.currentIndex].title : '';
            }
        }
    };
</script>

<style lang="less" rel="stylesheet/less">
    @import "../../common/less/variable";
    .listview {
        position: relative;
        width: 100%;
        height: 100%;
        overflow: hidden;
        background: @color-background;
        .list-group {
            padding-bottom: 30px;
            .list-group-title {
                height: 30px;
                line-height: 30px;
                padding-left: 20px;
                font-size: @font-size-small;
                color: @color-text-l;
                background: @color-highlight-background;
            }
            .list-group-item {
                display: flex;
                align-items: center;
                padding: 20px 0 0 30px;
                .avatar {
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                }
                .name {
                    margin-left: 20px;
                    color: @color-text-l;
                    font-size: @font-size-medium;
                }
            }
        }
        .list-shortcut {
            position: absolute;
            z-index: 30;
            right: 0;
            top: 50%;
            transform: translateY(-50%);
            width: 20px;
            padding: 20px 0;
            border-radius: 10px;
            text-align: center;
            background: @color-background-d;
            font-family: Helvetica;
            .item {
                padding: 3px;
                line-height: 1;
                color: @color-text-l;
                font-size: @font-size-small;
                &.current {
                    color: @color-theme;
                }
            }
        }
        .list-fixed {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            .fixed-title {
                height: 30px;
                line-height: 30px;
                padding-left: 20px;
                font-size: @font-size-small;
                color: @color-text-l;
                background: @color-highlight-background;
            }
        }
        .loading-container {
            position: absolute;
            width: 100%;
            top: 50%;
            transform: translateY(-50%);
        }
    }
</style>
