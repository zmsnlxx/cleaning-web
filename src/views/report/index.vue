<template>
  <div class="app-container">
    <div class="search-box">
      <el-form class="left" :model="params">
        <el-form-item label="姓名" label-width="50px">
          <el-input v-model="params.pername" clearable placeholder="请输入" />
        </el-form-item>
        <el-form-item label="开始日期" class="date" >
          <el-date-picker
            class="date-pick"
            v-model="startTime"
            type="date"
            placeholder="选择开始日期"
            format="yyyy 年 MM 月 dd 日"
            value-format="timestamp">
          </el-date-picker>
          -
          <el-date-picker
            v-model="endTime"
            type="date"
            placeholder="选择结束日期"
            format="yyyy 年 MM 月 dd 日"
            value-format="timestamp">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="类型" label-width="50px">
          <el-select v-model="params.type" clearable placeholder="请选择报表类型">
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
      <el-table-column label="提交人">
        <template slot-scope="scope">
          {{ scope.row.pername }}
        </template>
      </el-table-column>
      <el-table-column label="类型" align="center">
        <template slot-scope="scope">
          {{ scope.row.type === 1 ? '周报' : '月报' }}
        </template>
      </el-table-column>
      <el-table-column label="提交时间" align="center">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column
        fixed="right"
        label="操作"
      >
        <template slot-scope="scope">
          <el-button type="text" size="small" @click="getDetail(scope.row)">查看</el-button>
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

    <el-dialog title="周报/月报详情" :visible.sync="dialogVisible" width="50%">
      <div class="header">
        <div class="item">
          <div class="label">提交人</div>
          <div class="value">{{ row.pername }}</div>
        </div>
        <div class="item">
          <div class="label">类型</div>
          <div class="value">{{ row.type === 1 ? '周报' : '月报' }}</div>
        </div>
        <div class="item">
          <div class="label">提交时间</div>
          <div class="value">{{ parseTime(row.createTime) }}</div>
        </div>
      </div>
      <div class="content">
        <div class="item" v-for="(item, index) in row.content" :key="index">
          <div class="list">
            <div class="list-item" v-for="(i, id) in item.list" :key="id">
              <div class="title">本{{ text }}关键工作任务</div>
              <div class="value">{{ i.title }}</div>
              <div class="title">工作完成情况</div>
              <div class="value">{{ i.content }}</div>
            </div>
          </div>
          <div class="summary">
            <div class="title">{{ item.next ? '需协调工作' : `本${text}工作总结` }}</div>
            <div class="value">{{ item.summary }}</div>
          </div>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="dialogVisible = false">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { getReportList } from '@/api/report'
import { mapGetters } from 'vuex'
import { parseTime } from '@/utils'

export default {
  data() {
    return {
      options: [
        { value: 1, label: '周报' },
        { value: 2, label: '月报' },
      ],
      parseTime,
      total: 0,
      dialogVisible: false,
      row: {},
      params: {
        page: 1,
        pageSize: 10,
        startTime: '',
        endTime: '',
        pername: '',
        type: '',
      },
      startTime: '',
      endTime: '',
      list: [],
      listLoading: true,
      dayText: ''
    }
  },
  async created() {
    this.fetchData()
  },
  computed: {
    ...mapGetters(['orgId', 'org']),
    orgName() {
      return this.org.find(item => item.orgid === this.orgId).orgname
    },
    text() {
      return this.row.type === 1 ? '周' : '月'
    }
  },
  watch: {
    orgId: {
      handler(val) {
        if (val) {
          this.fetchData()
        }
      }
    },
    startTime: {
      handler(val) {
        if (val) {
          this.params.startTime = parseInt(val / 1000)
          const d = new Date(val)
          this.dayText = d.getMonth() + 1 + '月' + d.getDate() + '日'
        } else {
          this.params.startTime = ''
        }
      }
    },
    endTime: {
      handler(val) {
        if (val) {
          this.params.endTime = parseInt(val / 1000)
          const d = new Date(val)
          this.dayText = d.getMonth() + 1 + '月' + d.getDate() + '日'
        } else {
          this.params.endTime = ''
        }
      }
    }
  },

  methods: {
    getDetail(row) {
      console.log(row)
      this.dialogVisible = true
      this.row = row
    },
    fetchData() {
      this.listLoading = true
      getReportList(this.params).then(response => {
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
<style>
.today span{
  font-weight: 700;
  background: #489F93;
  color: white !important;
  border-radius: 50% 50%;
}
</style>
<style lang="scss" scoped>
.content {
  margin-top: 10px;
  .item {
    border-bottom: 1px solid #EFEFEF;

    .summary {
      padding: 16px 50px;
    }

    .list {
      border-bottom: 1px solid #EFEFEF;
      padding: 16px 50px;
    }

    .title {
      line-height: 30px;
      color: #999999;
    }

    .value {
      color: #000000;
      line-height: 20px;
      margin: 10px;
    }
  }
}
.header {
  padding: 0 50px 30px 50px;
  border-bottom: 1px solid #EFEFEF;

  .item {
    margin-bottom: 8px;
    font-size: 14px;
    display: flex;

    .label {
      color: #999999;
      min-width: 70px;
      margin-right: 20px;
    }

    .value {
      color: #000000;
    }
  }
}
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
    width: 100%;

    .date {
      min-width: 530px;
    }

    .query-btn {
      color: #489F93;
      border-color: #489F93;
      width: 80px;
      height: 40px;
    }
  }

}
.el-pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
}
</style>
