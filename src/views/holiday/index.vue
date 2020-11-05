<template>
  <div class="app-container">
    <div class="search-box">
      <el-form class="left" :model="params" label-width="50px">
        <el-form-item label="姓名">
          <el-input v-model="params.pername" clearable placeholder="请输入" />
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="params.type" placeholder="请选择">
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
      <el-table-column label="姓名">
        <template slot-scope="scope">
          {{ scope.row.pername }}
        </template>
      </el-table-column>
      <el-table-column label="类型" align="center">
        <template slot-scope="scope">
          <span>{{ options.find(item => item.value === scope.row.type).label }}</span>
        </template>
      </el-table-column>
      <el-table-column label="请假时间" align="center" width="300">
        <template slot-scope="scope">
          {{ scope.row.startDay }}{{ scope.row.startHour }} - {{ scope.row.endDay }}{{ scope.row.endHour }}
        </template>
      </el-table-column>
      <el-table-column label="请假原因" align="center">
        <template slot-scope="scope">
          {{ scope.row.remark }}
        </template>
      </el-table-column>
      <el-table-column label="驳回说明" align="center">
        <template slot-scope="scope">
          {{ scope.row.reason }}
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center">
        <template slot-scope="scope">
          {{ approval[scope.row.approval] }}
        </template>
      </el-table-column>
      <el-table-column
        fixed="right"
        label="操作"
      >
        <template v-if="scope.row.approval === 1" slot-scope="scope">
          <el-button type="text" size="small" @click="pass('2', scope.row.leaveId)">通过</el-button>
          <el-button type="text" size="small" @click="dialogVisible = true; leaveId = scope.row.leaveId">拒绝</el-button>
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

    <el-dialog title="拒绝请假" :visible.sync="dialogVisible">
      <div style="padding: 0 24px">
        <p style="color: #000000">拒绝理由</p>
        <el-input v-model="form.reason" type="textarea" autocomplete="off" placeholder="请输入" />
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false" class="plain-btn">取 消</el-button>
        <el-button type="primary" @click="pass('3', leaveId, form.reason)" class="btn">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getLeaveList, updateLeave } from '@/api/holiday'
import { mapGetters } from 'vuex'

export default {
  data() {
    return {
      approval: ['撤回', '申请中', '通过', '拒绝'],
      form: { reason: '' },
      leaveId: '',
      options: [
        { label: '事假', value: 1 },
        { label: '年假', value: 2 },
      ],
      dialogVisible: false,
      total: 0,
      params: {
        page: 1,
        pageSize: 10,
        pername: '',
        type: '',
      },
      list: [],
      listLoading: true,
    }
  },
  mounted() {
    this.fetchData()
  },
  computed: {
    ...mapGetters(['orgId'])
  },
  watch: {
    orgId: {
      handler(val) {
        if (val) {
          this.fetchData()
        }
      }
    }
  },
  methods: {
    pass(approval, leaveId, reason = '') {
      updateLeave({ leaveId, approval, reason }).then(() => {
        this.$message({ message: '操作成功', type: 'success' })
        this.dialogVisible = false
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
      getLeaveList(this.params).then(response => {
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
