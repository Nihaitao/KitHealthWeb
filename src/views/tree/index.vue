<template>
  <div class="app-container">
    <div class="filter-container" style="margin-bottom:20px">
      <div class="filter-item el-input el-input--medium" style="width: 200px;">
        <input v-model="listQuery.title" clearable type="text" autocomplete="off" placeholder="Title" class="el-input__inner">
      </div>
      <button type="button" class="el-button filter-item el-button--primary el-button--medium" @click="fetchData"><i class="el-icon-search"/><span>Search</span></button>
      <button type="button" class="el-button filter-item el-button--primary el-button--medium" style="float:right" @click="addScene()"><i class="el-icon-plus"/></button>
    </div>
    <el-table
      v-loading="listLoading"
      :data="list"
      element-loading-text="Loading"
      border
      fit
      highlight-current-row>
      <el-table-column align="center" label="ID" width="60">
        <template slot-scope="scope">
          {{ scope.$index + 1 }}
        </template>
      </el-table-column>
      <el-table-column :show-overflow-tooltip="true" label="标题">
        <template slot-scope="scope">
          {{ scope.row.name }}
        </template>
      </el-table-column>
      <el-table-column :show-overflow-tooltip="true" label="描述">
        <template slot-scope="scope">
          {{ scope.row.description }}
        </template>
      </el-table-column>
      <el-table-column label="视频" align="center">
        <template v-if="scope.row.url" slot-scope="scope">
          <el-button size="small" @click="playVideo(scope.row.url)"><i class="el-icon-caret-right"/></el-button>
        </template>
      </el-table-column>
      <el-table-column :show-overflow-tooltip="true" label="更新时间">
        <template slot-scope="scope">
          {{ scope.row.time | dateFtt }}
        </template>
      </el-table-column>
      <el-table-column fixed="right" label="操作" width="100">
        <template slot-scope="scope">
          <el-button type="text" @click="addScene(scope.row)"><i class="el-icon-edit"/></el-button>
          <el-button type="text" @click="reomve(scope.row)"><i class="el-icon-delete"/></el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      :total="total"
      :page-size.sync="listQuery.pageSize"
      :current-page.sync="listQuery.pageIndex"
      :page-sizes="[10, 20, 50, 100]"
      background
      style="margin-top:20px"
      layout="total, sizes, prev, pager, next, jumper"
      @prev-click="fetchData"
      @next-click="fetchData"
      @current-change="fetchData"
      @size-change="fetchData"/>
    <el-dialog :visible.sync="dialogFormVisible" :title="title">
      <el-form ref="myForm" :model="form" :rules="rules">
        <el-form-item label-width="120px" label="标题" prop="name">
          <el-input v-model="form.name" clearable auto-complete="off"/>
        </el-form-item>
        <el-form-item label-width="120px" label="描述">
          <el-input
            :autosize="{ minRows: 2, maxRows:4}"
            v-model="form.description"
            clearable
            type="textarea"/>
        </el-form-item>
        <el-form-item ref="myVideo" label-width="120px" label="视频" prop="url">
          <el-button v-show="form.url" size="small" @click="playVideo(form.url)"><i class="el-icon-caret-right"/></el-button>
          <el-upload
            :on-success="uploadVideoSuccess"
            :on-error="uploadVideoFail"
            :on-remove="removeVideo"
            :before-upload="beforeUploadVideo"
            :file-list="videoList"
            :action="uploadAction"
            class="upload-demo"
            list-type="text">
            <el-button v-show="!form.url" size="small"><i class="el-icon-upload2"/></el-button>
          </el-upload>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="submit">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<style>

</style>
<script>
import { getList, add, remove } from '@/api/video'

export default {
  filters: {
    dateFtt: function(value) { // author: meizz
      var fmt = 'yyyy-MM-dd hh:mm:ss'
      var date = new Date(value)
      var o = {
        'M+': date.getMonth() + 1, // 月份
        'd+': date.getDate(), // 日
        'h+': date.getHours(), // 小时
        'm+': date.getMinutes(), // 分
        's+': date.getSeconds(), // 秒
        'q+': Math.floor((date.getMonth() + 3) / 3), // 季度
        'S': date.getMilliseconds() // 毫秒
      }
      if (/(y+)/.test(fmt)) { fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length)) }
      for (var k in o) {
        if (new RegExp('(' + k + ')').test(fmt)) { fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length))) }
      }
      return fmt
    }
  },
  data() {
    return {
      listQuery: { pageSize: 10, pageIndex: 1 },
      list: null,
      total: 0,
      listLoading: true,
      dialogFormVisible: false,
      title: '添加视频',
      videoList: [],
      form: {
        id: 0,
        name: '',
        description: '',
        url: ''
      },
      rules: {
        name: [
          { required: true, message: '请输入视频标题', trigger: 'blur' }
        ],
        url: [
          { required: true, message: '请上传视频' }
        ]
      }
    }
  },
  computed: {
    uploadAction: function() {
      return process.env.BASE_API + '/upload'
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    // 查询列表
    fetchData() {
      this.listLoading = true
      getList(this.listQuery).then(response => {
        this.list = response.data
        this.total = response.total
        this.listLoading = false
      })
    },
    // 删除
    reomve(row) {
      this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        remove({ id: row.id }).then(response => {
          if (response.msg === 'success') {
            this.fetchData()
            this.$message({ message: '操作成功', type: 'success' })
          } else {
            this.$message.error('操作失败')
          }
        })
      }).catch()
    },
    // 添加、编辑
    addScene(row) {
      if (row) {
        this.title = '编辑视频'
        this.form = JSON.parse(JSON.stringify(row))
      } else {
        this.title = '添加视频'
        this.form = {
          id: 0,
          name: '',
          description: '',
          url: ''
        }
        this.videoList = []
      }
      this.dialogFormVisible = true
    },
    // 确定
    submit() {
      this.$refs['myForm'].validate((valid) => {
        if (valid) {
          add(this.form).then(response => {
            if (response.msg === 'success') {
              this.dialogFormVisible = false
              this.fetchData()
              this.$message({ message: '操作成功', type: 'success' })
            } else {
              this.$message.error('操作失败')
            }
          })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    // 上传视频前
    beforeUploadVideo(file) {
      const accept = file.type.indexOf('video') >= 0
      if (!accept) {
        this.$message.error('格式错误')
      }
      return accept
    },
    // 上传视频成功
    uploadVideoSuccess(response, file, fileList) {
      this.form.url = response.data
      this.$refs['myVideo'].clearValidate()
    },
    // 上传视频失败
    uploadVideoFail(err, file, fileList) {
      this.$message.error(err)
    },
    // 删除视频
    removeVideo(file, fileList) {
      this.form.url = ''
    },
    // 播放视频
    playVideo(url) {
      window.open(process.env.BASE_API + '/' + url)
    },
    serviceSrc(url) {
      return process.env.BASE_API + '/' + url
    }
  }
}
</script>
