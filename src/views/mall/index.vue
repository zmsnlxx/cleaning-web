<template>
  <div class="app-container">
    <div class="search-box">
      <el-form class="left" :model="params" label-width="80px">
        <el-form-item label="商品名称">
          <el-input v-model="params.name" clearable placeholder="请输入" />
        </el-form-item>
        <el-button round plain type="primary" @click="inquire">查询</el-button>
      </el-form>
      <el-button round class="right" type="primary" @click="dialogVisible = true">添加商品</el-button>
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
      <el-table-column label="商品名称">
        <template slot-scope="scope">
          {{ scope.row.name }}
        </template>
      </el-table-column>
      <el-table-column label="库存" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.stock }}</span>
        </template>
      </el-table-column>
      <el-table-column label="对应积分" align="center">
        <template slot-scope="scope">
          {{ scope.row.exchangeIntegral }}
        </template>
      </el-table-column>
      <el-table-column
        fixed="right"
        label="操作"
      >
        <template slot-scope="scope">
          <el-button type="text" size="small" @click="deleteRow(scope.row.goodsId)">删除</el-button>
          <el-button type="text" size="small" @click="edit(scope.row)">修改</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="params.page"
      :page-sizes="[2,10, 20, 50, 100, 200]"
      :page-size="10"
      background
      layout="total, sizes, prev, pager, next, jumper"
      :total="total">
    </el-pagination>

    <el-dialog :title="`${this.isEdit ? '编辑' : '新增'}商品`" :visible.sync="dialogVisible">
      <el-form :model="form" ref="form" :rules="rules">
        <el-form-item label="商品名称" label-width="120px" prop="name">
          <el-input v-model="form.name" autocomplete="off" placeholder="请输入标题" />
        </el-form-item>
        <el-form-item label="商品库存" label-width="120px" prop="stock">
          <el-input v-model="form.stock" rows="5" type="number" autocomplete="off" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="对应积分" label-width="120px" prop="exchangeIntegral">
          <el-input v-model="form.exchangeIntegral" type="number" autocomplete="off" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="主图" label-width="120px">
          <el-upload
            :show-file-list="false"
            auto-upload
            :data="uploadParams"
            :limit="1"
            accept="image/*"
            :on-success="handleSuccess"
            :before-upload="handlebeforeUpload"
            action="https://up-z0.qiniup.com"
            list-type="picture-card">
            <img v-if="imageUrl" :src="imageUrl" class="avatar">
            <i v-else class="el-icon-plus avatar-uploader-icon" />
          </el-upload>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false" class="plain-btn">取 消</el-button>
        <el-button type="primary" @click="add" class="btn">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getGoodsList, addGoods, delGoods, getQiNiuToken, updateGoods } from '@/api/mall'
import { mapGetters } from 'vuex'

const url = 'http://cdn.fledchina.com/'
export default {
  data() {
    return {
      rules: {
        name: [{ required: true, message: '请输入商品名称' }],
        stock: [{ required: true, message: '请输入商品库存' }],
        exchangeIntegral: [{ required: true, message: '请输入对应积分' }],
      },
      total: 0,
      params: {
        page: 1,
        pageSize: 10,
        search: '',
      },
      uploadParams: { token: '', key: '' },
      list: [],
      listLoading: true,
      dialogVisible: false,
      form: {
        name: '',
        stock: '',
        exchangeIntegral: '',
        pic: ''
      },
      imageUrl: '',
      isEdit: false,
      currentId: null,
    }
  },
  created() {
    this.fetchData()
  },
  computed: {
    ...mapGetters(['orgId'])
  },
  watch: {
    dialogVisible: {
      handler(val) {
        if (!val) {
          this.$refs.form.resetFields()
          this.form = {
            name: '',
            stock: '',
            exchangeIntegral: '',
            pic: ''
          }
          this.isEdit = false
          this.currentId = null
          this.imageUrl = ''
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

  methods: {
    edit(row) {
      this.isEdit = true;
      this.currentId = row.goodsId
      _.assign(this.form, _.pick(row, _.keys(this.form)))
      this.imageUrl = row.pic
      this.form.pic = row.pic.split('.com/')[1]
      this.dialogVisible = true
    },
    handleSuccess(res) {
      this.form.pic = res.key
      this.imageUrl = url + res.key
    },
    handlebeforeUpload(file) {
      this.uploadParams.key = encodeURI(Date.now() + '' + Math.floor(Math.random() * 10000))
      // 这里做可以做文件校验操作
      const isImg = /^image\/\w+$/i.test(file.type)
      if (!isImg) {
        this.$message.error('只能上传 JPG、PNG、GIF 格式!')
        return false
      }
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
    deleteRow(goodsId) {
      delGoods({ goodsId }).then(() => {
        this.$message({ message: '删除商品成功', type: 'success' })
        this.fetchData()
      })
    },
    add() {
      const api = this.isEdit ? updateGoods : addGoods
      const params = this.isEdit ? _.assign({}, this.form, { goodsId: this.currentId }) : this.form
      api(params).then(() => {
        this.dialogVisible = false
        this.$message({ message: `${this.isEdit ? '编辑' : '新增'}商品成功`, type: 'success' })
        this.fetchData()
      })
    },
    fetchData() {
      this.listLoading = false
      getGoodsList(this.params).then(response => {
        this.list = response.data.list
        this.total = response.data.total
        this.listLoading = false
      })
    },
    handleSizeChange(val) {
      this.params.pageSize = val
      this.fetchData()
    },
    handleCurrentChange(val) {
      this.params.page = val
      this.fetchData()
    },
    inquire() {
      this.params.pageSize = 10
      this.params.page = 1
      this.fetchData()
    }
  },
}
</script>
<style lang="scss" scoped>
  .avatar {
    width: 100%;
    height: 100%;
    display: block;
  }
  .search-box {
    width: 100%;
    display: flex;
    margin-bottom: 10px;
    justify-content: space-between;

    .left {
      display: flex;

      .userinfo-list {
        display: flex;
        margin-right: 50px;

        span {
          display: inline-block;
          min-width: 48px;
          height: 40px;
          line-height: 40px;
          margin-right: 30px;
        }
      }

      .query-btn {
        color: #489F93;
        border-color: #489F93;
      }
    }

    .right {
      display: flex;

      .add-btn {
        background-color: #489F93;
        color: #FFFFFF;
      }
    }

  }
  .el-pagination {
    display: flex;
    justify-content: flex-end;
    margin-top: 10px;
  }
</style>
