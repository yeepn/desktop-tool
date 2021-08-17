<template>
  <div  :key="key">
  <div style="
    max-width: 100%;
    max-height: 500px;
    display: block;
    padding-top: 40px;
    padding-left: 10px;
    overflow-y: auto;
      ">
    <section>
      <vue-masonry-wall :items="items" :options="option"  @append="append">
        <template v-slot:default="{item}">
          <div class="photo wow lightSpeedIn center">
              <img :src="item.url" :id="item.id" >
            <ul  id="photo1" title="下载壁纸">
              <!-- <li><a :href="item.d2560_1600">2560x1600</a></li>
               <li><a :href="item.d1440_900">1440x900</a></li>
               <li><a :href="item.d1024_768" >1024x768</a></li>
              <li><a :href="item.d800_600">800x600</a></li> -->
              <li><a :href="item.raw" title="下载原始尺寸图片">下载壁纸</a></li>
              <li><a @click="Apply(item.raw)" title="设为壁纸">设为壁纸</a></li></ul>
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
import 'font-awesome/css/font-awesome.min.css' 
const downloadapi = "http://image.baidu.com/search/down?tn=download&word=download&ie=utf8&fr=detail&url=";
import { ipcRenderer } from "electron";
function decodeUrl(oldUrl,width,height,quality)
{
  return oldUrl.replace("r/__85", "m/" + parseInt(width) + "_" + parseInt(height) + "_" + quality);
};
export default {
  name: 'WallPaper',
  components: {VueMasonryWall},
  data() {
    return {
      //每一个时刻此参数唯一，用于强制刷新组件
      key: '',
      categories: [],
      items: [],
      //壁纸url来源于360官方免费提供，如有侵权，立即删除
      url: "http://wallpaper.apc.360.cn/index.php?c=WallPaper&a=getAppsByCategory&from=360chrome",
      //vue-masonry-wall组件的设置参数
      option: {
        width: 300,
        padding: {
          2: 1,
          default: 20
        },
      },
    }
  },
   mounted() {  
    this.$nextTick(() => {
      this.$wow.init();
    })
  },  
  methods: {
    //ipc通知主进程调用修改壁纸函数
    Apply(url){
      ipcRenderer.invoke("setWallPaperViaUrl",url);
    },
    append() {
      //组件vue-masonry-wall的方法，该组件会自动调用此方法形成瀑布流
      //由cid参数决定壁纸的分类
      let u = this.url + "&cid=" + this.$route.query.cid ;
      //cid=0的情况，就说明第一次进入界面或者通过最新壁纸按钮进入，这个情况下加载最新的壁纸
      if(this.$route.query.cid==0)
        u = "http://wallpaper.apc.360.cn/index.php?c=WallPaper&a=getAppsByOrder&order=create_time&from=360chrome"
      u = u + "&start=" + this.items.length + "&count=20" ;
      //进入axis回调函数前保留this指针
      let _this = this;
      axios.get(u).then(function (data) {
        let urls = data.data.data;
        //获取图片url，并形成不同分辨率的壁纸下载链接
        for (let i = 0; i < urls.length; i++) {
          urls[i].d2560_1600 = downloadapi + decodeUrl(urls[i].url,2560,1600,100);
          urls[i].d1440_900 = downloadapi + decodeUrl(urls[i].url,1440,900,100);
          urls[i].d1024_768 = downloadapi + decodeUrl(urls[i].url,1024,768,100);
          urls[i].d800_600 = downloadapi + decodeUrl(urls[i].url,800,600,100);
          urls[i].raw = downloadapi + decodeUrl(urls[i].url,0,0,100);
          _this.items.push(urls[i]);
        }
        _this.$forceUpdate();
      }).catch(function (err) {
        console.log(err)
        alert("接口异常");
      });
      console.log("append")
      console.log(this)
      console.log(this.$wow)
      this.$wow.init()

    },

    },
  watch:{
    //监控路由的变化，router的改变说明用户切换了分类
      $route:function () {
        this.key = new Date().getTime();
        this.url = "http://wallpaper.apc.360.cn/index.php?c=WallPaper&a=getAppsByCategory&from=360chrome&cid=" + this.$route.query.cid;
        //清空items，刷新壁纸库
        this.items = [];

    }
  },

}
</script>

<style scoped>
* {
  padding: 0;
  margin: 0;
  font-family: Microsoft Yahei, "微软雅黑", "Helvetica Neue", Helvetica, Hiragino Sans GB, WenQuanYi Micro Hei, sans-serif;
}

li {
  list-style-type: none;
  margin-right: 20px;
}
img{
  width: auto;
  height: auto;
  max-width: 45vw;
  border-radius: 12px;
}



::-webkit-scrollbar-track-piece {
  background-color:transparent;
}
::-webkit-scrollbar {
  width:9px;
  height:8px;
}
::-webkit-scrollbar-thumb {
  background-color:rgb(192, 199, 210);
  -webkit-border-radius:7px;
}
::-webkit-scrollbar-thumb:hover {
  background-color:#9f9f9f;
}
::-webkit-scrollbar-arrow {
  color:#F00;
  backgound:#0F0;
}
li
{
  list-style: none;
}

a{
  text-decoration: none;
  font-size: 50%;
}


.photo
{
  margin: 0 0;
  padding: 0 0;
  max-width: 45vw;
  position: relative;
}
.photo .img1
{
  width: 100%;
  height: 100%;
}
.photo img
{
  width: 100%;
  height: 100%;
}
.photo ul
{
  display: none;
  position: absolute;
  left: 0%;
  top: 0%;
  height: 100%;
  width: 100%;
  max-width: 45vw;
  background-color: rgba(0,0,0,0.5);
  text-align: center;
  border-radius: 12px;
}
.photo ul li
{
    font-size: 2rem;
    font-weight: 600;
}
.photo ul li a
{
  color: #fff;
}
.photo:hover #photo1
{
  display: block;
}
</style>