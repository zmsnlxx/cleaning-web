<template>
  <div class="app-container">
    <div class="search-box">
      <el-form class="left" :model="params" label-width="80px">
        <el-form-item label="视频标题">
          <el-input v-model="params.videoName" clearable />
        </el-form-item>
        <el-form-item label="发布时间">
          <el-date-picker
            v-model="params.createtime"
            type="date"
            placeholder="选择日期"
            format="yyyy 年 MM 月 dd 日"
            value-format="timestamp">
          </el-date-picker>
        </el-form-item>
        <el-button round plain type="primary" @click="inquire">查询</el-button>
      </el-form>
      <el-button round class="right" type="primary" @click="dialogVisible = true">添加视频</el-button>
    </div>
    <el-table
      v-loading="listLoading"
      :data="list"
      element-loading-text="Loading"
      fit
      highlight-current-row
    >
      <el-table-column align="center" width="60px">
        <template slot-scope="scope">
          {{ (params.page - 1) * params.pageSize + scope.$index + 1 }}
        </template>
      </el-table-column>
      <el-table-column label="视频标题">
        <template slot-scope="scope">
          {{ scope.row.videoName }}
        </template>
      </el-table-column>
      <el-table-column label="发布时间" align="center">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createtime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="播放量" align="center" width="300">
        <template slot-scope="scope">
          {{ scope.row.videoNum }}
        </template>
      </el-table-column>
      <el-table-column
        fixed="right"
        label="操作"
      >
        <template slot-scope="scope">
          <el-button type="text" size="small" @click="deleteRow(scope.row.videoId)">删除</el-button>
          <el-button type="text" size="small" @click="edit(scope.row)">修改</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      style="margin-top: 20px;padding-left: 0"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="params.page"
      :page-sizes="[2,10, 20, 50, 100, 200]"
      :page-size="10"
      background
      layout="total, sizes, prev, pager, next, jumper"
      :total="total">
    </el-pagination>

    <el-dialog :title="`${this.isEdit ? '编辑' : '新增'}视频`" :visible.sync="dialogVisible">
      <el-form :model="form" ref="form" :rules="rules">
        <el-form-item label="视频标题" label-width="120px" prop="videoName">
          <el-input v-model="form.videoName" autocomplete="off" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="上传视频" label-width="120px">
          <el-upload
            auto-upload
            :data="uploadParams"
            :limit="1"
            :file-list="fileList"
            accept="video/*"
            :on-success="handleSuccess"
            :before-upload="handlebeforeUpload"
            action="https://up-z0.qiniup.com"
            :on-remove="handleRemove"
            :before-remove="beforeRemove"
          >
            <el-button size="small" icon="el-icon-upload">点击上传</el-button>
          </el-upload>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="add">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getVideoList, addVideo, deleteVideo, updateVideo } from '@/api/video'
import { getQiNiuToken } from '@/api/mall'
import { parseTime } from '@/utils'
import { mapGetters } from 'vuex'

export default {
  data() {
    return {
      dialogVisible: false,
      parseTime,
      rules: {
        videoName: [{ required: true, message: '视频标题不能为空' }],
      },
      total: 0,
      fileList: [],
      params: {
        page: 1,
        pageSize: 10,
        videoName: '',
        createtime: '',
      },
      uploadParams: { token: '', key: '' },
      list: [],
      listLoading: true,
      isEdit: false,
      currentId: null,
      form: { videoName: '', videoUrl: '' }
    }
  },
  computed: {
    ...mapGetters(['orgId'])
  },
  watch: {
    dialogVisible: {
      handler(val) {
        if (!val) {
          this.$refs.form.resetFields()
          this.form = { videoName: '', videoUrl: '' }
          this.fileList = []
          this.isEdit = false
          this.currentId = ''
        }
      },
    },
    orgId: {
      handler(val) {
        if (val) {
          this.fetchData()
        }
      }
    }
  },
  mounted() {
    this.fetchData()
  },

  methods: {
    edit(row) {
      this.isEdit = true;
      const { videoId, videoName, videoUrl } = row
      this.currentId = videoId
      this.form.videoName = videoName
      this.form.videoUrl = videoUrl.split('.com/')[1]
      this.fileList = [{ url: videoUrl, name: videoName }]
      this.dialogVisible = true
    },
    handleRemove() {
      this.form.videoUrl = ''
    },
    beforeRemove(file) {
      return this.$confirm(`确定移除 ${ file.name }？`);
    },
    handleSuccess(res) {
      this.form.videoUrl = res.key
    },
    handlebeforeUpload() {
      this.uploadParams.key = encodeURI(Date.now() + '' + Math.floor(Math.random() * 10000))
      return new Promise((resolve, reject) => {
        getQiNiuToken().then(res => {
          const { token } = res.data
          this.uploadParams.token = token
          resolve(true)
        }).catch(err => {
          reject(err)
        })
      })
    },
    add() {
      const api = this.isEdit ? updateVideo : addVideo
      const params = this.isEdit ? _.assign({}, this.form, { videoId: this.currentId }) : this.form
      if (!params.videoUrl) {
        this.$message({ message: '请上传视频', type: 'error' })
        return
      }
      if (!params.videoName) {
        this.$message({ message: '请填写视频名称', type: 'error' })
        return
      }
      api(params).then(() => {
        this.dialogVisible = false
        this.$message({ message: `${this.isEdit ? '编辑' : '新增'}视频成功`, type: 'success' })
        this.fetchData()
      })
    },
    deleteRow(videoId) {
      deleteVideo({ videoId }).then(() => {
        this.$message({ message: '删除视频成功', type: 'success' })
        this.fetchData()
      })
    },
    handleSizeChange(val) {
      this.params.pageSize = val
      this.fetchData()
    },
    handleCurrentChange(val) {
      console.log(val)
      this.params.page = val
      this.fetchData()
    },
    fetchData() {
      this.listLoading = true
      getVideoList(this.params).then(response => {
        this.list = response.data.list
        this.total = response.data.total
        this.listLoading = false
      })
    },
    inquire() {
      this.params.pageSize = 10
      this.params.page = 1
      this.fetchData()
    }

  },
}
</script>
