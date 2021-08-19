import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import "./styles/index.scss";
import "./assets/iconfont/iconfont.css";
import {WOW} from 'wowjs'
import '../node_modules/wowjs/css/libs/animate.css'
Vue.config.productionTip = false;
// 动画 animate.css
Vue.prototype.$wow = WOW;

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount("#app");


