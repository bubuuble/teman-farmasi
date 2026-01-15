// lib/analytics.ts
// Analytics data fetching utilities for Web Performance dashboard

// Types for analytics data
export interface AnalyticsStats {
  totalVisitors: number
  pageViews: number
  avgSessionDuration: string
  bounceRate: string
  visitorsChange: string
  pageViewsChange: string
  sessionChange: string
  bounceChange: string
}

export interface TrafficSource {
  source: string
  visits: number
  percentage: number
  color: string
}

export interface TopPage {
  path: string
  views: number
  avgTime: string
}

export interface DeviceStat {
  device: string
  percentage: number
  icon: 'smartphone' | 'monitor' | 'tablet'
}

export interface AnalyticsData {
  stats: AnalyticsStats
  trafficSources: TrafficSource[]
  topPages: TopPage[]
  deviceStats: DeviceStat[]
}

// Sample/fallback data when APIs are not configured
export const sampleAnalyticsData: AnalyticsData = {
  stats: {
    totalVisitors: 12847,
    pageViews: 45632,
    avgSessionDuration: '2m 34s',
    bounceRate: '42.5%',
    visitorsChange: '+12.5%',
    pageViewsChange: '+8.3%',
    sessionChange: '+5.2%',
    bounceChange: '-3.1%'
  },
  trafficSources: [
    { source: 'Direct', visits: 5234, percentage: 40, color: 'bg-brand-blue' },
    { source: 'Google Search', visits: 3821, percentage: 30, color: 'bg-brand-pink' },
    { source: 'Social Media', visits: 2563, percentage: 20, color: 'bg-brand-yellow' },
    { source: 'Referral', visits: 1229, percentage: 10, color: 'bg-brand-teal' },
  ],
  topPages: [
    { path: '/', views: 12453, avgTime: '1m 45s' },
    { path: '/programs', views: 8234, avgTime: '3m 12s' },
    { path: '/mentors', views: 6521, avgTime: '2m 08s' },
    { path: '/blog', views: 5432, avgTime: '4m 23s' },
    { path: '/contact', views: 3210, avgTime: '1m 15s' },
  ],
  deviceStats: [
    { device: 'Mobile', percentage: 58, icon: 'smartphone' },
    { device: 'Desktop', percentage: 35, icon: 'monitor' },
    { device: 'Tablet', percentage: 7, icon: 'tablet' },
  ]
}

