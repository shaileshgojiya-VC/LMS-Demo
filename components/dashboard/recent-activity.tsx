"use client"
import { GlassCard } from "@/components/ui/glass-card"
import { GlassBadge } from "@/components/ui/glass-badge"
import { motion } from "framer-motion"
import { Award, BookOpen, UserPlus, CheckCircle } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const activities = [
  {
    id: 1,
    type: "credential",
    user: "Sarah Johnson",
    avatar: "SJ",
    action: "Credential issued",
    detail: "Bachelor of Technology",
    time: "2 minutes ago",
    icon: Award,
  },
  {
    id: 2,
    type: "enrollment",
    user: "Michael Chen",
    avatar: "MC",
    action: "Enrolled in course",
    detail: "Advanced Data Science",
    time: "15 minutes ago",
    icon: BookOpen,
  },
  {
    id: 3,
    type: "registration",
    user: "Emily Davis",
    avatar: "ED",
    action: "New student registered",
    detail: "Computer Science",
    time: "1 hour ago",
    icon: UserPlus,
  },
  {
    id: 4,
    type: "completion",
    user: "James Wilson",
    avatar: "JW",
    action: "Course completed",
    detail: "Machine Learning Fundamentals",
    time: "2 hours ago",
    icon: CheckCircle,
  },
]

export function RecentActivity() {
  return (
    <GlassCard interactive={false} className="p-0 overflow-hidden">
      <div className="divide-y divide-border/30">
        {activities.map((activity, index) => (
          <motion.div
            key={activity.id}
            className="p-4 hover:bg-muted/30 transition-colors cursor-pointer"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ x: 4 }}
          >
            <div className="flex items-start gap-4">
              <Avatar className="h-10 w-10">
                <AvatarImage src={`/.jpg?height=40&width=40&query=${activity.user} avatar`} />
                <AvatarFallback className="bg-primary/10 text-primary text-xs">{activity.avatar}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-foreground">{activity.user}</span>
                  <GlassBadge variant={activity.type === "credential" ? "success" : "info"}>
                    {activity.action}
                  </GlassBadge>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5 truncate">{activity.detail}</p>
                <p className="text-xs text-muted-foreground/70 mt-1">{activity.time}</p>
              </div>
              <div className="p-2 rounded-lg bg-muted/50">
                <activity.icon className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </GlassCard>
  )
}
