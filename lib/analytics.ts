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
    // Calculate date range
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

    // For production, you would use the Google Analytics Data API
    // This requires setting up a service account and the @google-analytics/data package
    // Example implementation:
    /*
    const { BetaAnalyticsDataClient } = await import('@google-analytics/data')
    
    const analyticsDataClient = new BetaAnalyticsDataClient({
      credentials: JSON.parse(credentials)
    })

    const [response] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: formatDate(startDate), endDate: formatDate(endDate) }],
      dimensions: [{ name: 'pagePath' }],
      metrics: [
        { name: 'activeUsers' },
        { name: 'screenPageViews' },
        { name: 'averageSessionDuration' },
        { name: 'bounceRate' }
      ],
    })

    // Process response and return formatted data
    */

    // For now, return null to use sample data
    // Once you set up the Google Analytics Data API, implement the actual fetching here
    return null

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
      throw new Error(`Vercel API error: ${pageViewsRes.status}`)
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
  // Try Vercel Analytics first
  const vercelData = await fetchVercelAnalyticsData(dateRange)
  if (vercelData) {
    return vercelData
  }

  // Try Google Analytics
  const gaData = await fetchGoogleAnalyticsData(dateRange)
  if (gaData) {
    return gaData
  }

  // Fall back to sample data
  return sampleAnalyticsData
}
