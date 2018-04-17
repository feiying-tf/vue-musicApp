<template>
  <div ref="wrapper">
    <slot></slot>
  </div>
</template>

<script>
    import BScroll from 'better-scroll';
    export default {
        props: {
            // 1滚动的时候会派发scroll事件，会截流;
            // 2滚动的时候实时派发scroll事件，不会截流;
            // 3除了实时派发scroll事件，在手离开以后的情况下如果画面还在滚动仍然能实时派发scroll事件;
            probeType: {
                type: Number,
                default: 1
            },
            click: {
                type: Boolean,
                default: true
            },
            data: {
                type: Array,
                default: null
            },
            listenScroll: {
                type: Boolean,
                default: false
            },
            pullup: {
                type: Boolean,
                default: false
            },
            beforeScroll: {
                type: Boolean,
                default: false
            },
            refreshDelay: {
                type: Number,
                default: 20
            }
        },
        mounted () {
            setTimeout(() => {
                this._initScroll();
            }, 20);
        },
        methods: {
            _initScroll () {
                if (!this.$refs.wrapper) {
                    return;
                }
                this.scroll = new BScroll(this.$refs.wrapper, {
                    probeType: this.probeType,
                    click: this.click,
                    scrollY: true
                });
                if (this.listenScroll) {
                    let me = this;
                    // pos是当前位置
                    this.scroll.on('scroll', (pos) => {
                        // 派发一个事件，传递pos值
                        me.$emit('scroll', pos);
                    });
                }
                if (this.pullup) {
                    this.scroll.on('scrollEnd', () => {
                        if (this.scroll.y <= this.scroll.maxScrollY + 50) {
                            this.$emit('scrollToEnd');
                        }
                    });
                }
                if (this.beforeScroll) {
                    this.scroll.on('beforeScrollStart', () => {
                        this.$emit('beforeScroll');
                    });
                }
            },
            enable () {
                // 启用better-scroll
                this.scroll && this.scroll.enable();
            },
            disable () {
                this.scroll && this.scroll.disable();
            },
            refresh () {
                this.scroll && this.scroll.refresh();
            },
            scrollTo () {
                this.scroll && this.scroll.scrollTo.apply(this.scroll, arguments);
            },
            // 移动到指定dom
            scrollToElement () {
                this.scroll && this.scroll.scrollToElement.apply(this.scroll, arguments);
            }
        },
        watch: {
            data () {
                setTimeout(() => {
                    this.refresh();
                }, this.refreshDelay);
            }
        }
    };
</script>
<style lang="less" rel="stylesheet/less">

</style>
