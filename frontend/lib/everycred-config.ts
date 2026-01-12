// EveryCRED Configuration
// Reads configuration from environment variables

export interface EveryCREDConfig {
  apiUrl: string
  apiToken: string
  issuerId: number | null
  groupId: number | null
  subjectId: number | null
  mockMode: boolean
}

/**
 * Get EveryCRED configuration from environment variables.
 * In Next.js, environment variables must be prefixed with NEXT_PUBLIC_ to be accessible in the browser.
 * 
 * @returns EveryCREDConfig object with all configuration values
 */
export function getEveryCREDConfig(): EveryCREDConfig {
  // In Next.js, client-side code can only access NEXT_PUBLIC_ prefixed env vars
  // Server-side code can access all env vars
  const isServer = typeof window === "undefined"
  
  const apiUrl = (isServer 
    ? process.env.EVERYCRED_API_URL 
    : process.env.NEXT_PUBLIC_EVERYCRED_API_URL) || 
    "https://stg-dcs-api.everycred.com/v1"
  
  const apiToken = (isServer 
    ? process.env.EVERYCRED_API_TOKEN 
    : process.env.NEXT_PUBLIC_EVERYCRED_API_TOKEN) || 
    ""
  
  const issuerIdStr = (isServer 
    ? process.env.EVERYCRED_ISSUER_ID 
    : process.env.NEXT_PUBLIC_EVERYCRED_ISSUER_ID) || 
    null
  const issuerId = issuerIdStr ? parseInt(issuerIdStr, 10) : null
  
  const groupIdStr = (isServer 
    ? process.env.EVERYCRED_GROUP_ID 
    : process.env.NEXT_PUBLIC_EVERYCRED_GROUP_ID) || 
    null
  const groupId = groupIdStr ? parseInt(groupIdStr, 10) : null
  
  const subjectIdStr = (isServer 
    ? process.env.EVERYCRED_SUBJECT_ID 
    : process.env.NEXT_PUBLIC_EVERYCRED_SUBJECT_ID) || 
    null
  const subjectId = subjectIdStr ? parseInt(subjectIdStr, 10) : null
  
  const mockModeStr = (isServer 
    ? process.env.EVERYCRED_MOCK_MODE 
    : process.env.NEXT_PUBLIC_EVERYCRED_MOCK_MODE) || 
    "false"
  const mockMode = mockModeStr.toLowerCase() === "true"
  
  // Debug logging (only in development)
  if (process.env.NODE_ENV === "development") {
    console.log("EveryCRED Config:", {
      apiUrl,
      hasToken: !!apiToken,
      tokenLength: apiToken.length,
      issuerId,
      groupId,
      subjectId,
      mockMode,
      isServer,
    })
  }
  
  return {
    apiUrl: apiUrl.endsWith("/v1") ? apiUrl : `${apiUrl}/v1`,
    apiToken: apiToken.trim(),
    issuerId,
    groupId,
    subjectId,
    mockMode,
  }
}

/**
 * Check if EveryCRED is properly configured.
 */
export function isEveryCREDConfigured(config: EveryCREDConfig): boolean {
  if (config.mockMode) {
    return true
  }
  return Boolean(config.apiUrl && config.apiToken && config.issuerId)
}

