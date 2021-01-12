<template>
  <div class="app-container">
    <div class="search-box">
      <el-form class="left" :model="params" label-width="80px">
        <el-form-item label="组织名称">
          <el-input v-model="params.orgname" clearable />
        </el-form-item>
        <el-button round plain type="primary" @click="inquire">查询</el-button>
      </el-form>
      <el-button round class="right" type="primary" @click="dialogVisible = true">添加组织</el-button>
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
      <el-table-column label="组织名称">
        <template slot-scope="scope">
          {{ scope.row.orgname }}
        </template>
      </el-table-column>
      <el-table-column label="地址" align="center" width="200">
        <template slot-scope="scope">
          <span>{{ scope.row.oreaddress }}</span>
        </template>
      </el-table-column>
      <el-table-column label="楼层" align="center" width="200">
        <template slot-scope="scope">
          <span>{{ scope.row.floor }}</span>
        </template>
      </el-table-column>
      <el-table-column label="是否开启非工作人员扫码" align="center" width="200">
        <template slot-scope="scope">
          {{ scope.row.ispersonnel ? '是' : '否' }}
        </template>
      </el-table-column>
      <el-table-column label="是否开启签到上传照片" align="center" width="200">
        <template slot-scope="scope">
          {{ scope.row.isphoto ? '是' : '否' }}
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" width="100">
        <template slot-scope="scope">
          {{ scope.row.orgstatus ? '开启' : '禁用' }}
        </template>
      </el-table-column>
      <el-table-column
        fixed="right"
        label="操作"
      >
        <template slot-scope="scope">
          <el-button v-if="scope.row.orgstatus" type="text" size="small" @click="download">打印二维码</el-button>
          <el-button v-if="scope.row.orgstatus" type="text" size="small" @click="update(scope.row.orgid, 0)">禁用</el-button>
          <el-button v-if="!scope.row.orgstatus" type="text" size="small" @click="update(scope.row.orgid, 1)">启用</el-button>
          <el-button type="text" size="small" @click="edit(scope.row)">编辑</el-button>
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

    <el-dialog :title="`${this.isEdit ? '编辑' : '新增'}组织`" :visible.sync="dialogVisible">
      <el-form :model="form" ref="form" :rules="rules">
        <el-form-item label="组织名称" label-width="180px" prop="orgname">
          <el-input v-model="form.orgname" autocomplete="off" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="地址" label-width="180px" prop="oreaddress">
          <el-input v-model="form.oreaddress" autocomplete="off" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="楼层" label-width="180px" prop="floor">
          <el-input v-model="form.floor" autocomplete="off" placeholder="请输入楼层，多个楼层以,符号分割 例：一楼,三楼" />
        </el-form-item>
        <el-form-item label="是否开启非工作人员扫码" label-width="180px">
          <el-switch v-model="ispersonnel" />
        </el-form-item>
        <el-form-item label="是否开启签到上传照片" label-width="180px">
          <el-switch v-model="isphoto" />
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
import { appQrcode, closeOrg, getOrgList, addOrg, updateOrg } from '@/api/auth'
import { parseTime } from '@/utils'
import { mapGetters } from 'vuex'
import { addVideo, updateVideo } from '@/api/video'

export default {
  data() {
    return {
      dialogVisible: false,
      parseTime,
      rules: {
        orgname: [{ required: true, message: '组织名称不能为空' }],
        oreaddress: [{ required: true, message: '地址不能为空' }],
        floor: [{ required: true, message: '楼层不能为空' }],
      },
      total: 0,
      fileList: [],
      params: {
        page: 1,
        pageSize: 10,
        orgname: '',
      },
      uploadParams: { token: '', key: '' },
      list: [],
      listLoading: true,
      ispersonnel: true,
      isphoto: true,
      form: { orgname: '', oreaddress: '', ispersonnel: 1, isphoto: 1, floor: '' },
      isEdit: false,
      currentId: ''
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
          this.ispersonnel = true
          this.isphoto = true
          this.currentId = ''
          this.isEdit = false
          this.form = { orgname: '', oreaddress: '', ispersonnel: 1, isphoto: 1 }
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
    ispersonnel: {
      handler(val) {
        this.form.ispersonnel = val ? 1 : 0
      }
    },
    isphoto: {
      handler(val) {
        this.form.isphoto = val ? 1 : 0
      }
    }
  },
  mounted() {
    this.fetchData()
  },

  methods: {
    edit(row) {
      this.isEdit = true;
      const { orgid, ispersonnel, isphoto } = row
      this.currentId = orgid
      _.assign(this.form, _.pick(row, _.keys(this.form)))
      this.ispersonnel = ispersonnel === 1
      this.isphoto = isphoto === 1
      this.dialogVisible = true
    },
    download() {
      appQrcode().then(res => {
        let link = document.createElement("a");
        link.style.display = "none";

        link.target = "_Blank";
        link.href = res.data;
        link.setAttribute("download", 'name.png')
        link.click();
      })
    },
    update(orgId, orgStatus) {
      closeOrg({ orgId, orgStatus }).then(() => {
        this.$message({ message: `${orgStatus === '1' ? '开启' : '禁用'}成功`, type: 'success' })
        this.fetchData()
      })
    },
    add() {
      const api = this.isEdit ? updateOrg : addOrg
      const params = this.isEdit ? _.assign({}, this.form, { orgid: this.currentId }) : this.form
      api(params).then(() => {
        this.dialogVisible = false
        this.$message({ message: `${this.isEdit ? '编辑' : '新增'}组织成功`, type: 'success' })
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
    fetchData() {
      this.listLoading = true
      getOrgList(this.params).then(response => {
        this.list = response.data.list
        this.total = response.data.total
        this.listLoading = false
      })
    },
    inquire() {
      this.params.pageSize = 10
      this.params.page = 1
      this.fetchData()
    },

  },
}
</script>
