<template>
  <scroll ref="suggest" class="suggest" :data="result" :pullup="pullup"
  @scrollToEnd="searchMore"
  :beforeScroll="beforeScroll"
  @beforeScroll="listScroll">
    <ul class="suggest-list">
      <li @click="selectItem(item)" class="suggest-item" v-for="item in result" :key="item.id">
        <div class="icon">
          <i :class="getIconCls(item)"></i>
        </div>
        <div class="name">
          <p class="text" v-html="getDisplayName(item)"></p>
        </div>
      </li>
      <loading v-show="hasMore" title=""></loading>
    </ul>
    <div v-show="!hasMore && !result.length" class="no-result-wrapper">
      <no-result title="抱歉，暂无搜索结果"></no-result>
    </div>
  </scroll>
</template>

<script type="text/ecmascript-6">
  import Scroll from '../../base/scroll/scroll';
  import Loading from '../../base/loading/loading';
  import NoResult from '../../base/no-result/no-result';
  import {search} from '../../api/search';
  import {ERR_OK} from '../../api/config';
  import {createSong} from 'common/js/song';
  import {mapMutations, mapActions} from 'vuex';
  import Singer from 'common/js/singer';

  const TYPE_SINGER = 'singer';
  const perpage = 20;

  export default {
    props: {
      query: {
        type: String,
        default: ''
      },
      showSinger: {
        type: Boolean,
        default: true
      }
    },
    data () {
      // 当前页数
      return {
        page: 1,
        result: [],
        pullup: true,
        hasMore: true,
        beforeScroll: true
      };
    },
    components: {
      Scroll,
      Loading,
      NoResult
    },
    methods: {
      search () {
        // 每次数据发生变化以后，就让页面重新从第1页开始
        // 同时让它滚动到最顶部的位置
        this.page = 1;
        this.$refs.suggest.scrollTo(0, 0);
        this.hasMore = true;
        // search (query, page, zhida)
        // 申请数据
        search(this.query, this.page, this.showSinger, perpage).then((res) => {
          if (res.code === ERR_OK) {
            // 由于要要取的内容在两个对象里面，所以将它们放到一个对象里面
            // result=[data.zhida里面的属性和添加的属性组成的对象，...song.list里面的歌曲]
            this.result = this._genResult(res.data);
            this._checkMore(res.data);
          }
        });
      },
      getIconCls (item) {
      // 如果有
        if (item.type === TYPE_SINGER) {
          return 'icon-mine';
        } else {
          return 'icon-music';
        }
      },
      searchMore () {
        console.log('我接收到请求了');
        if (!this.hasMore) {
          return;
        }
        this.page++;
        search(this.query, this.page, this.showSinger, perpage).then((res) => {
            if (res.code === ERR_OK) {
            this.result = this.result.concat(this._genResult(res.data));
            this._checkMore(res.data);
          }
        });
      },
      getDisplayName (item) {
        if (item.type === TYPE_SINGER) {
          return item.singername;
        } else {
          return `${item.name}-${item.singer}`;
        }
      },
      selectItem (item) {
        // 如果点击的是歌手，那么将当前歌手的信息上传到vuex
        // 然后跳转到子路由
        if (item.type === TYPE_SINGER) {
          const singer = new Singer({
            id: item.singermid,
            name: item.singername
          });
          this.$router.push({
            path: `/search/${singer.id}`
          });
          this.setSinger(singer);
        } else {
          // 否则点击的是歌曲
          this.insertSong(item);
        }
        this.$emit('select');
      },
      refresh () {
        this.$refs.suggest.refresh();
      },
      listScroll () {
        this.$emit('listScroll');
      },
      _checkMore (data) {
        const song = data.song;
        // 当没有更多的数据时
        if (!song.list.length || (song.curnum + song.curpage * perpage) >= song.totalnum) {
          this.hasMore = false;
        }
      },
      // 将要用到的数据放在一起
      _genResult (data) {
        let ret = [];
        // 如果输入的是歌手
        if (data.zhida && data.zhida.singerid) {
          // 使用展开运算符，将需要的内容组合成一个对象
          // 如果是歌手，那么给它添加一个新的属性type:TYPE_SINGER
          ret.push({...data.zhida, ...{type: TYPE_SINGER}});
        }
        if (data.song) {
          // ret=[data.zhida里面的属性和添加的属性组成的对象，...song.list里面的歌曲]
          ret = ret.concat(this._normalizeSongs(data.song.list));
        }
        return ret;
      },
      _normalizeSongs (list) {
        let ret = [];
        list.forEach((musicData) => {
          if (musicData.songid && musicData.albumid) {
            ret.push(createSong(musicData));
          }
        });
        return ret;
      },
      ...mapMutations({
        // 进行映射
        setSinger: 'SET_SINGER'
      }),
      ...mapActions([
        'insertSong'
      ])
    },
    watch: {
      // 当query发生变化以后，执行search()指令
      query () {
        this.search();
      }
    }
  };
</script>

<style lang="less" rel="stylesheet/less">
  @import "../../common/less/variable";
  @import "../../common/less/mixin";

  .suggest {
    height: 100%;
    overflow: hidden;
    .suggest-list {
      padding: 0 30px;
      .suggest-item {
        display: flex;
        align-items: center;
        padding-bottom: 20px;
      }
      .icon {
        flex: 0 0 30px;
        width: 30px;
        [class^="icon-"] {
          font-size: 14px;
          color: @color-text-d;
        }
      }
      .name {
        flex: 1;
        font-size: @font-size-medium;
        color: @color-text-d;
        overflow: hidden;
        .text {
          .no-wrap();
        }
      }
    }
    .no-result-wrapper {
      position: absolute;
      width: 100%;
      top: 50%;
      transform: translateY(-50%);
    }
  }
</style>
