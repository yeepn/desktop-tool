<template>
  <div class="root" @click="add">
    <draggable
        class="list"
        v-model="schedulelist"
        v-bind="dragOptions"
        @start="drag = true"
        @end="drag = false"
        :disabled="editIndex !== -1"
    >
      <transition-group type="transition" :name="!drag ? 'flip-list' : null">
        <div
            class="item"
            v-for="(shedule, index) in schedulelist"
            :key="'shedule' + index"
            @dblclick.stop="done($event, index)"
            @click.stop="editing(index)"
            :style="{backgroundColor: hexToRGBA(colorBook[index%colorBook.length],0.8)}"
        >
          <p v-if="index !== editIndex" class="text-wrapper"><span>{{ index + 1 }}.</span><span>{{shedule.time}}</span>{{' '+shedule.content }}</p>
          <div class="edit" v-else>


<!--            <input-->
<!--                v-model="shedule.time"-->
<!--                @keyup.27="cancel(index)"-->
<!--                @keyup.13="timeedited"-->
<!--                spellcheck="false"-->
<!--            />-->


            <input
            type="time"
                ref="time"
                v-model="shedule.time"
                @click.stop="return false;"
                @keyup.27="cancel(index)"
                @keyup.13="edited"
                spellcheck="false"
            />
            <input
                class="flex-1"
                ref="content"
                v-model="shedule.content"
                @click.stop="return false;"
                @keyup.27="cancel(index)"
                @keyup.13="edited"
                spellcheck="false"
                placeholder="点击图标选择时间,点击这里输入内容"
            />
            <i class="iconfont icon-select" @click.stop="edited"></i>
            <i class="iconfont icon-close" @click.stop="clear(index)"></i>
          </div>

        </div>
      </transition-group>
    </draggable>
  </div>
</template>
<script>
import draggable from "vuedraggable";
import CursorSpecialEffects from "@/utils/fireworks";
import { ipcRenderer } from "electron";
import DB from "@/utils/db";
import moment from "moment";

export default {
  /* eslint-disable */
  name: "CrontrabTask",
  components: {
    draggable,
  },
  data() {
    return {
      schedulelist: null,
      drag: false,
      editIndex: -1,
      tempItem: null,
      dblclick: false,
      colorBook:['#3273F1','#E63025','#FDAF03','#269945','#5E35B1','#FF9800','#D81B60','#9C27B0']
    };
  },
  methods: {
    //时间校验函数
    checkTime(time){
      return moment(time,"HH:mm",true).isValid()
    },
    getSchedulelist() {
      const list = DB.get("schedulelist");
      this.schedulelist = list;
    },
    add() {
      if (this.editIndex !== -1) {
        this.edited();
        return;
      }

      this.schedulelist.push({
        type: "notification",
        content: "",
        time:""
      });
      const index = this.schedulelist.length - 1;
      this.tempItem = Object.assign({}, this.schedulelist[index]);
      this.editIndex = index;
    },
    editing(index) {
      setTimeout(() => {
        if (this.dblclick) {
          return;
        }

        if (this.editIndex !== -1) {
          this.edited();
        }
        console.log("editing")

        this.tempItem = Object.assign({}, this.schedulelist[index]);
        console.log(this.tempItem)
        console.log(this.schedulelist[index])

        //验证时间是否合法
        // if(!this.checkTime(this.schedulelist[index].time)){
        //   alert("时间不合法，重新输入")
        //   this.schedulelist[index].time=""
        //   this.index = -1;
        //   return
        // } 

        this.editIndex = index;
      }, 220);
    },
    edited() {
      //过滤content内容为空的
      this.schedulelist = this.schedulelist.filter((p) => {
        return p.content;
      });

      // //验证时间是否合法
      //   if(!this.checkTime(this.schedulelist[this.editIndex].time)){
      //     alert("时间不合法，重新输入")
      //     this.schedulelist[this.editIndex]=""
      // this.editIndex = -1;
      //     return
      //   } 

      this.editIndex = -1;

      DB.set("schedulelist", this.schedulelist);
    },
    cancel(index) {
      this.$set(this.schedulelist, index, this.tempItem);
      this.edited();
    },
    clear(index) {
      if (!this.schedulelist[index].content) {
        this.edited();
        return;
      }
      this.schedulelist[index].content = "";
    },
    done(event, index) {
      if (this.editIndex !== -1) {
        return;
      }

      this.dblclick = true;
      setTimeout(() => {
        this.dblclick = false;
      }, 500);

      CursorSpecialEffects.handleMouseDown(event);

      this.schedulelist.splice(index, 1);
      DB.set("schedulelist", this.schedulelist);
    },
    // timeedited(event){
    //   if (!this.checkTime(event.target.value)){
    //     alert("时间格式错误");
    //     this.schedulelist[this.editIndex].time="";
    //     return;
    //   }
    //   event.target.blur();
    //   console.log(this.$refs.content[this.editIndex]);
    //   this.$refs.content[this.editIndex].focus();
    // },
    hexToRGBA(_color, _opacity) {
      let sColor = _color.toLowerCase()
      // 十六进制颜色值的正则表达式
      const reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/
      // 如果是16进制颜色
      if (sColor && reg.test(sColor)) {
        if (sColor.length === 4) {
          let sColorNew = '#'
          for (let i = 1; i < 4; i += 1) {
            sColorNew += sColor.slice(i, i + 1).concat(sColor.slice(i, i + 1))
          }
          sColor = sColorNew
        }
        // 处理六位的颜色值
        const sColorChange = []
        for (let i = 1; i < 7; i += 2) {
          sColorChange.push(parseInt('0x' + sColor.slice(i, i + 2)))
        }
        return 'rgba(' + sColorChange.join(',') + ',' + _opacity + ')'
      }
      return sColor
    },

  },
  computed: {
    dragOptions() {
      return {
        animation: 200,
        group: "description",
        disabled: false,
        ghostClass: "ghost",
      };
    },
  },
  created() {
    ipcRenderer.invoke("getDataPath").then((storePath) => {
      DB.initDB(storePath);
      this.getSchedulelist();
    });
  },
  directives: {
    focus: {
      inserted: function(el) {
        el.focus();
      },
    },
  },
};
</script>

