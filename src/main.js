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

Vue.prototype.$wow=WOW;
// Vue.prototype.$wow = new WOW({
//   boxClass: 'wow', // default
//   animateClass: 'animated', // default
//   offset: 150, // default
//   mobile: false, // default
//   live: false,
//
//   // live为true时，控制台会提示：MutationObserver is not supported by your browser. & WOW.js cannot detect dom mutations, please call .sync() after loading new content.
//
//   callback: function(box) {
//     console.log("WOW: animating <" + box.tagName.toLowerCase() + ">")
//   }
// })


new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount("#app");


