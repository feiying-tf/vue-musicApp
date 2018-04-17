<template>
  <div id="app">
    <m-header></m-header>
    <tab></tab>
    <!-- 在这儿渲染router -->
    <keep-alive><router-view></router-view></keep-alive>
    <player></player>
  </div>
</template>

<script>
import MHeader from './components/m-header/m-header.vue';
import Tab from './components/tab/tab.vue';
import Player from './components/player/player.vue';
export default {
  components: {
    MHeader,
    Tab,
    Player
  }
};
</script>

<style lang="less" rel="stylesheet/less">
  @import "common/less/variable.less";

</style>