// Fetch Google Analytics data using GA4 Data API
export async function fetchGoogleAnalyticsData(dateRange: string = '7d'): Promise<AnalyticsData | null> {
  const propertyId = process.env.GA4_PROPERTY_ID
  const credentials = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON

  if (!propertyId || !credentials) {
    console.log('Google Analytics not configured. Using sample data.')
    return null
  }

  try {
    // Parse credentials - handle potential JSON parsing issues
    let parsedCredentials
    try {
      parsedCredentials = JSON.parse(credentials)
    } catch (parseError) {
      console.error('Failed to parse Google credentials JSON. Make sure the JSON is valid and properly escaped.')
      return null
    }

    const { BetaAnalyticsDataClient } = await import('@google-analytics/data')
    
    const analyticsDataClient = new BetaAnalyticsDataClient({
      credentials: parsedCredentials
    })

    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()
    
    switch (dateRange) {
      case '30d':
        startDate.setDate(startDate.getDate() - 30)
        break
      case '90d':
        startDate.setDate(startDate.getDate() - 90)
        break
      case '1y':
        startDate.setFullYear(startDate.getFullYear() - 1)
        break
      default: // 7d
        startDate.setDate(startDate.getDate() - 7)
    }

    const formatDate = (date: Date) => date.toISOString().split('T')[0]

    // Fetch main metrics
    const [metricsResponse] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: formatDate(startDate), endDate: formatDate(endDate) }],
      metrics: [
        { name: 'activeUsers' },
        { name: 'screenPageViews' },
        { name: 'averageSessionDuration' },
        { name: 'bounceRate' }
      ],
    })

    // Fetch top pages
    const [pagesResponse] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: formatDate(startDate), endDate: formatDate(endDate) }],
      dimensions: [{ name: 'pagePath' }],
      metrics: [
        { name: 'screenPageViews' },
        { name: 'averageSessionDuration' }
      ],
      limit: 5,
      orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }]
    })

    // Fetch traffic sources
    const [sourcesResponse] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: formatDate(startDate), endDate: formatDate(endDate) }],
      dimensions: [{ name: 'sessionSource' }],
      metrics: [{ name: 'sessions' }],
      limit: 4,
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }]
    })

    // Fetch device categories
    const [devicesResponse] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: formatDate(startDate), endDate: formatDate(endDate) }],
      dimensions: [{ name: 'deviceCategory' }],
      metrics: [{ name: 'activeUsers' }],
    })

    // Process metrics
    const metricsRow = metricsResponse.rows?.[0]
    const totalVisitors = parseInt(metricsRow?.metricValues?.[0]?.value || '0')
    const pageViews = parseInt(metricsRow?.metricValues?.[1]?.value || '0')
    const avgSessionSeconds = parseFloat(metricsRow?.metricValues?.[2]?.value || '0')
    const bounceRate = parseFloat(metricsRow?.metricValues?.[3]?.value || '0')

    // Format session duration
    const minutes = Math.floor(avgSessionSeconds / 60)
    const seconds = Math.floor(avgSessionSeconds % 60)
    const avgSessionDuration = `${minutes}m ${seconds}s`

    // Process top pages
    const topPages: TopPage[] = pagesResponse.rows?.map(row => {
      const avgTime = parseFloat(row.metricValues?.[1]?.value || '0')
      const mins = Math.floor(avgTime / 60)
      const secs = Math.floor(avgTime % 60)
      return {
        path: row.dimensionValues?.[0]?.value || '/',
        views: parseInt(row.metricValues?.[0]?.value || '0'),
        avgTime: `${mins}m ${secs}s`
      }
    }) || []

    // Process traffic sources
    const colors = ['bg-brand-blue', 'bg-brand-pink', 'bg-brand-yellow', 'bg-brand-teal']
    const totalSessions = sourcesResponse.rows?.reduce((sum, row) => 
      sum + parseInt(row.metricValues?.[0]?.value || '0'), 0) || 1
    
    const trafficSources: TrafficSource[] = sourcesResponse.rows?.map((row, index) => {
      const visits = parseInt(row.metricValues?.[0]?.value || '0')
      return {
        source: row.dimensionValues?.[0]?.value || 'Direct',
        visits,
        percentage: Math.round((visits / totalSessions) * 100),
        color: colors[index % colors.length]
      }
    }) || []

    // Process devices
    const deviceMap: Record<string, 'smartphone' | 'monitor' | 'tablet'> = {
      mobile: 'smartphone',
      desktop: 'monitor',
      tablet: 'tablet'
    }
    const totalDeviceUsers = devicesResponse.rows?.reduce((sum, row) => 
      sum + parseInt(row.metricValues?.[0]?.value || '0'), 0) || 1

    const deviceStats: DeviceStat[] = devicesResponse.rows?.map(row => {
      const device = row.dimensionValues?.[0]?.value?.toLowerCase() || 'desktop'
      const users = parseInt(row.metricValues?.[0]?.value || '0')
      return {
        device: device.charAt(0).toUpperCase() + device.slice(1),
        percentage: Math.round((users / totalDeviceUsers) * 100),
        icon: deviceMap[device] || 'monitor'
      }
    }) || []

    return {
      stats: {
        totalVisitors,
        pageViews,
        avgSessionDuration,
        bounceRate: `${(bounceRate * 100).toFixed(1)}%`,
        visitorsChange: '-',
        pageViewsChange: '-',
        sessionChange: '-',
        bounceChange: '-'
      },
      trafficSources: trafficSources.length > 0 ? trafficSources : sampleAnalyticsData.trafficSources,
      topPages: topPages.length > 0 ? topPages : sampleAnalyticsData.topPages,
      deviceStats: deviceStats.length > 0 ? deviceStats : sampleAnalyticsData.deviceStats
    }

  } catch (error) {
    console.error('Error fetching Google Analytics data:', error)
    return null
  }
}

