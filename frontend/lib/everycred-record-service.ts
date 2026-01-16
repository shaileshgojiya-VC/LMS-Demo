"use client"

// EveryCRED Record Service
// Handles record creation via EveryCRED staging API

import { getEveryCREDConfig } from "./everycred-config"

export interface RecordResponse {
    id: number
    status: string
    message?: string
    data?: any
}

export interface RecordData {
    id: number
    uuid?: string
    slug?: Record<string, any> | string
    subject_id?: number
    issuer_id?: number
    [key: string]: any
}

export interface CreateRecordPayload {
    subjectId: number
    subjectFields: Record<string, any>
}

/**
 * Create a record in EveryCRED staging API.
 * 
 * @param subjectId - The subject ID (from courseId)
 * @param subjectFields - Object with field names as keys and values
 * @returns Promise with record response containing record ID
 */
export async function createRecord(
    subjectId: number,
    subjectFields: Record<string, any>
): Promise<RecordResponse> {
    const config = getEveryCREDConfig()

    if (config.mockMode) {
        console.log("[MOCK] Creating record:", { subjectId, subjectFields })
        return {
            id: Math.floor(Math.random() * 10000),
            status: "success",
            message: "Record created successfully (mock mode)",
        }
    }

    // Check if API is configured (allow empty token in mock mode)
    if (!config.apiUrl) {
        throw new Error("EveryCRED API URL is not configured. Please set NEXT_PUBLIC_EVERYCRED_API_URL in your environment variables.")
    }

    if (!config.apiToken && !config.mockMode) {
        throw new Error("EveryCRED API token is not configured. Please set NEXT_PUBLIC_EVERYCRED_API_TOKEN in your environment variables.")
    }

    // Build the slug payload as JSON string
    const slugData = {
        subject_fields: subjectFields,
    }
    const slug = JSON.stringify(slugData)

    // Build the request payload
    const payload = {
        group_id: config.groupId || null,
        badge_id: null,
        slug: slug,
    }

    // Build URL with query parameters
    const issuerId = 15 // Static as per requirements
    const url = `${config.apiUrl}/record?subject_id=${subjectId}&issuer_id=${issuerId}`

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${config.apiToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        })

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({
                message: `HTTP error! status: ${response.status}`,
            }))

            throw new Error(
                errorData.message ||
                errorData.detail ||
                `Failed to create record: ${response.status} ${response.statusText}`
            )
        }

        const data = await response.json()

        // Extract record ID from response
        let recordId: number | undefined

        if (data.data) {
            if (typeof data.data === "object") {
                recordId = data.data.id || data.data.record?.id
            } else if (typeof data.data === "number") {
                recordId = data.data
            }
        }

        if (data.id) {
            recordId = data.id
        }

        if (!recordId) {
            console.warn("Could not extract record ID from response:", data)
            // Still return success if response was OK
            recordId = 0
        }

        return {
            id: recordId,
            status: "success",
            message: data.message || "Record created successfully",
            data: data.data || data,
        }
    } catch (error: any) {
        console.error("Error creating record:", error)

        if (error instanceof TypeError && error.message === "Failed to fetch") {
            throw new Error("Unable to connect to EveryCRED API. Please check your network connection.")
        }

        throw new Error(error.message || "Failed to create record. Please try again.")
    }
}

/**
 * Fetch a record from EveryCRED staging API to get the slug structure.
 * This helps determine which fields are actually used for a subject.
 * 
 * @param subjectId - The subject ID
 * @param recordId - Optional record ID (if not provided, fetches first record for subject)
 * @returns Promise with record data containing slug
 */
export async function getRecord(
    subjectId: number,
    recordId?: number
): Promise<RecordData | null> {
    const config = getEveryCREDConfig()

    if (config.mockMode) {
        console.log("[MOCK] Fetching record:", { subjectId, recordId })
        return {
            id: recordId || 1,
            slug: { name: "test", email: "test@example.com", program: "test" },
        }
    }

    if (!config.apiUrl || !config.apiToken) {
        console.warn("EveryCRED API not configured, cannot fetch record")
        return null
    }

    try {
        // If recordId is provided, fetch that specific record
        // Otherwise, fetch records for the subject and get the first one
        let url: string
        if (recordId) {
            url = `${config.apiUrl}/record/${recordId}?subject_id=${subjectId}&issuer_id=15`
        } else {
            // Fetch credentials/records for the subject
            url = `${config.apiUrl}/credentials?subject_id=${subjectId}&issuer_id=15&page=1&size=1&credential_status=draft`
        }

        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${config.apiToken}`,
                "Content-Type": "application/json",
            },
        })

        if (!response.ok) {
            console.warn(`Failed to fetch record: ${response.status}`)
            return null
        }

        const data = await response.json()

        // Extract record from response
        let record: RecordData | null = null

        if (recordId) {
            // Single record response
            record = data.data || data
        } else {
            // List response - get first record
            const records = data.data?.list || data.data?.data || []
            if (records.length > 0) {
                record = records[0]
            }
        }

        return record
    } catch (error: any) {
        console.warn("Error fetching record:", error)
        return null
    }
}

