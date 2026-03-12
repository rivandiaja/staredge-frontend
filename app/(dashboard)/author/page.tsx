import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PlusCircle, BookOpen, Users, BarChart3 } from "lucide-react";
import Link from "next/link";

export default function AuthorDashboardPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Author Dashboard
          </h1>
          <p className="text-muted-foreground">
            Manage your courses and track student progress.
          </p>
        </div>
        <Button asChild>
          <Link href="/author/courses/create">
            <PlusCircle className="mr-2 h-4 w-4" /> Create Course
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">+0 from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Students
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">+0 this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completion Rate
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0%</div>
            <p className="text-xs text-muted-foreground">Across all courses</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Courses</CardTitle>
          <CardDescription>
            You haven't created any courses yet.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center p-8 text-center border-dashed border-2 rounded-lg bg-muted/20">
            <div className="mb-4 rounded-full bg-background p-3">
              <BookOpen className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium">No courses found</h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-sm">
              Get started by creating your first learning path. You can add
              modules and lessons afterwards.
            </p>
            <Button variant="outline" asChild>
              <Link href="/author/courses/create">Create Course</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
