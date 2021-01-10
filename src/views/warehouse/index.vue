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
      <el-table-column label="名称">
        <template slot-scope="scope">
          {{ scope.row.name }}
        </template>
      </el-table-column>
      <el-table-column label="类型" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.typeName }}</span>
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
      <el-table-column label="数量" align="center">
        <template slot-scope="scope">
          {{ scope.row.stock }}
        </template>
      </el-table-column>
      <el-table-column fixed="right" label="操作">
        <template slot-scope="scope">
          <el-button type="text" size="small" @click="open(scope.row)">调增库存</el-button>
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

    <el-dialog title="调增库存" :visible.sync="dialogVisible" width="40%">
      <div class="box">
        <div class="item" v-for="(item, index) in labels" :key="index">
          <div class="label">{{ item.label }}</div>
          <div class="value">{{ row[item.key] }}</div>
        </div>
        <div class="num">
          <div class="name">库存数量</div>
          <el-input v-model="stock" clearable placeholder="请输入" />
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="updateNum">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { getWarehouseList, updateWarehouse } from '@/api/warehouse'
import { getSuppliesTypes } from '@/api/supplies'
import { mapGetters } from 'vuex'
import {saveAs} from 'file-saver'
import ExcelTable from '@/utils/tableUtil'
import Excel from 'exceljs'

export default {
  data() {
    const labels = [
      { label: '类型', key: 'typeName' },
      { label: '名称', key: 'name' },
      { label: '品牌', key: 'brand' },
      { label: '规格', key: 'spec' },
      { label: '单位', key: 'unit' },
      { label: '库存', key: 'stock' },
    ]
    return {
      types: [],
      stock: 0,
      labels,
      total: 0,
      params: {
        page: 1,
        pageSize: 10,
        type: '',
      },
      warehouseId: '',
      list: [],
      listLoading: true,
      dialogVisible: false,
      row: {},
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
          this.row = {}
          this.stock = 0
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
    updateNum() {
      updateWarehouse({ stock: Number(this.stock), warehouseId: this.warehouseId }).then(() => {
        this.$message.success('调整成功！')
        this.dialogVisible = false
        this.fetchData()
      })
    },
    open(row) {
      this.row = row
      this.warehouseId = row.warehouseId
      this.stock = row.stock
      this.dialogVisible = true
    },
    async download() {
      this.listLoading = true
      const params = { page: 1, pageSize: this.total, type: this.params.type }
      const { data: { list } } = await getWarehouseList(params)
      const header = [
        { label: '名称', width: '150', prop: 'name' },
        { label: '类型', width: '150', prop: 'typeName' },
        { label: '品牌', width: '150', prop: 'brand' },
        { label: '规格', width: '150', prop: 'spec' },
        { label: '单位', width: '150', prop: 'unit' },
        { label: '库存', width: '150', prop: 'stock' },
      ]
      const data = list.map(item => _.pick(item, ['name', 'typeName', 'brand', 'spec', 'unit', 'stock']))
      await this.makeExcel([{ header, data }], '库存汇总')
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
      getWarehouseList(this.params).then(response => {
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
.box {
  display: flex;
  width: 100%;
  flex-wrap: wrap;
  padding: 0 20px;

  .item {
    width: 50%;
    height: 22px;
    line-height: 22px;
    margin-bottom: 8px;
    display: flex;

    .label {
      color: #999999;
      width: 76px;
    }

    .value {
      color: #333333;
    }
  }

  .num {
    width: 50%;
    margin-top: 30px;
    display: flex;

    .name {
      color: #333333;
      width: 80px;
      line-height: 40px;
    }

    .el-input {
      width: calc(100% - 80px);
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
