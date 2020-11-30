<template>
  <div class="app-container">
    <div class="search-box">
      <el-form class="left" :model="params" label-width="50px">
        <el-form-item label="姓名">
          <el-input v-model="params.pername" clearable placeholder="请输入" />
        </el-form-item>
        <el-form-item label="手机号" label-width="60px">
          <el-input placeholder="请输入" v-model="params.phone" clearable class="user-info" />
        </el-form-item>
        <el-form-item label="职位">
          <el-select v-model="params.position" placeholder="请选择">
            <el-option
              v-for="item in options"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-button round plain type="primary" @click="inquire">查询</el-button>
      </el-form>
      <el-button round class="right" type="primary" @click="dialogVisible = true">添加人员</el-button>
    </div>
    <el-table v-loading="listLoading" :data="list" element-loading-text="Loading" fit highlight-current-row>
      <el-table-column align="center" width="60px">
        <template slot-scope="scope">
          {{ (params.page - 1) * params.pageSize + scope.$index + 1 }}
        </template>
      </el-table-column>
      <el-table-column label="名称">
        <template slot-scope="scope">
          {{ scope.row.pername }}
        </template>
      </el-table-column>
      <el-table-column label="手机号" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.phone }}</span>
        </template>
      </el-table-column>
      <el-table-column label="联系方式" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.contact }}</span>
        </template>
      </el-table-column>
      <el-table-column label="职位" align="center">
        <template slot-scope="scope">
          <span v-for="i in scope.row.position.split(',')" :key="i">
            {{ options.find(item => item.value === i).label }}
          </span>
        </template>
      </el-table-column>
      <el-table-column fixed="right" label="操作">
        <template slot-scope="scope">
          <el-button type="text" size="small" @click="deleteUser(scope.row)">删除</el-button>
          <el-button type="text" size="small" @click="edit(scope.row)">修改</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      v-if="list.length"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="params.page"
      :page-sizes="[2,10, 20, 50, 100, 200]"
      :page-size="10"
      background
      layout="total, sizes, prev, pager, next, jumper"
      :total="total">
    </el-pagination>

    <!-- 添加人员弹框 -->
    <el-dialog :title="`${isEdit ? '编辑' : '添加'}人员`" :visible.sync="dialogVisible">
      <el-form :model="form" ref="form" :rules="rules">
        <el-form-item label="姓名" label-width="120px" prop="pername">
          <el-input v-model="form.pername" autocomplete="off" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="手机号" label-width="120px" prop="phone">
          <el-input v-model="form.phone" autocomplete="off" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="联系方式" label-width="120px" prop="contact">
          <el-input placeholder="请输入" v-model="form.contact" clearable />
        </el-form-item>
        <el-form-item label="职位" label-width="120px" prop="position">
          <el-select v-model="position" multiple @change="changePosition" placeholder="请选择">
            <el-option
              v-for="item in options"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
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
import { addUser, getUserList, delUser, updateUser } from '@/api/userList'
import { mapGetters } from 'vuex'

export default {
  data() {
    const checkPhone = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('手机号不能为空'))
      } else {
        const reg = /^1[3|4|5|7|8|9|6][0-9]\d{8}$/
        if (reg.test(value)) {
          callback()
        } else {
          return callback(new Error('请输入正确的手机号'))
        }
      }
    }
    return {
      options: [
        { label: '保洁', value: '1' },
        { label: '领班', value: '2' },
        { label: '主管', value: '3' },
        { label: '管理员', value: '4' },
      ],
      rules: {
        phone: [{ required: true, trigger: 'blur', validator: checkPhone }],
        contact: [{ required: true, trigger: 'blur', validator: checkPhone }],
        position: [{ required: true, message: '请选择职位' }],
        pername: [{ required: true, message: '请输入姓名' }],
      },
      total: 0,
      dialogVisible: false,
      params: { page: 1, pageSize: 10, pername: '', phone: '', position: '', },
      list: [],
      listLoading: true,
      loading: false,
      form: { pername: '', phone: '', position: '', contact: '' },
      isEdit: false,
      currentId: null,
      position: [],
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
          this.form = { pername: '', phone: '', position: '', }
          this.isEdit = false
          this.currentId = null
        }
      },
    },
    orgId: {
      handler(val) {
        if (val) {
          this.fetchData()
        }
      }
    },
    position: {
      handler(val) {
        this.form.position = val ? val.join(',') : ''
      }
    }
  },

  methods: {
    changePosition(e) {
      if ((e.includes('3') || e.includes('4')) && e.length > 1) {
        this.$message.error('管理员和主管不可多选')
        this.position = ''
      }
    },
    edit (row) {
      this.isEdit = true;
      this.currentId = row.id
      _.assign(this.form, _.pick(row, _.keys(this.form)))
      this.position = row.position.split(',')
      this.dialogVisible = true
    },
    deleteUser(row) {
      const { id } = row
      delUser({ id }).then(() => {
        this.$message({ message: '删除用户成功', type: 'success' })
        this.fetchData()
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
    add() {
      const api = this.isEdit ? updateUser : addUser
      const params = this.isEdit ? _.assign({}, this.form, { id: this.currentId }) : this.form
      this.$refs.form.validate(async (valid) => {
        if (valid) {
          await api(params)
          this.$message({ message: `${this.isEdit ? '编辑' : '新增'}用户成功`, type: 'success' })
          this.fetchData()
          this.dialogVisible = false
        } else {
          return false
        }
      })
    },
    fetchData() {
      this.listLoading = true
      getUserList(this.params).then(response => {
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

  .el-table {
    margin-top: 30px;

    .el-table tr {
      background-color: #E8E8E8 !important;
    }

    .el-button--text {
      color: #489F93;
    }
  }

  .el-pagination {
    display: flex;
    justify-content: flex-end;
    margin-top: 10px;
  }

  .dialog-box {
    width: 90%;

    div {
      margin-top: 5px;
    }

    .el-input {
      width: 60%;
    }

    span {
      width: 50px;
      display: inline-block;
      margin-right: 20px;
    }

  }

  .dialog-footer {
    .cancel-btn {
      color: #489F93;
      border-color: #489F93;
    }

    .sure-btn {
      background-color: #489F93;
      color: #FFFFFF;
    }
  }
</style>
