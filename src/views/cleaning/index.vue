<template>
  <div class="app-container">
    <div class="search-box">
      <el-form class="left" :model="params" label-width="50px">
        <el-form-item label="地址">
          <el-input v-model="params.cleaningPointName" clearable />
        </el-form-item>
        <el-button round plain type="primary" @click="inquire">查询</el-button>
      </el-form>
      <el-button round class="right" type="primary" @click="openDialog('1')">添加保洁点</el-button>
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
      <el-table-column label="楼层" align="center">
        <template slot-scope="scope">
          {{ scope.row.cleaningPointFloor }}
        </template>
      </el-table-column>
      <el-table-column label="保洁点" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.cleaningPointName }}</span>
        </template>
      </el-table-column>
      <el-table-column fixed="right" label="操作">
        <template slot-scope="scope">
          <el-button type="text" @click="getCleaningCode(scope.row.cleaningPointId, '1')">打印打点二维码</el-button>
          <el-button type="text" @click="getCleaningCode(scope.row.cleaningPointId, '2')">打印巡检二维码</el-button>
          <el-button type="text" @click="openDialog('2', scope.row)">修改</el-button>
          <el-button type="text" @click="deleteRow(scope.row.cleaningPointId)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :title="`${isEdit ? '编辑' : '添加'}保洁点`" :visible.sync="dialogVisible">
      <el-form :model="form" ref="form" :rules="rules">
        <el-form-item label="楼层" label-width="120px" prop="cleaningPointFloor">
          <el-input v-model="form.cleaningPointFloor" autocomplete="off" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="保洁点" label-width="120px" prop="cleaningPointName">
          <el-input v-model="form.cleaningPointName" autocomplete="off" placeholder="请输入" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false" class="plain-btn">取 消</el-button>
        <el-button type="primary" @click="update" class="btn">确 定</el-button>
      </div>
    </el-dialog>

    <div>
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

  </div>
</template>

<script>
import { getCleaningPointList, addCleaningPoint, updateCleaningPoint, delCleaningPoint, getCleaningQrcode, getInspectionQrcode } from '@/api/cleaningPoint'
import { mapGetters } from 'vuex'

export default {
  data() {
    return {
      dialogVisible: false,
      isEdit: false,
      rules: {
        cleaningPointFloor: [{ required: true, message: '楼层不能为空' }],
        cleaningPointName: [{ required: true, message: '保洁点不能为空' }],
      },
      total: 0,
      params: {
        page: 1,
        pageSize: 10,
        cleaningPointName: '',
      },
      list: [],
      listLoading: true,
      form: { cleaningPointFloor: '', cleaningPointName: '' },
      cleaningPointId: ''
    }
  },
  mounted() {
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
          Object.keys(this.form).forEach(key => {
            this.form[key] = ''
          })
        }
      }
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
    getCleaningCode(cleaningPointId, type) {
      const api = type === '1' ? getCleaningQrcode : getInspectionQrcode
      api({ cleaningPointId }).then(res => {
        let link = document.createElement("a");
        link.style.display = "none";

        link.target = "_Blank";
        link.href = res.data;
        link.setAttribute("download", 'name.png')
        link.click();
      })
    },
    deleteRow(cleaningPointId) {
      delCleaningPoint({ cleaningPointId }).then(() => {
        this.$message({ message: '删除保洁点成功', type: 'success' })
        this.fetchData()
      })
    },
    openDialog(type, row) {
      this.isEdit = type === '2'
      if (this.isEdit) {
        this.cleaningPointId = row.cleaningPointId
        Object.keys(this.form).forEach(key => {
          this.form[key] = row[key]
        })
      }
      this.dialogVisible = true
    },
    handleSizeChange(val) {
      this.params.pageSize = val
      this.fetchData()
    },
    handleCurrentChange(val) {
      this.params.page = val
      this.fetchData()
    },
    update() {
      const api = this.isEdit ? updateCleaningPoint : addCleaningPoint
      this.$refs.form.validate(async (valid) => {
        if (valid) {
          await api(this.isEdit ? _.assign({}, this.form, { cleaningPointId: this.cleaningPointId }) : this.form)
          this.$message({ message: `${this.isEdit ? '编辑' : '新增'}保洁点成功`, type: 'success' })
          this.fetchData()
          this.dialogVisible = false
        } else {
          return false
        }
      })
    },
    fetchData() {
      this.listLoading = false
      getCleaningPointList(this.params).then(response => {
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
