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
      <el-table-column :show-overflow-tooltip="true" label="VIP" align="center" width="70">
        <template v-if="scope.row.vip === 1" slot-scope="scope"><span style="color:#de8807">VIP</span></template>
      </el-table-column>
      <el-table-column :show-overflow-tooltip="true" label="标题">
        <template slot-scope="scope">
          {{ scope.row.title_zh }}
        </template>
      </el-table-column>
      <el-table-column :show-overflow-tooltip="true" label="Title">
        <template slot-scope="scope">
          {{ scope.row.title_en }}
        </template>
      </el-table-column>
      <el-table-column :show-overflow-tooltip="true" label="タイトル">
        <template slot-scope="scope">
          {{ scope.row.title_ja }}
        </template>
      </el-table-column>
      <el-table-column :show-overflow-tooltip="true" label="描述">
        <template slot-scope="scope">
          {{ scope.row.description_zh }}
        </template>
      </el-table-column>
      <el-table-column :show-overflow-tooltip="true" label="Description">
        <template slot-scope="scope">
          {{ scope.row.description_en }}
        </template>
      </el-table-column>
      <el-table-column :show-overflow-tooltip="true" label="説明する">
        <template slot-scope="scope">
          {{ scope.row.description_ja }}
        </template>
      </el-table-column>
      <el-table-column label="封面图" width="80" align="center">
        <template v-if="scope.row.coverurl" slot-scope="scope" >
          <img :src="serviceSrc(scope.row.coverurl)" style="height:48px;width:48px;" >
        </template>
      </el-table-column>
      <el-table-column label="图片" width="80" align="center">
        <template v-if="scope.row.type === 0 && scope.row.imgurl" slot-scope="scope" >
          <img :src="serviceSrc(scope.row.imgurl)" style="height:48px;width:48px;" >
        </template>
      </el-table-column>
      <el-table-column label="音频" width="320" align="center">
        <template v-if="scope.row.type === 0 && scope.row.audiourl" slot-scope="scope">
          <audio :src="serviceSrc(scope.row.audiourl)" style="height:48px;" controls="controls" />
        </template>
      </el-table-column>
      <el-table-column label="视频" align="center">
        <template v-if="scope.row.type === 1 && scope.row.videourl" slot-scope="scope">
          <el-button size="small" @click="playVideo(scope.row.videourl)"><i class="el-icon-caret-right"/></el-button>
        </template>
      </el-table-column>
      <el-table-column fixed="right" label="操作" width="140">
        <template slot-scope="scope">
          <el-button type="text" @click="addScene(scope.row)"><i class="el-icon-edit"/></el-button>
          <el-button type="text" @click="reomve(scope.row)"><i class="el-icon-delete"/></el-button>
          <el-button type="text" @click="top(scope.row)">{{ 0 > scope.row.sort ? '取消置顶' : '置顶' }}</el-button>
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
        <el-form-item label-width="120px" label="标题" prop="title_zh">
          <el-input v-model="form.title_zh" clearable auto-complete="off" @change="translateTitle(1)"/>
        </el-form-item>
        <el-form-item label-width="120px" label="Title" prop="title_en">
          <el-input v-model="form.title_en" clearable auto-complete="off" @change="translateTitle(2)"/>
        </el-form-item>
        <el-form-item label-width="120px" label="タイトル" prop="title_ja">
          <el-input v-model="form.title_ja" clearable auto-complete="off" @change="translateTitle(3)"/>
        </el-form-item>
        <el-form-item label-width="120px" label="描述" prop="description_zh">
          <el-input
            :autosize="{ minRows: 2, maxRows:4}"
            v-model="form.description_zh"
            clearable
            type="textarea"
            @change="translateDesc(1)"/>
        </el-form-item>
        <el-form-item label-width="120px" label="Description" prop="description_en">
          <el-input
            :autosize="{ minRows: 2, maxRows:4}"
            v-model="form.description_en"
            clearable
            type="textarea"
            @change="translateDesc(2)"/>
        </el-form-item>
        <el-form-item label-width="120px" label="説明する" prop="description_ja">
          <el-input
            :autosize="{ minRows: 2, maxRows:4}"
            v-model="form.description_ja"
            clearable
            type="textarea"
            @change="translateDesc(3)"/>
        </el-form-item>
        <el-form-item label-width="120px" label="VIP" prop="vip">
          <el-checkbox v-model="form.vip" :checked="form.vip == 1" true-label="1" false-label="0" />
        </el-form-item>
        <el-form-item label-width="120px" label="" prop="type">
          <el-radio-group v-model="form.type">
            <el-radio-button label="0">音频+图片</el-radio-button>
            <el-radio-button label="1">视频</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item ref="myCover" label-width="120px" label="封面图">
          <el-upload
            :on-success="uploadCoverSuccess"
            :on-error="uploadImgFail"
            :on-remove="removeCover"
            :before-upload="beforeUploadImg"
            :file-list="coverList"
            :action="uploadAction"
            class="upload-demo"
            list-type="picture">
            <el-button v-show="!form.coverurl" size="small"><i class="el-icon-upload2"/></el-button>
          </el-upload>
        </el-form-item>
        <el-form-item v-show="form.type == '0'" ref="myImage" label-width="120px" label="图片" prop="imgurl">
          <el-upload
            :on-success="uploadImgSuccess"
            :on-error="uploadImgFail"
            :on-remove="removeImg"
            :before-upload="beforeUploadImg"
            :file-list="imgList"
            :action="uploadAction"
            class="upload-demo"
            list-type="picture">
            <el-button v-show="!form.imgurl" size="small"><i class="el-icon-upload2"/></el-button>
          </el-upload>
        </el-form-item>
        <el-form-item v-show="form.type == '0'" ref="myAudio" label-width="120px" label="音频" prop="audiourl">
          <audio v-show="form.audiourl" :src="serviceSrc(form.audiourl)" controls="controls" preload />
          <el-upload
            :on-success="uploadAudioSuccess"
            :on-error="uploadAudioFail"
            :on-remove="removeAudio"
            :before-upload="beforeUploadAudio"
            :file-list="audioList"
            :action="uploadAction"
            class="upload-demo"
            list-type="text">
            <el-button v-show="!form.audiourl" size="small"><i class="el-icon-upload2"/></el-button>
          </el-upload>
        </el-form-item>
        <el-form-item v-show="form.type == '1'" ref="myVideo" label-width="120px" label="视频" prop="videourl">
          <el-button v-show="form.videourl" size="small" @click="playVideo(form.videourl)"><i class="el-icon-caret-right"/></el-button>
          <el-upload
            :on-success="uploadVideoSuccess"
            :on-error="uploadVideoFail"
            :on-remove="removeVideo"
            :before-upload="beforeUploadVideo"
            :file-list="videoList"
            :action="uploadAction"
            class="upload-demo"
            list-type="text">
            <el-button v-show="!form.videourl" size="small"><i class="el-icon-upload2"/></el-button>
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
import { getList, translate, add, remove, top } from '@/api/table'

