<template>
  <div class="app-container">
    <div class="search-box">
      <el-form class="left" :model="params" label-width="80px">
        <el-form-item label="姓名">
          <el-input v-model="params.pername" clearable placeholder="请输入" />
        </el-form-item>
        <el-form-item label="打卡日期">
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
        <el-button round plain type="primary" @click="inquire">查询</el-button>
      </el-form>
      <el-button round class="right" type="primary" @click="download">导出Excel</el-button>
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
      <el-table-column label="第一次打卡时间" align="center">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.signStartTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="第二次打卡时间" align="center">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.signEndTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="地址" align="center">
        <template slot-scope="scope">
          {{ scope.row.oreaddress }}
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
  </div>
</template>

<script>
import { getSignList } from '@/api/sign'
import { mapGetters } from 'vuex'
import {saveAs} from 'file-saver'
import ExcelTable from '@/utils/tableUtil'
import { parseTime } from '@/utils'
import Excel from 'exceljs'

export default {
  data() {
    return {
      parseTime,
      total: 0,
      params: {
        page: 1,
        pageSize: 10,
        startTime: '',
        endTime: '',
        pername: '',
      },
      startTime: '',
      endTime: '',
      list: [],
      listLoading: true,
      endDayText: '',
      startDayText: ''
    }
  },
  async created() {
    this.fetchData()
    // this.Excel = await import(/* webpackChunkName: "exceljs" */'exceljs')
  },
  computed: {
    ...mapGetters(['orgId', 'org']),
    orgName() {
      return this.org.find(item => item.orgid === this.orgId).orgname
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
          this.startDayText = d.getMonth() + 1 + '月' + d.getDate() + '日'
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
          this.endDayText = d.getMonth() + 1 + '月' + d.getDate() + '日'
        } else {
          this.params.endTime = ''
        }
      }
    }
  },

  methods: {
    async download() {
      this.listLoading = true
      const { pername, startTime, endTime } = this.params
      const params = { pername, startTime, endTime, page: 1, pageSize: this.total }
      const { data: { list } } = await getSignList(params)
      const header = [
        { label: '姓名', width: '120', prop: 'pername' },
        { label: '第一次打卡时间', width: '300', prop: 'signStartTime' },
        { label: '第二次打卡时间', width: '300', prop: 'signEndTime' },
        { label: '地址', width: '400', prop: 'oreaddress' },
      ]
      const data = list.map(item => ({ oreaddress: item.oreaddress, pername: item.pername, signStartTime: this.parseTime(item.signStartTime), signEndTime: this.parseTime(item.signEndTime) }))
      await this.makeExcel([{ header, data }], `${this.startDayText}-${this.endDayText}签到记录`)
      this.$message.success('下载成功！')
      this.listLoading = false
    },
    async makeExcel(downloadData, name) {
      const wb = new Excel.Workbook()
      this.$lo.each(downloadData, sheet => {
        const ws = wb.addWorksheet(sheet.name)
        const table = new ExcelTable(this.$lo.cloneDeep(sheet.header), sheet.data, sheet.title || name, ws, sheet.desc)
        table.setToExcel()
      })


      const buffer = await wb.xlsx.writeBuffer()

      saveAs(new Blob([buffer], {type: "application/octet-stream"}), `${name}.xlsx`)
    },
    fetchData() {
      this.listLoading = true
      getSignList(this.params).then(response => {
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
