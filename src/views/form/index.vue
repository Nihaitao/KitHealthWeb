<template>
  <div class="app-container">
    <div class="filter-container" style="margin-bottom:20px">
      <div class="filter-item el-input el-input--medium" style="width: 200px;">
        <input v-model="listQuery.title" clearable type="text" autocomplete="off" class="el-input__inner">
      </div>
      <button type="button" class="el-button filter-item el-button--primary el-button--medium" @click="fetchData"><i class="el-icon-search"/><span>Search</span></button>
      <button type="button" class="el-button filter-item el-button--primary el-button--medium" style="float:right" @click="addAlbum()"><i class="el-icon-plus"/></button>
      <el-dropdown class="nav-dropdown nav-lang el-dropdown" style="cursor: pointer;display: inline-block;height: 100%;color: #888;margin-left:40px" @command="chooseLanguage">
        <span class="el-dropdown-link">
          {{ currentLanguage }}<i class="el-icon-arrow-down el-icon--right"/>
        </span>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item command="中 文">中 文</el-dropdown-item>
          <el-dropdown-item command="English">English</el-dropdown-item>
          <el-dropdown-item command="日本語">日本語</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
    <el-row>
      <el-col v-for="(item, index1) in mydata" :span="6" :key="item.id">
        <el-card :body-style="{ padding: '5px' }" shadow="hover" style="margin:10px">
          <img :src="serviceSrc(item.cover)" class="image">
          <div style="padding: 14px;">
            <span>{{ currentLanguage === "中 文" ? item.title_zh : currentLanguage === "English" ? item.title_en : item.title_ja }}</span><span v-if="item.vip * 1 === 1" class="vip"> vip</span>
            <div class="bottom clearfix">
              <div class="time" style="display:inline-block;">{{ currentLanguage === "中 文" ? item.subhead_zh : currentLanguage === "English" ? item.subhead_en : item.subhead_ja }}</div>
              <div style="float:right;display:inline-block;">
                <el-button type="text" class="button" style="margin-left:10px" @click="removeAlbum(item.id)"><i class="el-icon-delete"/></el-button>
                <el-button type="text" class="button" style="margin-left:10px" @click="addAlbum(item)"><i class="el-icon-edit"/></el-button>
                <!-- <el-button type="text" class="button" style="margin-left:10px"><i class="el-icon-plus"/></el-button> -->
              </div>
            </div>
          </div>
          <div :style="{'overflow-y':'scroll', 'height':'307px', 'margin-top' : '5px'}">
            <div v-for="(detail,index2) in item.details" :key="detail.id" class="text item" >
              <div style="display:inline-block;max-width:200px;overflow:hidden;white-space: nowrap;text-overflow:ellipsis;">
                <span style="color:#999">{{ index2 > 9 ? index2 + 1 : '0' + (index2 + 1) }}</span>
                <span :title="detail.title">{{ detail.title }}</span>
              </div>
              <div style="float:right;display:inline-block;">
                <span style="color:#999">{{ detail.times | timesFormat }}</span>
                <el-button style="margin-left:10px" type="text" class="button" @click="play(detail,index1,index2)"><i :class="isPlaying(index1,index2) ? 'el-icon-loading' : 'el-icon-service'"/></el-button>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    <div v-show="showPlay" style="position:fixed;bottom:0px;width:100%;background-color:#f1f3f4;">
      <audio :src="serviceSrc(audiourl)" style="width:80%" controls="controls" autoplay />
    </div>
    <el-dialog :visible.sync="dialogFormVisible" :title="title" width="1000px">
      <el-form ref="myForm" :model="form" :rules="rules" :inline="true">
        <el-form-item label-width="100px" label="标题" prop="title_zh">
          <el-input v-model="form.title_zh" clearable auto-complete="off" @change="translateTitle(1)"/>
        </el-form-item>
        <el-form-item label-width="100px" label="Title" prop="title_en">
          <el-input v-model="form.title_en" clearable auto-complete="off" @change="translateTitle(2)"/>
        </el-form-item>
        <el-form-item label-width="100px" label="タイトル" prop="title_ja">
          <el-input v-model="form.title_ja" clearable auto-complete="off" @change="translateTitle(3)"/>
        </el-form-item>
        <el-form-item label-width="100px" label="副标题" prop="subhead_zh">
          <el-input v-model="form.subhead_zh" clearable auto-complete="off" @change="translateSub(1)"/>
        </el-form-item>
        <el-form-item label-width="100px" label="SubTitle" prop="subhead_en">
          <el-input v-model="form.subhead_en" clearable auto-complete="off" @change="translateSub(2)"/>
        </el-form-item>
        <el-form-item label-width="100px" label="サブタイトル" prop="subhead_ja">
          <el-input v-model="form.subhead_ja" clearable auto-complete="off" @change="translateSub(3)"/>
        </el-form-item>
        <el-form-item label-width="100px" label="封面">
          <el-upload
            :on-success="uploadCoverSuccess"
            :on-error="uploadImgFail"
            :before-upload="beforeUploadImg"
            :action="uploadAction"
            :show-file-list="false"
            class="avatar-uploader"
            list-type="picture">
            <img v-if="form.cover" :src="serviceSrc(form.cover)" class="avatar">
            <i v-else class="el-icon-plus avatar-uploader-icon"/>
          </el-upload>
        </el-form-item>
        <el-form-item ref="myAudio" label-width="120px" label="音频" prop="audiourl">
          <el-upload
            :on-success="uploadAudioSuccess"
            :on-error="uploadAudioFail"
            :on-remove="removeAudio"
            :before-upload="beforeUploadAudio"
            :file-list="audioList"
            :action="uploadAction"
            multiple
            class="upload-demo"
            list-type="text">
            <el-button size="small"><i class="el-icon-upload2"/></el-button>
          </el-upload>
        </el-form-item>
        <el-form-item label-width="120px" label="VIP" prop="vip">
          <el-checkbox v-model="form.vip" :checked="form.vip * 1 === 1" true-label="1" false-label="0" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="submit">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>

