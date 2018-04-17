import 'babel-polyfill';
import Vue from 'vue';
import App from './App';
import router from './router';
import './common/less/index.less';
import fastclick from 'fastclick';
import VueLazyLoad from 'vue-lazyload';
import store from './store';

/* eslint-disable no-unused-vars */
import VConsole from 'vconsole';
// let vConsole = new VConsole();
// console.log('test');
// 这样整个页面的点击都不会有300ms的延时
fastclick.attach(document.body);
Vue.use(VueLazyLoad, {
  // 导入懒加载的图片
  loading: require('./common/image/default.png')
});
/* eslint-disable no-new */
new Vue({
  el: '#app',
  // 通过这儿传给App.vue
  router,
  store,
  data: {
    eventHub: new Vue()
  },
  render: h => h(App)
});
