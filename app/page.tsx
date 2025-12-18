import { getPayload } from 'payload'
import config from '@payload-config'
import { Globals } from '@/lib/payload/constants'
import { HomepageContent } from '@/components/homepage/HomepageContent'

export const dynamic = 'force-dynamic'

async function getSiteConfig() {
  try {
    const payload = await getPayload({ config })
    const siteConfig = await payload.findGlobal({
      slug: Globals.SiteConfig,
    })
    return siteConfig
  } catch (error) {
    console.error('Failed to fetch site config:', error)
    return null
  }
}

export default async function LandingPage() {
  const siteConfig = await getSiteConfig()

  return <HomepageContent siteConfig={siteConfig} />
}
