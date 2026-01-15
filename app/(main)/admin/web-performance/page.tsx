// app/(main)/admin/web-performance/page.tsx

import { 
  BarChart3, 
  Users, 
  Eye, 
  Clock, 
  TrendingUp, 
  Globe, 
  MousePointer2,
  ArrowUpRight,
  ArrowDownRight,
  Smartphone,
  Monitor,
  Tablet,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'
import { LucideIcon } from 'lucide-react'
import { getAnalyticsData, type DeviceStat } from '@/lib/analytics'

import Link from 'next/link'

interface StatCardProps {
  title: string
  value: string | number
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
  icon: LucideIcon
  color: string
}

function StatCard({ title, value, change, changeType = 'neutral', icon: Icon, color }: StatCardProps) {
  return (
    <div className="bg-white p-6 rounded-3xl shadow-card hover:shadow-soft transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color} text-white`}>
          <Icon className="w-6 h-6" />
        </div>
        {change && (
          <div className={`flex items-center gap-1 text-sm font-bold ${
            changeType === 'positive' ? 'text-green-500' : 
            changeType === 'negative' ? 'text-red-500' : 'text-gray-500'
          }`}>
            {changeType === 'positive' ? <ArrowUpRight className="w-4 h-4" /> : 
             changeType === 'negative' ? <ArrowDownRight className="w-4 h-4" /> : null}
            {change}
          </div>
        )}
      </div>
      <p className="text-brand-gray text-sm mb-1">{title}</p>
      <h3 className="font-heading font-bold text-2xl text-brand-dark">{value}</h3>
    </div>
  )
}

interface TrafficSourceProps {
  source: string
  visits: number
  percentage: number
  color: string
}

function TrafficSource({ source, visits, percentage, color }: TrafficSourceProps) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex-1">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-brand-dark">{source}</span>
          <span className="text-sm text-brand-gray">{visits.toLocaleString()}</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full ${color}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
      <span className="text-sm font-bold text-brand-dark w-12 text-right">{percentage}%</span>
    </div>
  )
}

interface TopPageProps {
  path: string
  views: number
  avgTime: string
}

function TopPage({ path, views, avgTime }: TopPageProps) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-brand-blue/10 flex items-center justify-center">
          <Globe className="w-4 h-4 text-brand-blue" />
        </div>
        <span className="text-sm font-medium text-brand-dark">{path}</span>
      </div>
      <div className="flex items-center gap-6">
        <span className="text-sm text-brand-gray">{views.toLocaleString()} views</span>
        <span className="text-sm text-brand-gray">{avgTime}</span>
      </div>
    </div>
  )
}

const deviceIconMap: Record<string, LucideIcon> = {
  smartphone: Smartphone,
  monitor: Monitor,
  tablet: Tablet,
}

function DeviceStatItem({ device, percentage, icon }: DeviceStat) {
  const Icon = deviceIconMap[icon] || Smartphone
  return (
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
        <Icon className="w-5 h-5 text-brand-dark" />
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-brand-dark">{device}</span>
          <span className="text-sm font-bold text-brand-dark">{percentage}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="h-full rounded-full bg-brand-blue"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  )
}