// Fetch Vercel Analytics data
export async function fetchVercelAnalyticsData(dateRange: string = '7d'): Promise<AnalyticsData | null> {
  const token = process.env.VERCEL_ACCESS_TOKEN
  const projectId = process.env.VERCEL_PROJECT_ID
  const teamId = process.env.VERCEL_TEAM_ID

  if (!token || !projectId) {
    console.log('Vercel Analytics not configured. Using sample data.')
    return null
  }

  try {
    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()
    
    switch (dateRange) {
      case '30d':
        startDate.setDate(startDate.getDate() - 30)
        break
      case '90d':
        startDate.setDate(startDate.getDate() - 90)
        break
      case '1y':
        startDate.setFullYear(startDate.getFullYear() - 1)
        break
      default: // 7d
        startDate.setDate(startDate.getDate() - 7)
    }

    const from = startDate.getTime()
    const to = endDate.getTime()

    // Fetch page views from Vercel Analytics API
    const baseUrl = 'https://vercel.com/api/web-analytics'
    const teamParam = teamId ? `&teamId=${teamId}` : ''

    const pageViewsRes = await fetch(
      `${baseUrl}/timeseries?projectId=${projectId}&from=${from}&to=${to}&environment=production${teamParam}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        next: { revalidate: 300 } // Cache for 5 minutes
      }
    )

    if (!pageViewsRes.ok) {
      // Vercel Analytics API might not be available or requires different setup
      console.log(`Vercel Analytics API returned ${pageViewsRes.status}. Make sure Vercel Analytics is enabled for this project.`)
      return null
    }

    const pageViewsData = await pageViewsRes.json()

    // Fetch top pages
    const topPagesRes = await fetch(
      `${baseUrl}/pages?projectId=${projectId}&from=${from}&to=${to}&environment=production&limit=5${teamParam}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        next: { revalidate: 300 }
      }
    )

    const topPagesData = topPagesRes.ok ? await topPagesRes.json() : null

    // Fetch referrers for traffic sources
    const referrersRes = await fetch(
      `${baseUrl}/referrers?projectId=${projectId}&from=${from}&to=${to}&environment=production&limit=10${teamParam}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        next: { revalidate: 300 }
      }
    )

    const referrersData = referrersRes.ok ? await referrersRes.json() : null

    // Fetch device data
    const devicesRes = await fetch(
      `${baseUrl}/devices?projectId=${projectId}&from=${from}&to=${to}&environment=production${teamParam}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        next: { revalidate: 300 }
      }
    )

    const devicesData = devicesRes.ok ? await devicesRes.json() : null

    // Process and format the data
    const totalPageViews = pageViewsData?.data?.reduce((sum: number, d: { pageViews: number }) => sum + d.pageViews, 0) || 0
    const totalVisitors = pageViewsData?.data?.reduce((sum: number, d: { visitors: number }) => sum + d.visitors, 0) || 0

    // Format traffic sources
    const trafficSources: TrafficSource[] = []
    const colors = ['bg-brand-blue', 'bg-brand-pink', 'bg-brand-yellow', 'bg-brand-teal']
    
    if (referrersData?.data) {
      const totalReferrals = referrersData.data.reduce((sum: number, r: { visitors: number }) => sum + r.visitors, 0)
      referrersData.data.slice(0, 4).forEach((ref: { referrer: string; visitors: number }, index: number) => {
        trafficSources.push({
          source: ref.referrer || 'Direct',
          visits: ref.visitors,
          percentage: Math.round((ref.visitors / totalReferrals) * 100),
          color: colors[index % colors.length]
        })
      })
    }

    // Format top pages
    const topPages: TopPage[] = topPagesData?.data?.slice(0, 5).map((page: { path: string; visitors: number }) => ({
      path: page.path,
      views: page.visitors,
      avgTime: '-' // Vercel Analytics doesn't provide this
    })) || []

    // Format device stats
    const deviceStats: DeviceStat[] = []
    if (devicesData?.data) {
      const deviceMap: Record<string, { device: string; icon: 'smartphone' | 'monitor' | 'tablet' }> = {
        mobile: { device: 'Mobile', icon: 'smartphone' },
        desktop: { device: 'Desktop', icon: 'monitor' },
        tablet: { device: 'Tablet', icon: 'tablet' }
      }
      
      const totalDevices = devicesData.data.reduce((sum: number, d: { visitors: number }) => sum + d.visitors, 0)
      devicesData.data.forEach((d: { device: string; visitors: number }) => {
        const mapped = deviceMap[d.device.toLowerCase()]
        if (mapped) {
          deviceStats.push({
            ...mapped,
            percentage: Math.round((d.visitors / totalDevices) * 100)
          })
        }
      })
    }

    return {
      stats: {
        totalVisitors,
        pageViews: totalPageViews,
        avgSessionDuration: '-',
        bounceRate: '-',
        visitorsChange: '-',
        pageViewsChange: '-',
        sessionChange: '-',
        bounceChange: '-'
      },
      trafficSources: trafficSources.length > 0 ? trafficSources : sampleAnalyticsData.trafficSources,
      topPages: topPages.length > 0 ? topPages : sampleAnalyticsData.topPages,
      deviceStats: deviceStats.length > 0 ? deviceStats : sampleAnalyticsData.deviceStats
    }

  } catch (error) {
    console.error('Error fetching Vercel Analytics data:', error)
    return null
  }
}

// Main function to get analytics data from available sources
export async function getAnalyticsData(dateRange: string = '7d'): Promise<AnalyticsData> {
  // Try Google Analytics first (more reliable for our setup)
  console.log('Attempting to fetch Google Analytics data...')
  const gaData = await fetchGoogleAnalyticsData(dateRange)
  if (gaData) {
    console.log('✅ Google Analytics data fetched successfully')
    return gaData
  }

  // Try Vercel Analytics as fallback
  console.log('Attempting to fetch Vercel Analytics data...')
  const vercelData = await fetchVercelAnalyticsData(dateRange)
  if (vercelData) {
    console.log('✅ Vercel Analytics data fetched successfully')
    return vercelData
  }

  // Fall back to sample data
  console.log('⚠️ Using sample data (no analytics configured)')
  return sampleAnalyticsData
}