<style lang="scss" scoped>
.root {
  width: 100%;
  min-height: 100%;
  box-sizing: border-box;
  padding: 0 15px 28px 15px;
  .list {
    .item {
      border-radius: 24px;
      padding: 5px 20px;
      margin: 2.5px 0;
      background-color: #3273F1;
      height: 28px;
      p {
        width: 100%;
        height: 100%;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
        cursor: pointer;
        user-select: none;
        line-height: 28px;
        display: inline;
      }
      .edit {
        display: flex;
        width: 100%;
        height: 100%;
        justify-content: space-between;
        input {
          
          height: 100%;
          outline: none;
          border: none;
          background: transparent;
          font-size: 16px;
          line-height: 28px;
        }
        input::placeholder{
          color: azure;
        }
        i {
          line-height: 28px;
          padding: 0 5px;
          cursor: pointer;
        }
      }
    }
    .item:hover {
      p {
        color: rgba($color: #ffffff, $alpha: 0.6);
      }
    }
  }
}

.flip-list-move {
  transition: transform 0.5s;
}
.no-move {
  transition: transform 0s;
}
.ghost {
  opacity: 0.5;
}

.text-wrapper {
  white-space: pre-wrap;
}

.width-unset{
  width: unset!important;
}

.flex-1{
  flex: 1;
}

</style>



<!--<template>-->
<!--<div>-->
<!--  <ul>-->
<!--      <li v-for="(a, index) in crontabList" :key="index">{{ index }} {{ a }}</li>-->
<!--  </ul>-->

<!--</div>-->

<!--</template>-->
<!--<script>-->

<!--import { ipcRenderer } from "electron";-->
<!--import DB from "@/utils/db";-->
<!--import moment from "moment";-->

<!--export default {-->
<!--  /* eslint-disable */-->
<!--  name: "Todo",-->
<!--  data() {-->
<!--    return {-->
<!--      crontabList: null,-->
<!--    };-->
<!--  },-->
<!--  methods: {-->
<!--    //按照时间顺序获取任务的表-->
<!--    getcrontabList() {-->
<!--      this.crontabList = DB.get("crontabList");-->
<!--    },-->
<!--    add(time, content) {-->
<!--      //这里需要前端给出时间不合法的提示-->
<!--      if (!this.checkTime(time))return;-->
<!--      this.crontabList.push({-->
<!--        time: time,-->
<!--        type: "notification",-->
<!--        content: content,-->
<!--      });-->
<!--      DB.set("crontabList",this.crontabList);-->
<!--    },-->
<!--    //按照索引删除，英文vue是双向绑定，更新表也是直接将crontabList写到表中，-->
<!--    // 这个地方不用担心是否对应的问题，索引就是v-for遍历的索引-->
<!--    delete(index){-->
<!--      this.crontabList.splice(index,1);-->
<!--      DB.set("crontabList",this.crontabList);-->
<!--    },-->
<!--    //获取排序后的任务列表-->
<!--    sort(){-->
<!--      this.crontabList = DB.sortCronlistByTime();-->
<!--    },-->
<!--    update(index,content,time){-->
<!--      //这里需要前端给出时间不合法的提示-->
<!--      if (!this.checkTime(time))return;-->
<!--      this.crontabList[index].content = content;-->
<!--      this.crontabList[index].time = time;-->
<!--    },-->
<!--    //检查时间是否为HH:MM格式-->
<!--   checkTime(time){-->
<!--    return moment(time,"HH:mm",true).isValid()-->
<!--}-->
<!--  },-->
<!--    created() {-->
<!--      ipcRenderer.invoke("getDataPath").then((storePath) => {-->
<!--        DB.initDB(storePath);-->
<!--        this.getcrontabList();-->
<!--      });-->
<!--    },-->

<!--};-->
<!--</script>-->

<!--<style scoped>-->

<!--</style>-->