import { translate } from '@/api/table'
import { add, getList, remove } from '@/api/album'
export default {
  filters: {
    timesFormat: function(s) {
      let h = Math.floor(s / 60)
      s = s % 60
      h += ''
      s += ''
      h = (h.length === 1) ? '0' + h : h
      s = (s.length === 1) ? '0' + s : s
      return h + ':' + s
    }
  },
  props: {
    paramtype: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      listQuery: { pageSize: 10, pageIndex: 1, type: this.paramtype },
      currentLanguage: '中 文',
      playIndex1: -1,
      playIndex2: -1,
      dialogFormVisible: false,
      showPlay: false,
      title: '新增专辑',
      mydata: [],
      audiourl: '',
      audioList: [],
      form: {
        id: 0,
        title_zh: '',
        title_en: '',
        title_ja: '',
        subhead_zh: '',
        subhead_en: '',
        subhead_ja: '',
        cover: '',
        type: 0,
        vip: 0
      },
      details: [],
      rules: {
        title_zh: [
          { required: true, message: '请输入标题', trigger: 'blur' }
        ],
        title_en: [
          { required: true, message: 'Please enter the title', trigger: 'blur' }
        ],
        title_ja: [
          { required: true, message: 'タイトルを入力してください。', trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    uploadAction: function() {
      return process.env.BASE_API + '/upload'
    }
  },
  // 监听路由，刷新
  watch: {
    '$route': 'fetchData'
  },
  created() {
    this.fetchData()
  },
  methods: {
    onSubmit() {
      this.$message('submit!')
    },
    onCancel() {
      this.$message({
        message: 'cancel!',
        type: 'warning'
      })
    },
    fetchData() {
      this.listQuery.type = this.paramtype
      getList(this.listQuery).then(response => {
        this.mydata = response.data
      })
    },
    submit() {
      console.log(this.form)
      this.$refs['myForm'].validate((valid) => {
        if (valid) {
          add({ album: this.form, details: this.details }).then(response => {
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
    addAlbum(album) {
      this.audioList = []
      this.details = []
      if (album) {
        this.title = '编辑专辑'
        this.form = {
          id: album.id,
          title_zh: album.title_zh,
          title_en: album.title_en,
          title_ja: album.title_ja,
          subhead_zh: album.subhead_zh,
          subhead_en: album.subhead_en,
          subhead_ja: album.subhead_ja,
          cover: album.cover,
          type: this.paramtype,
          vip: album.vip
        }
        this.details = album.details
        album.details.forEach(item => {
          this.audioList.push({ name: item.title })
        })
      } else {
        this.form = {
          id: 0,
          title_zh: '',
          title_en: '',
          title_ja: '',
          subhead_zh: '',
          subhead_en: '',
          subhead_ja: '',
          cover: '',
          type: this.paramtype,
          vip: 0
        }
      }
      this.dialogFormVisible = true
    },
    removeAlbum(id) {
      remove({ id }).then(response => {
        if (response.msg === 'success') {
          this.dialogFormVisible = false
          this.fetchData()
          this.$message({ message: '操作成功', type: 'success' })
        } else {
          this.$message.error('操作失败')
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
    // 翻译副标题
    translateSub(type) {
      const params1 = { q: '', from: '', to: '' }
      const params2 = { q: '', from: '', to: '' }
      switch (type) {
        case 1:
          params1.q = this.form.subhead_zh
          params1.from = 'zh'
          params2.q = this.form.subhead_zh
          params2.from = 'zh'
          if (!this.form.subhead_en) {
            params1.to = 'en'
            translate(params1).then(res => {
              this.form.subhead_en = res.data.trans_result[0].dst
            })
          }
          if (!this.form.subhead_ja) {
            params2.to = 'jp'
            translate(params2).then(res => {
              this.form.subhead_ja = res.data.trans_result[0].dst
            })
          }
          break
        case 2:
          params1.q = this.form.subhead_en
          params1.from = 'en'
          params2.q = this.form.subhead_en
          params2.from = 'en'
          if (!this.form.subhead_zh) {
            params1.to = 'zh'
            translate(params1).then(res => {
              this.form.subhead_zh = res.data.trans_result[0].dst
            })
          }
          if (!this.form.subhead_ja) {
            params2.to = 'jp'
            translate(params2).then(res => {
              this.form.subhead_ja = res.data.trans_result[0].dst
            })
          }
          break
        case 3:
          params1.q = this.form.subhead_ja
          params1.from = 'jp'
          params2.q = this.form.subhead_ja
          params2.from = 'jp'
          if (!this.form.subhead_zh) {
            params1.to = 'zh'
            translate(params1).then(res => {
              this.form.subhead_zh = res.data.trans_result[0].dst
            })
          }
          if (!this.form.subhead_en) {
            params2.to = 'en'
            translate(params2).then(res => {
              this.form.subhead_en = res.data.trans_result[0].dst
            })
          }
          break
      }
    },
    // 是否正在播放
    isPlaying(index1, index2) {
      return this.playIndex1 === index1 && this.playIndex2 === index2
    },
    // 上传图片前
    beforeUploadImg(file) {
      const accept = file.type.indexOf('image') >= 0
      if (!accept) {
        this.$message.error('格式错误')
      }
      return accept
    },
    // 上传封面图片成功
    uploadCoverSuccess(response, file, fileList) {
      this.form.cover = response.data
    },
    // 上传图片失败
    uploadImgFail(err, file, fileList) {
      this.$message.error(err)
    },
    // 删除封面图片
    removeCover(file, fileList) {
      this.form.cover = ''
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
      const that = this
      // 经测试，发现audio也可获取视频的时长
      const audioElement = new Audio(this.serviceSrc(response.data))
      audioElement.addEventListener('loadedmetadata', function(_event) {
        that.details.push({ title: file.name, url: response.data, times: audioElement.duration || 0 })
      })
    },
    // 上传音频失败
    uploadAudioFail(err, file, fileList) {
      this.$message.error(err)
    },
    // 删除音频
    removeAudio(file, fileList) {
      this.details.forEach((item, index) => {
        if (item.title === file.name) {
          this.details.splice(index, 1)
        }
      })
    },
    serviceSrc(url) {
      return process.env.BASE_API + '/' + url
    },
    play(detail, index1, index2) {
      if (!this.isPlaying(index1, index2)) {
        this.showPlay = true
        this.audiourl = detail.url
        this.playIndex1 = index1
        this.playIndex2 = index2
      }
    },
    chooseLanguage(language) {
      this.currentLanguage = language
    }
  }
}
</script>

<style>
@import url("//unpkg.com/element-ui@2.7.0/lib/theme-chalk/index.css");
.time {
    font-size: 13px;
    color: #999;
  }

  .bottom {
    margin-top: 13px;
    line-height: 12px;
  }

  .button {
    padding: 0;
    float: right;
  }

  .image {
    width: 100%;
    display: block;
  }

  .clearfix:before,
  .clearfix:after {
      display: table;
      content: "";
  }

  .clearfix:after {
      clear: both
  }

  .text {
    font-size: 14px;
  }

  .item {
    margin: 0 10px 18px 10px;
  }

.avatar-uploader .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }
  .avatar-uploader .el-upload:hover {
    border-color: #409EFF;
  }
  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 178px;
    height: 178px;
    line-height: 178px;
    text-align: center;
  }
  .avatar {
    width: 178px;
    height: 178px;
    display: block;
  }
  .vip{
    font-size: 10px;
    color: goldenrod;
  }

/*定义滚动条高宽及背景 高宽分别对应横竖滚动条的尺寸*/
::-webkit-scrollbar
{
    width: 4px;
    background-color: #fff;
}

/*定义滑块 内阴影+圆角*/
::-webkit-scrollbar-thumb
{
    border-radius: 10px;
    background-color: #ddd;
}

</style>

