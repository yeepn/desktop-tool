<template>
  <div class="root" @click="add">
    <draggable
      class="list"
      v-model="todoList"
      v-bind="dragOptions"
      @start="drag = true"
      @end="drag = false"
      :disabled="editIndex !== -1"
    >
      <transition-group type="transition" :name="!drag ? 'flip-list' : null">
        <div
          class="item"
          v-for="(todo, index) in todoList"
          :key="'todo' + index"
          @dblclick.stop="done($event, index)"
          @click.stop="editing(index)"
          :style="{backgroundColor: hexToRGBA(colorBook[index%colorBook.length],0.8)}"
        >
          <p v-if="index !== editIndex" class="text-wrapper"><span>{{ index + 1 }}.</span><span>{{todo.todo_date}}</span>{{' '+todo.content }}</p>
          <div class="edit" v-else>
            <input
              v-model="todo.content"
              v-focus
              @click.stop="return false;"
              @keyup.27="cancel(index)"
              @keyup.13="edited"
              spellcheck="false"
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
import { getNowDate, getNowDateTime } from "@/utils/common";

export default {
  /* eslint-disable */
  name: "Todo",
  components: {
    draggable,
  },
  data() {
    return {
      todoList: null,
      drag: false,
      editIndex: -1,
      tempItem: null,
      dblclick: false,
      colorBook:['#3273F1','#E63025','#FDAF03','#269945','#5E35B1','#FF9800','#D81B60','#9C27B0']
    };
  },
  methods: {
    getTodoList() {
      const list = DB.get("todoList");
      this.todoList = list;
    },
    add() {
      if (this.editIndex !== -1) {
        this.edited();
        return;
      }

      this.todoList.push({
        todo_date: getNowDate(),
        todo_datetime: getNowDateTime(),
        content: "",
      });
      const index = this.todoList.length - 1;
      this.tempItem = Object.assign({}, this.todoList[index]);
      this.editIndex = index;
      //this.editing(index);
    },
    editing(index) {
      setTimeout(() => {
        if (this.dblclick) {
          return;
        }

        if (this.editIndex !== -1) {
          this.edited();
        }

        this.tempItem = Object.assign({}, this.todoList[index]);

        this.editIndex = index;
      }, 220);
    },
    edited() {
      this.todoList = this.todoList.filter((p) => {
        return p.content;
      });
      this.editIndex = -1;

      DB.set("todoList", this.todoList);
    },
    cancel(index) {
      this.$set(this.todoList, index, this.tempItem);
      this.edited();
    },
    clear(index) {
      if (!this.todoList[index].content) {
        this.edited();
        return;
      }

      this.todoList[index].content = "";
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

      DB.insert(
        "doneList",
        Object.assign(
          { done_date: getNowDate(), done_datetime: getNowDateTime() },
          this.todoList[index]
        )
      );
      this.todoList.splice(index, 1);
      DB.set("todoList", this.todoList);
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

      this.getTodoList();
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
          flex: 1;
          height: 100%;
          outline: none;
          border: none;
          background: transparent;
          font-size: 16px;
          line-height: 28px;
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

</style>
