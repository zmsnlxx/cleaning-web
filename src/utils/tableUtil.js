import _ from 'lodash'
export default class ExcelTable {
  constructor (header, data, name, worksheet,desc) {
    this.header = header
    this.data = data
    this.name = name
    this.worksheet = worksheet
    this.maxDeep = this.deepCount(header)
    this.flatHeader = []
    this.describe = desc
  }

  setToExcel () {
    if (!Array.isArray(this.header)) throw Error('header对象必须为数组')
    this.header.forEach(col => this.setChildsCount(col))
    this.setHeader(this.header)
    this.header.forEach(col => this.flatHeader.push(...col.flatChilds))

    this.setName(_.size(this.header))
    this.setData(this.data, this.header)
    this.worksheet.views = [
      {state: 'frozen', xSplit: this.header.filter(col => col.fixed).length, ySplit: this.maxDeep}
    ]
    this.worksheet.eachRow(row => {
      row.height = 18
      row.eachCell(cell => {
        cell.alignment = cell.alignment || this.defaultAlignment
        cell.border = this.defaultBorder
      })
    })
    if(this.describe){
      this.setDescribe(this.describe)
    }
  }

  setName (headerSize) {
    const cell = this.worksheet.getCell('A1')
    cell.value = this.name
    cell.font = {name: '宋体',size: 15, bold: true}
    this.worksheet.mergeCells(`A1:${ExcelTable.convertIndex(this.flatHeader.length - 1)}1`)
    this.worksheet.getRow(1).height = 18
    cell.alignment = headerSize > 25 ? {vertical: 'middle', horizontal: 'left'} : {
      vertical: 'middle',
      horizontal: 'center'
    }
  }

  setData (data) {
    this.flatHeader.forEach(col => {
      data.forEach((row, index) => {
        const cell = this.worksheet.getCell(`${col.cPos}${index + this.maxDeep + 1}`)
        const val = row[col.prop]
        cell.font = {name: '宋体', size: 12}
        const realVal = _.isObject(val) ? _.get(val, 'value') : val
        if(realVal === '--') return  cell.value = realVal
        if (col.formatter && col.formatter === 'percentage' && typeof realVal === 'number') {
          const temp = realVal.toString().split('.')
          if (temp.length <= 1) {
            cell.numFmt = '0%'
          }
          if (temp.length > 1) {
            const {length} = temp[1]
            switch (length) {
              case 0:
                cell.numFmt = '0%'
                break
              case 1:
                cell.numFmt = '0.0%'
                break
              default:
                cell.numFmt = '0.00%'
                break
            }
          }

        }
        if (val && val.style) {
          if (val.style.color) cell.font.color = {argb: val.style.color.split('#')[1]}
          if (val.style.background) cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: {argb: `ff${val.style.background.slice(1)}`}
          }
        }
        if (!val) return cell.value = val === 0 ? 0 : ''
        if (typeof val === 'object' && !val.value) return cell.value = val.value === 0 ? 0 : ''
        cell.value = ExcelTable.dataFormatter(realVal, col.formatter)
      })
    })
  }

  setHeader (header) {
    const recursion = (cols, curDeep = 1, colBase = 0) => {
      let baseIndex = colBase
      cols.forEach((col, index) => {
        const rIndex = curDeep + 1

        let cIndex
        const preCol = cols[index - 1]
        if (preCol && preCol.childs) {
          baseIndex = baseIndex + preCol.colCount - 1
          cIndex = baseIndex
        } else {
          cIndex = baseIndex
        }
        col.cPos = ExcelTable.convertIndex(cIndex)
        const position = `${col.cPos}${rIndex}`
        const cell = this.worksheet.getCell(position)
        cell.value = col.label
        cell.font = {name: '宋体', size: 12}
        const curColumn = this.worksheet.getColumn(col.cPos)
        if (curDeep === 1 && (col.width || col.minWidth)) curColumn.width = (col.width || col.minWidth) / 7
        else if (col.label) curColumn.width = (col.label.length < 3 ? 3 : col.label.length) * 3.2

        if (!col.childs) {
          if (curDeep !== this.maxDeep) this.worksheet.mergeCells(`${position}:${col.cPos}${this.maxDeep}`)
        } else {
          this.worksheet.mergeCells(`${position}:${ExcelTable.convertIndex(cIndex + col.colCount - 1)}${curDeep + 1}`)
          recursion(col.childs, curDeep + 1, colBase = cIndex)
        }
        baseIndex = baseIndex + 1
      })
    }
    recursion(header)
  }

  setChildsCount (column) {
    const recursion = col => {
      if (col.childs) {
        col.colCount = 0
        col.childs.forEach(child => {
          recursion(child)
          col.colCount += child.colCount
          if (col.flatChilds) col.flatChilds.push(...child.flatChilds)
          else col.flatChilds = [...child.flatChilds]
        })
      } else {
        col.colCount = 1
        col.flatChilds = [col]
      }
    }
    recursion(column)
    return column
  }

  setDescribe(desc){
    const firstSheet = this.worksheet
    firstSheet.mergeCells(`A${firstSheet.rowCount+2}`, `${ExcelTable.convertIndex(firstSheet.actualColumnCount-1)}${firstSheet.rowCount+5}`);
    firstSheet.getCell(`A${firstSheet.rowCount}`).value = desc
    firstSheet.getCell(`A${firstSheet.rowCount}`).alignment = { wrapText: true }
    firstSheet.getCell(`A${firstSheet.rowCount}`).font = {name: '宋体', size: 12}
  }

  deepCount (header) {
    let deep = 1
    const recursion = (cols, curDeep = 2) => {
      if (cols) {
        if (curDeep > deep) deep = curDeep
        cols.forEach(col => recursion(col.childs, curDeep + 1))
      }
    }
    recursion(header)
    return deep
  }

  static convertIndex (index) {
    let s = '', m = 0
    while (index >= 0) {
      m = index % 26 + 1
      s = String.fromCharCode(m + 64) + s
      index = (index - m) / 26
    }
    return s
  }

  static dataFormatter (value, formatter) {
    if (formatter) {
      if (typeof formatter === 'function') return formatter(value)
      if(typeof formatter === 'number') return parseFloat(value)
      if (typeof formatter === 'string') {
        if (formatter === 'percentage') {
          if (typeof value === 'number') return value / 100
          return value
        }
      }
    }
    return value
  }

  defaultBorder = {
    top: {style: 'thin'},
    left: {style: 'thin'},
    bottom: {style: 'thin'},
    right: {style: 'thin'},
  }

  defaultAlignment = {
    vertical: 'middle',
    horizontal: 'center',
  }
}
