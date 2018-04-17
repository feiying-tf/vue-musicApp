import Vue from 'vue';
import Vuex from 'vuex';
import * as actions from './actions';
import * as getters from './getters';
import state from './state';
import mutations from './mutations';
// 将修改的内容打印到控制台
import createLogger from 'vuex/dist/logger';

Vue.use(Vuex);
// 这是一个调试的功能
const debug = process.env.NODE_ENV !== 'production';
export default new Vuex.Store({
    actions,
    getters,
    state,
    mutations,
    // 当debug为true的时候，开启严格模式
    strict: debug,
    plugins: debug ? [createLogger()] : []
});
