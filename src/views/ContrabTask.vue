<template>


</template>
<script>

import { ipcRenderer } from "electron";
import DB from "@/utils/db";
import dayjs from "dayjs";
import moment from "moment";

export default {
  /* eslint-disable */
  name: "Todo",
  data() {
    return {
      crontabList: null,
    };
  },
  methods: {
    //按照时间顺序获取任务的表
    getcrontabList() {
      this.crontabList = DB.get("crontabList");
    },
    add(time, content) {
      //这里需要前端给出时间不合法的提示
      if (!this.checkTime(time))return;
      this.crontabList.push({
        time: time,
        type: "notification",
        content: content,
      });
      DB.set("crontabList",this.crontabList);
    },
    //按照索引删除，英文vue是双向绑定，更新表也是直接将crontabList写到表中，
    // 这个地方不用担心是否对应的问题，索引就是v-for遍历的索引
    delete(index){
      this.crontabList.splice(index,1);
      DB.set("crontabList",this.crontabList);
    },
    //获取排序后的任务列表
    sort(){
      this.crontabList = DB.sortCronlistByTime();
    },
    update(index,content,time){
      //这里需要前端给出时间不合法的提示
      if (!this.checkTime(time))return;
      this.crontabList[index].content = content;
      this.crontabList[index].time = time;
    },
    //检查时间是否为HH:MM格式
   checkTime(time){
    return moment(time,"HH:mm",true).isValid()
}
  },
    created() {
      ipcRenderer.invoke("getDataPath").then((storePath) => {
        DB.initDB(storePath);
        this.getcrontabList();
      });
    },

};
</script>

<style scoped>

</style>