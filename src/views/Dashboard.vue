<template>
  <div class="dashboard-container">
    <a-spin :spinning="loading" tip="数据加载中...">
      
      <!-- 顶部统计 KPI -->
      <a-row :gutter="[24, 24]">
        <a-col :xs="24" :sm="12" :md="6" v-for="(stat, index) in kpiStats" :key="index">
          <a-card :bordered="false" class="kpi-card" :class="`kpi-${stat.type}`">
            <div class="kpi-icon-wrapper">
              <component :is="stat.icon" class="kpi-icon" />
            </div>
            <div class="kpi-content">
              <div class="kpi-label">{{ stat.label }}</div>
              <div class="kpi-value">
                 <span v-if="stat.prefix" class="unit">{{ stat.prefix }}</span>
                 {{ stat.value }}
                 <span v-if="stat.suffix" class="unit">{{ stat.suffix }}</span>
              </div>
              <div class="kpi-trend">
                <span :class="stat.trend >= 0 ? 'up' : 'down'">
                  <CaretUpOutlined v-if="stat.trend >= 0" />
                  <CaretDownOutlined v-else />
                  {{ Math.abs(stat.trend) }}%
                </span>
                <span class="trend-text">较上月</span>
              </div>
            </div>
          </a-card>
        </a-col>
      </a-row>

      <!-- 主图表区域 -->
      <a-row :gutter="24" style="margin-top: 24px">
        <!-- 左侧：大趋势图 -->
        <a-col :xs="24" :lg="16">
          <a-card :bordered="false" title="收入与交易趋势" class="chart-card high-card">
            <template #extra>
               <a-radio-group v-model:value="trendRange" size="small">
                 <a-radio-button value="week">本周</a-radio-button>
                 <a-radio-button value="month">本月</a-radio-button>
                 <a-radio-button value="year">全年</a-radio-button>
               </a-radio-group>
            </template>
            <div ref="trendChartRef" class="chart-container" style="height: 420px;"></div>
          </a-card>
        </a-col>

        <!-- 右侧：双图表垂直排列 -->
        <a-col :xs="24" :lg="8" class="right-column">
           <a-row :gutter="[0, 24]" style="height: 100%">
             <a-col :span="24">
                <a-card :bordered="false" title="KPI 达成率" class="chart-card">
                   <div ref="progressChartRef" class="chart-container" style="height: 160px; display: flex; align-items: center; justify-content: center;"></div>
                </a-card>
             </a-col>
             
             <a-col :span="24">
               <a-card :bordered="false" title="客户来源" class="chart-card">
                  <div ref="columnChartRef" class="chart-container" style="height: 160px;"></div>
               </a-card>
             </a-col>
           </a-row>
        </a-col>
      </a-row>
      
      <!-- 底部：宽列表 -->
      <a-row :gutter="24" style="margin-top: 24px">
          <a-col :span="24">
             <a-card :bordered="false" title="最近活跃交易" class="list-card">
                 <a-table 
                    :dataSource="recentDeals" 
                    :columns="dealColumns" 
                    :pagination="false" 
                    size="small"
                    rowKey="id"
                 >
                    <template #bodyCell="{ column, record }">
                        <template v-if="column.key === 'stage'">
                             <a-tag :color="getStageColor(record.stage)">
                                <component :is="getStageIcon(record.stage)" /> {{ record.stage }}
                             </a-tag>
                        </template>
                        <template v-else-if="column.key === 'amount'">
                            <span class="deal-value">${{ record.amount.toLocaleString() }}</span>
                        </template>
                        <template v-else-if="column.key === 'createdAt'">
                             {{ dayjs(record.createdAt).format('YYYY-MM-DD HH:mm') }}
                        </template>
                    </template>
                 </a-table>
             </a-card>
          </a-col>
      </a-row>

    </a-spin>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Area, Column, RingProgress } from '@antv/g2plot'
import { dealApi, type Deal } from '../api/deal'
import dayjs from 'dayjs'
import { 
  DollarOutlined, 
  FileTextOutlined, 
  UserAddOutlined, 
  TrophyOutlined, 
  CaretUpOutlined,
  CaretDownOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  CloseCircleOutlined
} from '@ant-design/icons-vue'

