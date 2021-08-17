<template>
  <div class="root">
    <div class="list" v-for="(value, key) in doneGroupList" :key="key">
      <div class="group">{{ getDateStr(key) }}</div>
      <div
        class="item"
        v-for="(done, index) in value"
        :key="done.id"
        @click.stop="editId === done.id ? (editId = '') : (editId = done.id)"
        :style="{backgroundColor: hexToRGBA(colorBook[index%colorBook.length],0.8)}"
      >
        <p>{{ index + 1 }}.{{ done.content }}</p>
        <i
          v-if="editId === done.id"
          class="iconfont icon-back"
          @click.stop="restore(done)"
        ></i>
        <i
          v-if="editId === done.id"
          class="iconfont icon-close"
          @click.stop="remove(done)"
        ></i>
      </div>
    </div>
  </div>
</template>
<script>
import { ipcRenderer } from "electron";
import DB from "@/utils/db";
import { getDateStr } from "@/utils/common";

export default {
  name: "Done",
  data() {
    return {
      doneGroupList: null,
      editId: "",
      colorBook:['#3273F1','#E63025','#FDAF03','#269945','#5E35B1','#FF9800','#D81B60','#9C27B0']
    };
  },
  methods: {
    getDateStr,
    getDoneList() {
      const list = DB.groupby("doneList", "done_date");
      this.doneGroupList = list;
    },
    restore(done) {
      DB.insert("todoList", {
        todo_date: done.todo_date,
        todo_datetime: done.todo_datetime,
        content: done.content,
      });

      DB.removeById("doneList", done.id);

      this.getDoneList();
    },
    remove(done) {
      DB.removeById("doneList", done.id);

      this.getDoneList();
    },
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
  created() {
    ipcRenderer.invoke("getDataPath").then((storePath) => {
      DB.initDB(storePath);

      this.getDoneList();
    });
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
    .group {
      position: sticky;
      top: 0;
      z-index: -999;
      height: 224px;
      line-height: 180px;
      box-sizing: border-box;
      color: rgba($color: #cccccc, $alpha: 0.8);
      font-size: 35px;
      text-align: center;
      user-select: none;
    }
    .item {
      display: flex;
      height: 28px;
       border-radius: 24px;
      padding: 5px 20px;
      margin: 2.5px 0;
      height: 28px;
      p {
        width: 100%;
        height: 100%;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
        line-height: 28px;
        cursor: pointer;
      }
      i {
        line-height: 28px;
        padding: 0 5px;
        cursor: pointer;
      }
    }
    .item:hover {
      p {
        color: rgba($color: #ffffff, $alpha: 0.6);
      }
    }
  }
}
</style>
