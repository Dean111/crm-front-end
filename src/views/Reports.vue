<template>
  <div class="reports-page">
    <div class="page-header">
      <div class="header-left">
        <h1>数据报表</h1>
        <p>洞察数据，驱动业务增长</p>
      </div>
      <div class="header-right">
        <a-radio-group v-model:value="timeRange" button-style="solid">
          <a-radio-button value="7days">最近7天</a-radio-button>
          <a-radio-button value="30days">最近30天</a-radio-button>
          <a-radio-button value="year">本年</a-radio-button>
        </a-radio-group>
      </div>
    </div>

    <a-spin :spinning="loading">
      <a-row :gutter="[24, 24]">
        <!-- 销售漏斗 -->
        <a-col :xs="24" :lg="12">
          <a-card title="销售漏斗" :bordered="false" class="chart-card">
            <div ref="funnelChartRef" class="chart-container"></div>
          </a-card>
        </a-col>

        <!-- 交易阶段占比 -->
        <a-col :xs="24" :lg="12">
          <a-card title="交易阶段分布" :bordered="false" class="chart-card">
            <div ref="pieChartRef" class="chart-container"></div>
          </a-card>
        </a-col>

        <!-- 销售趋势 -->
        <a-col :span="24">
          <a-card title="销售趋势分析" :bordered="false" class="chart-card">
            <div ref="lineChartRef" class="chart-container" style="height: 400px;"></div>
          </a-card>
        </a-col>

        <!-- 业绩排行 -->
        <a-col :span="24">
          <a-card title="团队业绩排行" :bordered="false" class="chart-card">
            <div ref="barChartRef" class="chart-container" style="height: 350px;"></div>
          </a-card>
        </a-col>
      </a-row>
    </a-spin>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as echarts from 'echarts'
// import { dealApi } from '../api/deal' // 暂未使用

const timeRange = ref('30days')
const loading = ref(false)

// Chart Refs
const funnelChartRef = ref<HTMLElement>()
const pieChartRef = ref<HTMLElement>()
const lineChartRef = ref<HTMLElement>()
const barChartRef = ref<HTMLElement>()

// Chart Instances
let funnelChart: echarts.ECharts | null = null
let pieChart: echarts.ECharts | null = null
let lineChart: echarts.ECharts | null = null
let barChart: echarts.ECharts | null = null

const initCharts = () => {
  if (funnelChartRef.value) funnelChart = echarts.init(funnelChartRef.value)
  if (pieChartRef.value) pieChart = echarts.init(pieChartRef.value)
  if (lineChartRef.value) lineChart = echarts.init(lineChartRef.value)
  if (barChartRef.value) barChart = echarts.init(barChartRef.value)
}

const renderCharts = (_data: any[]) => {
  // 1. 漏斗图数据处理
  const funnelData = [
    { value: 100, name: '资格审查' },   // QUALIFICATION
    { value: 80, name: '方案报价' },    // PROPOSAL
    { value: 60, name: '商务谈判' },    // NEGOTIATION
    { value: 40, name: '成交' }        // WON
  ]
  // 实际应该遍历 data 统计各阶段数量，这里用模拟数据增强展示效果
  
  funnelChart?.setOption({
    tooltip: { trigger: 'item', formatter: '{b} : {c}%' },
    series: [
      {
        name: 'Funnel',
        type: 'funnel',
        left: '10%',
        top: 60,
        bottom: 60,
        width: '80%',
        min: 0,
        max: 100,
        minSize: '0%',
        maxSize: '100%',
        sort: 'descending',
        gap: 2,
        label: { show: true, position: 'inside' },
        itemStyle: { borderColor: '#fff', borderWidth: 1 },
        emphasis: { label: { fontSize: 20 } },
        data: funnelData
      }
    ]
  })

  // 2. 饼图数据 (交易金额分布)
  const pieData = [
      { value: 1048, name: '资格审查' },
      { value: 735, name: '方案报价' },
      { value: 580, name: '商务谈判' },
      { value: 484, name: '成交' },
      { value: 300, name: '丢单' }
  ]
  
  pieChart?.setOption({
    tooltip: { trigger: 'item' },
    legend: { top: '5%', left: 'center' },
    series: [
      {
        name: 'Access From',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: { show: false, position: 'center' },
        emphasis: {
          label: { show: true, fontSize: 40, fontWeight: 'bold' }
        },
        labelLine: { show: false },
        data: pieData
      }
    ]
  })

  // 3. 折线图 (销售趋势)
  lineChart?.setOption({
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月']
    },
    yAxis: { type: 'value' },
    series: [
      {
        data: [15000, 23000, 22400, 21800, 35000, 47000, 56000],
        type: 'line',
        smooth: true,
        itemStyle: { color: '#1890ff' },
        areaStyle: {
             color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(24,144,255,0.5)' },
              { offset: 1, color: 'rgba(24,144,255,0.01)' }
            ])
        }
      }
    ]
  })
  
  // 4. 柱状图 (员工业绩)
  barChart?.setOption({
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: [
      {
        type: 'category',
        data: ['销售A', '销售B', '销售C', '销售D', '销售E'],
        axisTick: { alignWithLabel: true }
      }
    ],
    yAxis: [
      { type: 'value' }
    ],
    series: [
      {
        name: '业绩',
        type: 'bar',
        barWidth: '60%',
        data: [100000, 52000, 200000, 334000, 390000],
        itemStyle: {
             color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#83bff6' },
              { offset: 0.5, color: '#188df0' },
              { offset: 1, color: '#188df0' }
            ])
        }
      }
    ]
  })
}

const loadData = async () => {
    loading.value = true
    try {
        // 调用 API 获取真实数据
        // const res = await dealApi.getAll()
        // 这里只是演示，实际需要根据 res.data 解析出 chart data
        
        // 模拟延时
        setTimeout(() => {
             renderCharts([])
             loading.value = false
        }, 500)
    } catch (e) {
        console.error(e)
        loading.value = false
    }
}

// 响应式 Resize
const handleResize = () => {
  funnelChart?.resize()
  pieChart?.resize()
  lineChart?.resize()
  barChart?.resize()
}

onMounted(() => {
  initCharts()
  loadData()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  funnelChart?.dispose()
  pieChart?.dispose()
  lineChart?.dispose()
  barChart?.dispose()
})

watch(timeRange, () => {
    loadData()
})
</script>

<style scoped lang="scss">
.reports-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  h1 {
    font-size: 24px;
    font-weight: 500;
    margin: 0;
  }
  p {
    color: #8c8c8c;
    margin: 4px 0 0;
  }
}

.chart-card {
    height: 100%;
}

.chart-container {
    height: 300px;
    width: 100%;
}
</style>