const loading = ref(false)
const trendRange = ref('year')
const recentDeals = ref<Deal[]>([])
const trendChartRef = ref<HTMLElement>()
const progressChartRef = ref<HTMLElement>()
const columnChartRef = ref<HTMLElement>()

const dealColumns = [
  { title: '交易名称', dataIndex: 'title', key: 'title' },
  { title: '预计金额', dataIndex: 'amount', key: 'amount' },
  { title: '包含客户', dataIndex: 'customerName', key: 'customerName' },
  { title: '当前阶段', dataIndex: 'stage', key: 'stage' },
  { title: '更新时间', dataIndex: 'createdAt', key: 'createdAt' },
]

// KPI 数据模拟
const kpiStats = ref([
  { label: '总收入', value: '824,000', prefix: '$', trend: 12.5, type: 'primary', icon: DollarOutlined },
  { label: '活跃交易', value: '45', trend: 5.2, type: 'success', icon: FileTextOutlined },
  { label: '本月新增客户', value: '128', trend: -2.4, type: 'warning', icon: UserAddOutlined },
  { label: '赢单率', value: '68', suffix: '%', trend: 8.4, type: 'danger', icon: TrophyOutlined },
])

let trendChart: Area | null = null
let gaugeChart: RingProgress | null = null
let columnChart: Column | null = null

// 初始化 AntV 图表
const initCharts = () => {
    // 1. 面积图 - 销售趋势
    if (trendChartRef.value) {
        const data = [
            { Date: '2025-01', scales: 19000 },
            { Date: '2025-02', scales: 26000 },
            { Date: '2025-03', scales: 38000 },
            { Date: '2025-04', scales: 28000 },
            { Date: '2025-05', scales: 45000 },
            { Date: '2025-06', scales: 42000 },
            { Date: '2025-07', scales: 58000 },
            { Date: '2025-08', scales: 62000 },
        ];
        
        trendChart = new Area(trendChartRef.value, {
            data,
            xField: 'Date',
            yField: 'scales',
            xAxis: { range: [0, 1], tickCount: 5 },
            areaStyle: () => {
              return {
                fill: 'l(270) 0:#ffffff 0.5:#7ec2f3 1:#1890ff',
              };
            },
            smooth: true,
            color: '#1890ff',
            line: {
                color: '#1890ff',
                size: 2
            }
        });
        trendChart.render();
    }

    // 2. 环形进度条 - 达成率
    if (progressChartRef.value) {
         gaugeChart = new RingProgress(progressChartRef.value, {
            height: 200,
            autoFit: true,
            percent: 0.75,
            color: ['#1890ff', '#E8EDF3'],
            innerRadius: 0.8,
            radius: 0.98,
            statistic: {
                title: {
                    style: {
                        color: '#8c8c8c',
                        fontSize: '14px',
                        lineHeight: '20px',
                    },
                    formatter: () => '达成率',
                },
                content: {
                    style: {
                        fontSize: '32px',
                        color: '#1890ff',
                        fontWeight: 'bold',
                    },
                    formatter: (datum: any) => `${((datum?.percent || 0) * 100).toFixed(0)}%`,
                },
            },
        });
        gaugeChart.render();
    }

    // 3. 柱状图
    if (columnChartRef.value) {
        const data = [
          { type: '线上广告', sales: 38 },
          { type: '合作伙伴', sales: 52 },
          { type: '直接访问', sales: 61 },
          { type: '邮件营销', sales: 145 },
          { type: 'SEO', sales: 48 },
        ];
        
        columnChart = new Column(columnChartRef.value, {
            data,
            xField: 'type',
            yField: 'sales',
            label: {
                position: 'middle', 
                style: {
                    fill: '#FFFFFF',
                    opacity: 0.6,
                },
            },
            xAxis: {
                label: {
                    autoHide: true,
                    autoRotate: false,
                },
            },
            meta: {
                type: { alias: '渠道' },
                sales: { alias: '销售额' },
            },
        });
        columnChart.render();
    }
}

