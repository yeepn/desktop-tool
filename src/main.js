import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import "./styles/index.scss";
import "./assets/iconfont/iconfont.css";
Vue.config.productionTip = false;

// 滚动动画 wow.js
import {WOW} from 'wowjs'

// 动画 animate.css
import 'animate.css'
require('animate.css/animate.min.css');
 
Vue.prototype.$wow = new WOW({
  boxClass: 'wow', // default
  animateClass: 'animated', // default
  offset: 150, // default
  mobile: false, // default
  live: false,
 
  // live为true时，控制台会提示：MutationObserver is not supported by your browser. & WOW.js cannot detect dom mutations, please call .sync() after loading new content.
 
  callback: function(box) {
    console.log("WOW: animating <" + box.tagName.toLowerCase() + ">")
  }
})


new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount("#app");


