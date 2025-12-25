import { getPayload } from 'payload'
import config from '@payload-config'
import { Globals, Collections } from '@/lib/payload/constants'
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

async function getProjectHomepageConfig(projectId: number | string) {
  try {
    const payload = await getPayload({ config })
    const project = await payload.findByID({
      collection: Collections.Projects,
      id: typeof projectId === 'string' ? parseInt(projectId) : projectId,
    })
    return project?.homepageConfig || null
  } catch (error) {
    // Fallback: if project not found or error, return null (will use SiteConfig defaults)
    console.error('Failed to fetch project homepage config:', error)
    return null
  }
}

/**
 * Merge project homepage config with SiteConfig defaults
 * Project config overrides SiteConfig when present
 */
function mergeHomepageConfig(siteConfig: any, projectConfig: any) {
  if (!projectConfig) {
    return siteConfig
  }

  // Merge hero section
  const mergedHero = {
    ...siteConfig?.hero,
    ...(projectConfig.hero || {}),
    // Merge videos array if both exist
    videos: projectConfig.hero?.videos || siteConfig?.hero?.videos,
    // Merge background image
    backgroundImage: projectConfig.hero?.backgroundImage || siteConfig?.hero?.backgroundImage,
  }

  // Use project heroContent if available, otherwise use SiteConfig
  const heroContent = projectConfig.heroContent || siteConfig?.heroContent

  return {
    ...siteConfig,
    hero: mergedHero,
    heroContent,
  }
}

export default async function LandingPage() {
  const siteConfig = await getSiteConfig()
  
  // Check if activeProject is set
  let finalConfig = siteConfig
  if (siteConfig?.activeProject) {
    const projectId = typeof siteConfig.activeProject === 'object' 
      ? siteConfig.activeProject.id 
      : siteConfig.activeProject
    
    if (projectId) {
      try {
        const projectConfig = await getProjectHomepageConfig(projectId)
        // Merge project config with SiteConfig (project overrides SiteConfig)
        finalConfig = mergeHomepageConfig(siteConfig, projectConfig)
      } catch (error) {
        // Fallback: if project fetch fails, use SiteConfig defaults
        console.error('Failed to load project homepage config, using SiteConfig defaults:', error)
        // finalConfig already equals siteConfig, so no change needed
      }
    }
  }
  
  // Normalize payload types to component types (null -> undefined)
  const normalizedConfig = finalConfig ? {
    ...finalConfig,
    tagline: finalConfig.tagline ?? undefined,
  } as any : null

  // Extract activeProjectId for passing to HomepageContent
  const activeProjectId = siteConfig?.activeProject
    ? (typeof siteConfig.activeProject === 'object' 
        ? siteConfig.activeProject.id 
        : siteConfig.activeProject)
    : null

  return <HomepageContent siteConfig={normalizedConfig as any} activeProjectId={activeProjectId} />
}
