<template>
  <div class="app-container">
    <div class="search-box">
      <el-form class="left" :model="params" label-width="80px">
        <el-form-item label="商品名称">
          <el-input v-model="params.name" clearable />
        </el-form-item>
        <el-form-item label="姓名">
          <el-input v-model="params.pername" clearable />
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
      <el-table-column label="兑换人姓名">
        <template slot-scope="scope">
          {{ scope.row.pername }}
        </template>
      </el-table-column>
      <el-table-column label="商品名称" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="当前库存剩余" align="center" width="300">
        <template slot-scope="scope">
          {{ scope.row.stock }}
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center">
        <template slot-scope="scope">
          {{ exchangeStatus[scope.row.exchangeStatus] }}
        </template>
      </el-table-column>
      <el-table-column
        fixed="right"
        label="操作"
      >
        <template v-if="scope.row.exchangeStatus === 0" slot-scope="scope">
          <el-button type="text" size="small" @click="pass(scope.row.goodsExchangeId)">确认兑换</el-button>
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
  </div>
</template>

<script>
import { getIntegralList, updateIntegral } from '@/api/exchange'
import { mapGetters } from 'vuex'

export default {
  data() {
    return {
      exchangeStatus: ['未兑换', '已兑换'],
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
        name: '',
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
    pass(goodsExchangeId) {
      updateIntegral({ goodsExchangeId }).then(() => {
        this.$message({ message: '操作成功', type: 'success' })
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
      getIntegralList(this.params).then(response => {
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
