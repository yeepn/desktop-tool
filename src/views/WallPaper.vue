<template>
  <div :key="key">
    <div
      id="scorll"
      style="
        max-width: 100%;
        max-height: 500px;
        display: block;
        padding-top: 40px;
        padding-left: 10px;
        overflow-y: auto;
      "
    >
      <section>
        <vue-masonry-wall :items="items" :options="option" @append="append">
          <template v-slot:default="{ item }">
            <div
              class="photo center"
              :class="[
                animateBook[Math.floor(Math.random() * animateBook.length)],
                { wow: item.isNew },
              ]"
            >
              <img :src="item.url" :id="item.id" />
              <ul id="photo1" title="下载壁纸">
                <li>
                  <a
                    :href="
                      'http://image.baidu.com/search/down?tn=download&word=download&ie=utf8&fr=detail&url=' +
                      item
                    "
                    title="下载原始尺寸图片"
                    >下载壁纸</a
                  >
                </li>
                <li>
                  <a
                    href="javascript:void(0);"
                    @click="Apply(item)"
                    title="设为壁纸"
                    >设为壁纸</a
                  >
                </li>
              </ul>
            </div>
          </template>
        </vue-masonry-wall>
      </section>
    </div>
  </div>
</template>

<script>
import VueMasonryWall from "vue-masonry-wall";
import axios from "axios";
import "font-awesome/css/font-awesome.min.css";
import { ipcRenderer } from "electron";
//download api
//const downloadapi = "http://image.baidu.com/search/down?tn=download&word=download&ie=utf8&fr=detail&url=";
//wallpaper api
const tgturl =
  "http://wallpaper.apc.360.cn/index.php?c=WallPaper&a=getAppsByOrder&order=create_time&from=360chrome";

export default {
  name: "WallPaper",
  components: { VueMasonryWall },
  data() {
    var nowDate=new Date()
    return {
      //每一个时刻此参数唯一，用于强制刷新组件
      key: "",
      categories: [],
      items: [],
      animateBook: [
        "bounceInLeft",
        "bounceInRight",
        "bounceInUp",
        "fadeInLeft",
        "fadeInRight",
        "fadeInUp",
        "fadeIn",
      ],
      lastAnimatePlayTime:nowDate,
      //壁纸url来源于360官方免费提供，如有侵权，立即删除
      url: "http://wallpaper.apc.360.cn/index.php?c=WallPaper&a=getAppsByCategory&from=360chrome",
      //vue-masonry-wall组件的设置参数
      option: {
        width: 300,
        padding: {
          2: 1,
          default: 20,
        },
      },
    };
  },
  methods: {
    //ipc通知主进程调用修改壁纸函数
    Apply(url) {
      ipcRenderer.invoke("setWallPaperViaUrl", url);
    },
    append() {
      //组件vue-masonry-wall的方法，该组件会自动调用此方法形成瀑布流
      //由cid参数决定壁纸的分类
      let u = this.url + "&cid=" + this.$route.query.cid;
      //cid=0的情况，就说明第一次进入界面或者通过最新壁纸按钮进入，这个情况下加载最新的壁纸
      if (this.$route.query.cid == 0) u = tgturl;
      u = u + "&start=" + this.items.length + "&count=40";
      //进入axis回调函数前保留this指针
      let _this = this;
      axios
        .get(u)
        .then(function (data) {
          let urls = data.data.data;
          //获取图片url，并形成不同分辨率的壁纸下载链接
          for (let i = 0; i < urls.length; i++) {
            var t = {
              url: urls[i].url,
              isNew: true,
            };
            _this.items.push(t);
          }
          _this.$forceUpdate();
        })
        .catch(function (err) {
          console.log(err);
          alert("接口异常");
        });
    },
    Scroll() {
      
    },
  },
  watch: {
    //监控路由的变化，router的改变说明用户切换了分类
    $route: function () {
      this.key = new Date().getTime();
      this.url =
        "http://wallpaper.apc.360.cn/index.php?c=WallPaper&a=getAppsByCategory&from=360chrome&cid=" +
        this.$route.query.cid;
      //清空items，刷新壁纸库
      this.items = [];
    },
  },
  updated() {
    this.$nextTick(() => {
      console.log(new Date()-this.lastAnimatePlayTime)
      if((new Date()-this.lastAnimatePlayTime>2000)||this.$wow==null){
        new this.$wow({
          boxClass: "wow", // default
          animateClass: "animated", // default
          offset: 150, // default
          mobile: false, // default
          live: false,
          scrollContainer: "#scorll", // 可选的滚动容器选择器，否则使用 window,
          resetAnimation: false, // 在结束时重置动画（默认为 true）
        }).init();
        this.lastAnimatePlayTime=new Date()
      }
    });
  },
};
</script>

<style scoped>
* {
  padding: 0;
  margin: 0;
  font-family: Microsoft Yahei, "微软雅黑", "Helvetica Neue", Helvetica,
    Hiragino Sans GB, WenQuanYi Micro Hei, sans-serif;
}

li {
  list-style-type: none;
  margin-right: 20px;
}
img {
  width: auto;
  height: auto;
  max-width: 45vw;
  border-radius: 12px;
}

::-webkit-scrollbar-track-piece {
  background-color: transparent;
}
::-webkit-scrollbar {
  display: none;
}
::-webkit-scrollbar-thumb {
  background-color: rgb(192, 199, 210);
  -webkit-border-radius: 7px;
}
::-webkit-scrollbar-thumb:hover {
  background-color: #9f9f9f;
}
::-webkit-scrollbar-arrow {
  color: #f00;
  backgound: #0f0;
}
li {
  list-style: none;
}

a {
  text-decoration: none;
  font-size: 50%;
}

.photo {
  margin: 0 0;
  padding: 0 0;
  max-width: 45vw;
  position: relative;
}
.photo .img1 {
  width: 100%;
  height: 100%;
}
.photo img {
  width: 100%;
  height: 100%;
}
.photo ul {
  display: none;
  position: absolute;
  left: 0%;
  top: 0%;
  height: 100%;
  width: 100%;
  max-width: 45vw;
  background-color: rgba(0, 0, 0, 0.5);
  text-align: center;
  border-radius: 12px;
}
.photo ul li {
  font-size: 2rem;
  font-weight: 600;
}
.photo ul li a {
  color: #fff;
}
.photo:hover #photo1 {
  display: block;
}
</style>