export default async function WebPerformancePage({
  searchParams
}: {
  searchParams: Promise<{ range?: string }>
}) {
  const params = await searchParams
  const dateRange = params.range || '7d'
  
  // Fetch real analytics data (falls back to sample if not configured)
  const analyticsData = await getAnalyticsData(dateRange)
  const { stats, trafficSources, topPages, deviceStats } = analyticsData

  // Check if analytics are configured
  const vercelConfigured = !!(process.env.VERCEL_ACCESS_TOKEN && process.env.VERCEL_PROJECT_ID)
  const gaConfigured = !!(process.env.GA4_PROPERTY_ID && process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-bold text-2xl text-brand-dark">Web Performance</h1>
          <p className="text-brand-gray text-sm mt-1">Monitor traffic dan performa website</p>
        </div>
        <div className="flex items-center gap-2">
          <Link 
            href="/admin/web-performance?range=7d"
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${dateRange === '7d' ? 'bg-brand-blue text-white' : 'bg-white border border-gray-200 text-brand-dark hover:bg-gray-50'}`}
          >
            7 Hari
          </Link>
          <Link 
            href="/admin/web-performance?range=30d"
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${dateRange === '30d' ? 'bg-brand-blue text-white' : 'bg-white border border-gray-200 text-brand-dark hover:bg-gray-50'}`}
          >
            30 Hari
          </Link>
          <Link 
            href="/admin/web-performance?range=90d"
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${dateRange === '90d' ? 'bg-brand-blue text-white' : 'bg-white border border-gray-200 text-brand-dark hover:bg-gray-50'}`}
          >
            90 Hari
          </Link>
          <Link 
            href="/admin/web-performance?range=1y"
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${dateRange === '1y' ? 'bg-brand-blue text-white' : 'bg-white border border-gray-200 text-brand-dark hover:bg-gray-50'}`}
          >
            1 Tahun
          </Link>
        </div>
      </div>

      {/* Integration Status */}
      <div className="flex flex-wrap gap-3">
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium ${vercelConfigured ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
          {vercelConfigured ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          Vercel Analytics {vercelConfigured ? 'Terhubung' : 'Tidak Terkonfigurasi'}
        </div>
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium ${gaConfigured ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
          {gaConfigured ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          Google Analytics {gaConfigured ? 'Terhubung' : 'Tidak Terkonfigurasi'}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Pengunjung" 
          value={stats.totalVisitors.toLocaleString()} 
          change={stats.visitorsChange !== '-' ? stats.visitorsChange : undefined}
          changeType={stats.visitorsChange.startsWith('+') ? 'positive' : stats.visitorsChange.startsWith('-') ? 'negative' : 'neutral'}
          icon={Users} 
          color="bg-brand-blue" 
        />
        <StatCard 
          title="Page Views" 
          value={stats.pageViews.toLocaleString()} 
          change={stats.pageViewsChange !== '-' ? stats.pageViewsChange : undefined}
          changeType={stats.pageViewsChange.startsWith('+') ? 'positive' : stats.pageViewsChange.startsWith('-') ? 'negative' : 'neutral'}
          icon={Eye} 
          color="bg-brand-pink" 
        />
        <StatCard 
          title="Avg. Session Duration" 
          value={stats.avgSessionDuration} 
          change={stats.sessionChange !== '-' ? stats.sessionChange : undefined}
          changeType={stats.sessionChange.startsWith('+') ? 'positive' : stats.sessionChange.startsWith('-') ? 'negative' : 'neutral'}
          icon={Clock} 
          color="bg-brand-teal" 
        />
        <StatCard 
          title="Bounce Rate" 
          value={stats.bounceRate} 
          change={stats.bounceChange !== '-' ? stats.bounceChange : undefined}
          changeType={stats.bounceChange.startsWith('-') ? 'positive' : stats.bounceChange.startsWith('+') ? 'negative' : 'neutral'}
          icon={MousePointer2} 
          color="bg-brand-dark" 
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Traffic Sources */}
        <div className="bg-white rounded-3xl p-6 shadow-card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-brand-blue/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-brand-blue" />
            </div>
            <h3 className="font-heading font-bold text-lg text-brand-dark">Traffic Sources</h3>
          </div>
          <div className="space-y-4">
            {trafficSources.map((source) => (
              <TrafficSource key={source.source} {...source} />
            ))}
          </div>
        </div>

        {/* Top Pages */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-brand-pink/10 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-brand-pink" />
            </div>
            <h3 className="font-heading font-bold text-lg text-brand-dark">Halaman Terpopuler</h3>
          </div>
          <div>
            {topPages.map((page) => (
              <TopPage key={page.path} {...page} />
            ))}
          </div>
        </div>
      </div>

      {/* Device & Browser Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Device Distribution */}
        <div className="bg-white rounded-3xl p-6 shadow-card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-brand-teal/10 flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-brand-teal" />
            </div>
            <h3 className="font-heading font-bold text-lg text-brand-dark">Distribusi Perangkat</h3>
          </div>
          <div className="space-y-4">
            {deviceStats.map((device) => (
              <DeviceStatItem key={device.device} {...device} />
            ))}
          </div>
        </div>

        {/* Integration Notice */}
        <div className="bg-gradient-to-br from-brand-darkblue to-brand-blue rounded-3xl p-8 shadow-card text-white">
          <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mb-6">
            <BarChart3 className="w-7 h-7 text-white" />
          </div>
          <h3 className="font-heading font-bold text-xl mb-3">Integrasi Analytics</h3>
          <p className="text-white/80 text-sm mb-6 leading-relaxed">
            Untuk data real-time yang lebih akurat, hubungkan website dengan layanan analytics seperti Google Analytics, Vercel Analytics, atau Plausible.
          </p>
          <div className="flex flex-wrap gap-3">
            <a 
              href="https://analytics.google.com" 
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-medium transition-colors"
            >
              Google Analytics
            </a>
            <a 
              href="https://vercel.com/analytics" 
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-medium transition-colors"
            >
              Vercel Analytics
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
