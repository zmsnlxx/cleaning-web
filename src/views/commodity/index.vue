<template>
  <div class="app-container">
    <div class="search-box">
      <el-form class="left" :model="params" label-width="80px">
        <el-form-item label="类型">
          <el-select v-model="params.type" clearable placeholder="请选择">
            <el-option
              v-for="item in types"
              :key="item.id"
              :label="item.name"
              :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-button round plain type="primary" @click="inquire">查询</el-button>
      </el-form>
      <el-button round type="primary" @click="open('1')">添加</el-button>
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
      <el-table-column label="名称">
        <template slot-scope="scope">
          {{ scope.row.name }}
        </template>
      </el-table-column>
      <el-table-column label="类型" align="center">
        <template slot-scope="scope">
          <span>{{ _.chain(types).find(item => item.id === scope.row.type).get('name').value() }}</span>
        </template>
      </el-table-column>
      <el-table-column label="品牌" align="center">
        <template slot-scope="scope">
          {{ scope.row.brand }}
        </template>
      </el-table-column>
      <el-table-column label="规格" align="center">
        <template slot-scope="scope">
          {{ scope.row.spec }}
        </template>
      </el-table-column>
      <el-table-column label="单位" align="center">
        <template slot-scope="scope">
          {{ scope.row.unit }}
        </template>
      </el-table-column>
      <el-table-column fixed="right" label="操作">
        <template slot-scope="scope">
          <el-button type="text" size="small" @click="open('2', scope.row)">修改</el-button>
          <el-button type="text" size="small" @click="del(scope.row.suppliesId)">删除</el-button>
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

    <el-dialog :title="`${isEdit ? '修改' : '添加'}商品品类`" :visible.sync="dialogVisible" width="40%">
      <el-form ref="form" :model="row" label-width="80px" :rules="rules">
        <el-form-item label="名称" prop="name">
          <el-input v-model="row.name" placeholder="请输入商品名称" />
        </el-form-item>
        <el-form-item label="类别" prop="type">
          <el-select v-model="row.type" placeholder="请选择商品类别">
            <el-option v-for="item in types" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="品牌" prop="brand">
          <el-input v-model="row.brand" placeholder="请输入商品品牌" />
        </el-form-item>
        <el-form-item label="规格" prop="spec">
          <el-input v-model="row.spec" placeholder="请输入商品规格" />
        </el-form-item>
        <el-form-item label="单位" prop="unit">
          <el-input v-model="row.unit" placeholder="请输入商品单位" />
        </el-form-item>
        <el-form-item label="商品图" required>
          <el-upload
            class="avatar-uploader"
            :show-file-list="false"
            auto-upload
            :data="uploadParams"
            accept="image/*"
            :on-success="handleSuccess"
            :before-upload="handlebeforeUpload"
            action="https://up-z0.qiniup.com">
            <img v-if="row.pic" :src="`http://cdn.fledchina.com/${row.pic}`" class="avatar">
            <i v-else class="el-icon-plus avatar-uploader-icon" />
          </el-upload>
          <div class="close" v-if="row.pic" @click="handleRemove">
            <i class="el-icon-circle-close" />
          </div>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="updateData">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { getSuppliesList, addSupplies, getSuppliesTypes, updateSupplies, delSupplies } from '@/api/supplies'
import { mapGetters } from 'vuex'
import { getQiNiuToken } from '@/api/mall'

export default {
  data() {
    return {
      rules: {
        name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
        type: [{ required: true, message: '请选择商品类型', trigger: 'change' }],
        brand: [{ required: true, message: '请输入商品品牌', trigger: 'blur' }],
        spec: [{ required: true, message: '请输入商品规格', trigger: 'blur' }],
        unit: [{ required: true, message: '请输入商品单位', trigger: 'blur' }],
      },
      types: [],
      total: 0,
      params: { page: 1, pageSize: 10, type: '', },
      list: [],
      listLoading: true,
      dialogVisible: false,
      row: { name: '', type: '', brand: '', spec: '', unit: '', pic: '' },
      isEdit: false,
      suppliesId: '',

      uploadParams: { token: '', key: '' },
      fileList: [],

    }
  },
  async created() {
    this.fetchData()
    getSuppliesTypes().then(res => {
      this.types = res.data
    })
  },
  computed: {
    ...mapGetters(['orgId', 'org']),
    orgName() {
      return this.org.find(item => item.orgid === this.orgId).orgname
    }
  },
  watch: {
    dialogVisible: {
      handler(val) {
        if (!val) {
          this.$refs.form.resetFields()
          Object.keys(this.row).forEach(key => {
            this.row[key] = ''
          })
          this.isEdit = false
          this.suppliesId = ''
        }
      }
    },
    orgId: {
      handler(val) {
        if (val) {
          this.fetchData()
        }
      }
    },
  },

  methods: {
    handleSuccess(res) {
      this.row.pic = res.key
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
    handleRemove() {
      this.$confirm(`确定移除 ${ this.row.pic }？`).then(() => {
        this.row.pic = ''
      })
    },
    updateData() {
      if (!this.row.pic) return this.$message.error('请上传图片！')
      this.$refs.form.validate((valid) => {
        if (valid) {
          const api = this.isEdit ? updateSupplies : addSupplies
          const params = this.isEdit ? Object.assign({}, this.row, { suppliesId: this.suppliesId }) : this.row
          api(params).then(() => {
            this.dialogVisible = false
            this.$message.success(`${this.isEdit ? '修改' : '添加'}成功!`)
            this.fetchData()
          })
        } else {
          return false;
        }
      })
    },
    del(suppliesId) {
      delSupplies({ suppliesId }).then(() => {
        this.$message.success('删除成功!')
        this.fetchData()
      })
    },
    open(type, row) {
      if (row) {
        Object.keys(this.row).forEach(key => {
          if (key === 'pic') {
            const path = 'http://cdn.fledchina.com/'
            this.row.pic = row.pic.substring(path.length)
          } else {
            this.row[key] = row[key]
          }
        })
        this.suppliesId = row.suppliesId
      }
      this.isEdit = type === '2'
      this.dialogVisible = true
    },
    fetchData() {
      this.listLoading = true
      getSuppliesList(this.params).then(response => {
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
<style>
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
.close {
  position: absolute;
  left: 170px;
  top: -20px;
  font-size: 20px;
}
.avatar {
  width: 178px;
  height: 178px;
  display: block;
}
</style>