export default {
  filters: {
  },
  data() {
    return {
      listQuery: { pageSize: 10, pageIndex: 1 },
      list: null,
      total: 0,
      listLoading: true,
      dialogFormVisible: false,
      title: '添加场景',
      imgList: [],
      audioList: [],
      videoList: [],
      coverList: [],
      form: {
        id: 0,
        title_zh: '',
        title_en: '',
        title_ja: '',
        description_zh: '',
        description_en: '',
        description_ja: '',
        vip: 0,
        type: '0',
        imgurl: '',
        audiourl: '',
        videourl: '',
        coverurl: ''
      },
      rules: {
        title_zh: [
          { required: true, message: '请输入场景标题', trigger: 'blur' }
        ],
        title_en: [
          { required: true, message: 'Please enter the scene title', trigger: 'blur' }
        ],
        title_ja: [
          { required: true, message: 'シーンタイトルを入力してください。', trigger: 'blur' }
        ],
        description_zh: [
          { required: true, message: '请输入场景描述', trigger: 'blur' }
        ],
        description_en: [
          { required: true, message: 'Please enter a scenario description', trigger: 'blur' }
        ],
        description_ja: [
          { required: true, message: 'シーンの説明を入力してください。', trigger: 'blur' }
        ],
        imgurl: [
          { required: true, message: '请上传场景背景图' }
        ],
        audiourl: [
          { required: true, message: '请上传场景背景音乐' }
        ],
        videourl: [
          { required: true, message: '请上传场景视频' }
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
    // 置顶、取消置顶
    top(row) {
      top(row).then(response => {
        if (response.msg === 'success') {
          this.fetchData()
          this.$message({ message: '操作成功', type: 'success' })
        } else {
          this.$message.error('操作失败')
        }
      })
    },
    // 删除场景
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
    // 添加、编辑场景
    addScene(row) {
      if (row) {
        this.title = '编辑场景'
        this.form = JSON.parse(JSON.stringify(row))
        this.coverList = [{ name: 'cover', url: this.serviceSrc(row.coverurl) }]
        if (row.type === 0) {
          if (row.imgurl) {
            this.imgList = [{ name: 'picture', url: this.serviceSrc(row.imgurl) }]
          }
          if (row.audiourl) {
            this.audioList = [{ name: 'audio', url: row.audiourl }]
          }
        } else {
          if (row.videourl) {
            this.videoList = [{ name: 'video', url: row.videourl }]
          }
        }
      } else {
        this.title = '添加场景'
        this.form = {
          id: 0,
          title_zh: '',
          title_en: '',
          title_ja: '',
          description_zh: '',
          description_en: '',
          description_ja: '',
          vip: 0,
          type: '0',
          imgurl: '',
          audiourl: '',
          videourl: '',
          coverurl: ''
        }
        this.imgList = []
        this.audioList = []
        this.videoList = []
        this.coverList = []
      }
      this.dialogFormVisible = true
    },
    // 确定
    submit() {
      console.log(this.form)
      if (this.form.type > 0) {
        this.rules.imgurl[0].required = false
        this.rules.audiourl[0].required = false
        this.rules.videourl[0].required = true
      } else {
        this.rules.videourl[0].required = false
        this.rules.imgurl[0].required = true
        this.rules.audiourl[0].required = true
      }
      this.$refs['myForm'].validate((valid) => {
        if (valid) {
          if (this.form.type > 0) {
            this.form.imgurl = ''
            this.form.audiourl = ''
          } else {
            this.form.videourl = ''
          }
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
    // 翻译标题
    translateTitle(type) {
      const params1 = { q: '', from: '', to: '' }
      const params2 = { q: '', from: '', to: '' }
      switch (type) {
        case 1:
          params1.q = this.form.title_zh
          params1.from = 'zh'
          params2.q = this.form.title_zh
          params2.from = 'zh'
          if (!this.form.title_en) {
            params1.to = 'en'
            translate(params1).then(res => {
              this.form.title_en = res.data.trans_result[0].dst
            })
          }
          if (!this.form.title_ja) {
            params2.to = 'jp'
            translate(params2).then(res => {
              this.form.title_ja = res.data.trans_result[0].dst
            })
          }
          break
        case 2:
          params1.q = this.form.title_en
          params1.from = 'en'
          params2.q = this.form.title_en
          params2.from = 'en'
          if (!this.form.title_zh) {
            params1.to = 'zh'
            translate(params1).then(res => {
              this.form.title_zh = res.data.trans_result[0].dst
            })
          }
          if (!this.form.title_ja) {
            params2.to = 'jp'
            translate(params2).then(res => {
              this.form.title_ja = res.data.trans_result[0].dst
            })
          }
          break
        case 3:
          params1.q = this.form.title_ja
          params1.from = 'jp'
          params2.q = this.form.title_ja
          params2.from = 'jp'
          if (!this.form.title_zh) {
            params1.to = 'zh'
            translate(params1).then(res => {
              this.form.title_zh = res.data.trans_result[0].dst
            })
          }
          if (!this.form.title_en) {
            params2.to = 'en'
            translate(params2).then(res => {
              this.form.title_en = res.data.trans_result[0].dst
            })
          }
          break
      }
    },
    // 翻译描述
    translateDesc(type) {
      const params1 = { q: '', from: '', to: '' }
      const params2 = { q: '', from: '', to: '' }
      switch (type) {
        case 1:
          params1.q = this.form.description_zh
          params1.from = 'zh'
          params2.q = this.form.description_zh
          params2.from = 'zh'
          if (!this.form.description_en) {
            params1.to = 'en'
            translate(params1).then(res => {
              this.form.description_en = res.data.trans_result[0].dst
            })
          }
          if (!this.form.description_ja) {
            params2.to = 'jp'
            translate(params2).then(res => {
              this.form.description_ja = res.data.trans_result[0].dst
            })
          }
          break
        case 2:
          params1.q = this.form.description_en
          params1.from = 'en'
          params2.q = this.form.description_en
          params2.from = 'en'
          if (!this.form.description_zh) {
            params1.to = 'zh'
            translate(params1).then(res => {
              this.form.description_zh = res.data.trans_result[0].dst
            })
          }
          if (!this.form.description_ja) {
            params2.to = 'jp'
            translate(params2).then(res => {
              this.form.description_ja = res.data.trans_result[0].dst
            })
          }
          break
        case 3:
          params1.q = this.form.description_ja
          params1.from = 'jp'
          params2.q = this.form.description_ja
          params2.from = 'jp'
          if (!this.form.description_zh) {
            params1.to = 'zh'
            translate(params1).then(res => {
              this.form.description_zh = res.data.trans_result[0].dst
            })
          }
          if (!this.form.description_en) {
            params2.to = 'en'
            translate(params2).then(res => {
              this.form.description_en = res.data.trans_result[0].dst
            })
          }
          break
      }
    },
    // 上传图片前
    beforeUploadImg(file) {
      const accept = file.type.indexOf('image') >= 0
      if (!accept) {
        this.$message.error('格式错误')
      }
      return accept
    },
    // 上传图片成功
    uploadImgSuccess(response, file, fileList) {
      this.form.imgurl = response.data
      this.$refs['myImage'].clearValidate()
    },
    // 上传图片失败
    uploadImgFail(err, file, fileList) {
      this.$message.error(err)
    },
    // 删除图片
    removeImg(file, fileList) {
      this.form.imgurl = ''
    },
    // 上传封面图片成功
    uploadCoverSuccess(response, file, fileList) {
      this.form.coverurl = response.data
      this.$refs['myCover'].clearValidate()
    },
    // 删除封面图片
    removeCover(file, fileList) {
      this.form.coverurl = ''
    },
    // 上传音频前
    beforeUploadAudio(file) {
      const accept = file.type.indexOf('audio') >= 0
      if (!accept) {
        this.$message.error('格式错误')
      }
      return accept
    },
    // 上传音频成功
    uploadAudioSuccess(response, file, fileList) {
      this.form.audiourl = response.data
      this.$refs['myAudio'].clearValidate()
    },
    // 上传音频失败
    uploadAudioFail(err, file, fileList) {
      this.$message.error(err)
    },
    // 删除音频
    removeAudio(file, fileList) {
      this.form.audiourl = ''
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
      this.form.videourl = response.data
      this.$refs['myVideo'].clearValidate()
    },
    // 上传视频失败
    uploadVideoFail(err, file, fileList) {
      this.$message.error(err)
    },
    // 删除视频
    removeVideo(file, fileList) {
      this.form.videourl = ''
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
