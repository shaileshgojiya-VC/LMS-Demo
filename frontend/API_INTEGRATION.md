# Backend API Integration Guide

## Current Status

✅ **API Infrastructure Created**
- Centralized API client (`lib/api-client.ts`)
- API service layer with all endpoints (`lib/api.ts`)
- React hooks for data fetching (`lib/hooks/use-api.ts`)

⚠️ **Components Still Using Hardcoded Data**
- Dashboard page (`app/page.tsx`)
- Students page (`app/students/page.tsx`)
- Courses page (`app/courses/page.tsx`)
- All components need to be updated to use API calls

## Setup Instructions

### 1. Environment Configuration

Create a `.env.local` file in the `frontend/` directory:

```bash
# Backend API Base URL
NEXT_PUBLIC_API_URL=http://localhost:9000/api
```

**Note:** Adjust the URL to match your backend server's address and port.

### 2. Backend API Requirements

Your backend should provide the following endpoints:

#### Students
- `GET /api/students` - Get all students
- `GET /api/students/:id` - Get student by ID
- `POST /api/students` - Create new student
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student

#### Courses
- `GET /api/courses` - Get all courses
- `GET /api/courses/:id` - Get course by ID
- `POST /api/courses` - Create new course
- `PUT /api/courses/:id` - Update course
- `DELETE /api/courses/:id` - Delete course

#### Credentials
- `GET /api/credentials` - Get all credentials
- `GET /api/credentials/:id` - Get credential by ID
- `POST /api/credentials/issue` - Issue new credential
- `GET /api/credentials/:id/verify` - Verify credential
- `POST /api/credentials/:id/revoke` - Revoke credential

#### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/activity?limit=10` - Get recent activity
- `GET /api/dashboard/credentials?limit=10` - Get recently issued credentials

### 3. Expected Response Formats

#### Student
```typescript
{
  id: string
  name: string
  email: string
  program: string
  status: "active" | "inactive"
  progress: number
  enrollment_date?: string
  completion_date?: string
}
```

#### Course
```typescript
{
  id: string
  title: string
  description: string
  instructor: string
  students: number
  duration: string
  modules: number
  status: "active" | "upcoming" | "completed"
}
```

#### Credential
```typescript
{
  id: string
  credential_id: string
  student_id: string
  student_name: string
  degree: string
  program: string
  institution: string
  issue_date: string
  verification_url?: string
  status: "issued" | "pending" | "revoked"
  issued_at: string
}
```

#### Dashboard Stats
```typescript
{
  total_students: number
  active_courses: number
  credentials_issued: number
  completion_rate: number
  students_change?: number
  courses_change?: number
  credentials_change?: number
  completion_change?: number
}
```

#### Activity
```typescript
{
  id: string
  type: "credential" | "enrollment" | "registration" | "completion"
  user: string
  action: string
  detail: string
  time: string
  created_at: string
}
```

## Usage Examples

### Using React Hooks (Recommended)

```typescript
import { useDashboardStats, useStudents, useRecentActivity } from "@/lib/hooks/use-api"

export default function DashboardPage() {
  const { data: stats, loading: statsLoading, error: statsError } = useDashboardStats()
  const { data: students, loading: studentsLoading } = useStudents()
  const { data: activities } = useRecentActivity(10)

  if (statsLoading) return <div>Loading...</div>
  if (statsError) return <div>Error: {statsError}</div>

  return (
    <div>
      <h1>Total Students: {stats?.total_students}</h1>
      {/* ... */}
    </div>
  )
}
```

### Using API Directly

```typescript
import { api } from "@/lib/api"
import { useEffect, useState } from "react"

export function MyComponent() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStudents() {
      try {
        const data = await api.students.getAll()
        setStudents(data)
      } catch (error) {
        console.error("Failed to fetch students:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchStudents()
  }, [])

  // ... render students
}
```

### Issuing a Credential

```typescript
import { api } from "@/lib/api"

async function handleIssueCredential(studentId: string) {
  try {
    const response = await api.credentials.issue({
      student_id: studentId,
      student_name: "John Doe",
      student_email: "john@example.com",
      degree: "Bachelor of Technology",
      program: "Computer Science",
      institution: "Demo University",
      issue_date: new Date().toISOString().split("T")[0],
    })
    
    console.log("Credential issued:", response.credential_id)
  } catch (error) {
    console.error("Failed to issue credential:", error)
  }
}
```

## Next Steps

1. **Update Dashboard Page** (`app/page.tsx`)
   - Replace hardcoded stats with `useDashboardStats()`
   - Replace hardcoded credentials with `useIssuedCredentials()`
   - Replace hardcoded students with API call to get completed students

2. **Update Students Page** (`app/students/page.tsx`)
   - Replace hardcoded students array with `useStudents()`
   - Add loading and error states

3. **Update Courses Page** (`app/courses/page.tsx`)
   - Replace hardcoded courses array with `useCourses()`
   - Add loading and error states

4. **Update Components**
   - `components/students/students-table.tsx` - Already uses API for credential issuance, but needs to fetch students list
   - `components/dashboard/recent-activity.tsx` - Replace hardcoded activities
   - `components/dashboard/issued-credentials.tsx` - Already accepts props, just need to pass API data

5. **Add Error Handling**
   - Create error boundary components
   - Add retry mechanisms for failed requests
   - Show user-friendly error messages

6. **Add Loading States**
   - Add skeleton loaders
   - Show loading indicators during API calls

## Error Handling

The API client automatically handles:
- Network errors (connection failures)
- HTTP errors (4xx, 5xx status codes)
- JSON parsing errors

All errors are thrown with a descriptive message that can be displayed to users.

## Testing

To test the API integration:

1. Start your backend server
2. Ensure it's running on the URL specified in `.env.local`
3. Update components to use the API hooks
4. Check browser console for any API errors
5. Verify data is loading correctly

## Troubleshooting

**Issue:** "Unable to connect to the server"
- Check if backend is running
- Verify `NEXT_PUBLIC_API_URL` is correct
- Check CORS settings on backend

**Issue:** CORS errors
- Backend needs to allow requests from `http://localhost:3000`
- Add CORS headers to backend responses

**Issue:** 404 errors
- Verify API endpoint paths match backend routes
- Check if backend is using `/api` prefix