const loadData = async () => {
    loading.value = true;
    try {
        const res = await dealApi.getAll();
        if (res.success && Array.isArray(res.data)) {
            recentDeals.value = res.data.slice(0, 5);
        }
    } catch (error) {
        console.error(error)
    } finally {
        loading.value = false;
    }
}

const getStageIcon = (stage: string) => {
    switch (stage) {
        case 'WON': return CheckCircleOutlined;
        case 'LOST': return CloseCircleOutlined;
        default: return SyncOutlined;
    }
}

const getStageColor = (stage: string) => {
    switch (stage) {
        case 'WON': return '#52c41a';
        case 'LOST': return '#ff4d4f';
        default: return '#1890ff';
    }
}

onMounted(() => {
    // 稍微延迟渲染图表以确保 DOM 准备好
    setTimeout(() => {
       initCharts();
    }, 100)
    loadData();
})

onUnmounted(() => {
    trendChart?.destroy();
    gaugeChart?.destroy();
    columnChart?.destroy();
})

// 监听宽度变化重新渲染
window.addEventListener('resize', () => {
    // G2Plot 实例没有 forceFit 方法，它们通常会自动适应容器大小变化（如果设置了 autoFit: true）
    // 或者我们可以调用 changeSize
    trendChart?.changeSize(trendChartRef.value?.clientWidth || 500, 300);
    gaugeChart?.changeSize(progressChartRef.value?.clientWidth || 300, 200);
    columnChart?.changeSize(columnChartRef.value?.clientWidth || 500, 300);
})
</script>

<style scoped lang="scss">
.dashboard-container {
    /* 弱背景色提升质感 */
    .kpi-card {
        transition: all 0.3s;
        border-radius: 8px;
        overflow: hidden;
        position: relative;
        cursor: default;
        
        &:hover {
            transform: translateY(-4px);
            box-shadow: 0 10px 20px rgba(0,0,0,0.08);
        }

        &::after {
            content: '';
            position: absolute;
            top: 0;
            right: 0;
            width: 100px;
            height: 100px;
            background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%);
            border-radius: 0 0 0 100%;
        }

        // 不同类型的卡片配色
        &.kpi-primary { background: linear-gradient(135deg, #308ce7 0%, #1890ff 100%); }
        &.kpi-success { background: linear-gradient(135deg, #4dbd74 0%, #2eb85c 100%); }
        &.kpi-warning { background: linear-gradient(135deg, #f9b115 0%, #f9b115 100%); }
        &.kpi-danger { background: linear-gradient(135deg, #e55353 0%, #d93737 100%); }
        
        .kpi-content {
           color: #fff; 
           position: relative;
           z-index: 1;
        }

        .kpi-label {
            font-size: 14px;
            opacity: 0.9;
            margin-bottom: 8px;
        }

        .kpi-value {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 8px;
            .unit { font-size: 16px; margin: 0 4px; font-weight: normal; }
        }

        .kpi-trend {
            font-size: 13px;
            display: flex;
            align-items: center;
            gap: 4px;

            .up { color: #dff0d8; } 
            .down { color: #f2dede; } // 在深色背景下需要反转一下颜色逻辑，或者统一用白色带透明度
            
            span {
                 background: rgba(0,0,0,0.1);
                 padding: 2px 6px;
                 border-radius: 10px;
            }
            .trend-text {
                background: none;
                opacity: 0.8;
            }
        }
        
        .kpi-icon-wrapper {
            position: absolute;
            right: 16px;
            top: 16px;
            opacity: 0.2;
            .kpi-icon {
                font-size: 48px;
                color: #fff;
            }
        }
    }

    .chart-card {
        border-radius: 8px;
        box-shadow: 0 1px 2px -2px rgba(0, 0, 0, 0.16), 0 3px 6px 0 rgba(0, 0, 0, 0.12);
        
        :deep(.ant-card-head) {
            border-bottom: 1px solid #f0f0f0;
        }
    }
    
    .chart-container {
        height: 300px;
    }
    
    .list-card {
        height: 100%;
    }
    
    .deal-value {
        font-weight: 600;
        color: #1890ff;
    }
    
    .text-center { text-align: center; }
    .text-ellipsis {
        display: inline-block;
        max-width: 150px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        vertical-align: bottom;
    }
}
</style>
