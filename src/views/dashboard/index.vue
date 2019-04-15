<template>
  <div class="dashboard-container">
    <div class="dashboard-text" style="text-align:center">
      <img :src="getSrc" @click="gotoHome">
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'Dashboard',
  data() {
    return {
    }
  },
  computed: {
    ...mapGetters([
      'name',
      'roles'
    ]),
    getSrc: function() {
      const hour = new Date().getHours()
      return hour > 7 && hour < 18 ? 'http://119.29.86.18:7002/uploads/2019-4-11/yixiu2.jpg' : 'http://119.29.86.18:7002/uploads/2019-4-11/yixiu1.jpg'
    }
  },
  methods: {
    gotoHome: function() {
      window.open('https://www.20180905.cn')
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.dashboard {
  &-container {
    margin: 30px;
  }
  &-text {
    font-size: 30px;
    line-height: 46px;
  }
}
</style>
