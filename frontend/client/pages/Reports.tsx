import { useAuth } from "@/hooks/useAuth";
import { useBooking } from "@/hooks/useBooking";
import { useResources } from "@/hooks/useResources";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Download, TrendingUp, Package, Users, Calendar } from "lucide-react";

export default function Reports() {
  const { user } = useAuth();
  const { bookings } = useBooking();
  const { resources } = useResources();

  // Calculate statistics
  const resourceTypeStats = resources.reduce(
    (acc, resource) => {
      const count = acc.find((item) => item.name === resource.type);
      if (count) {
        count.value += 1;
      } else {
        acc.push({
          name:
            resource.type === "faculty_hours" ? "Faculty Hours" : resource.type,
          value: 1,
        });
      }
      return acc;
    },
    [] as Array<{ name: string; value: number }>,
  );

  const utilizationData = resources.map((resource) => {
    const resourceBookings = bookings.filter(
      (b) => b.resourceId === resource.id,
    ).length;
    return {
      name: resource.name,
      usage: Math.min(100, (resourceBookings / 10) * 100),
      bookings: resourceBookings,
    };
  });

  const hourlyData = Array.from({ length: 9 }, (_, i) => {
    const hour = i + 9;
    const count = bookings.filter(
      (b) => b.startTime <= hour && b.endTime > hour,
    ).length;
    return {
      hour: `${String(hour).padStart(2, "0")}:00`,
      bookings: count,
    };
  });

  const totalBookings = bookings.length;
  const averageUtilization = Math.round(
    utilizationData.reduce((sum, item) => sum + item.usage, 0) /
      (utilizationData.length || 1),
  );
  const peakHour = hourlyData.reduce((prev, current) =>
    prev.bookings > current.bookings ? prev : current,
  );

  const COLORS = [
    "#5B5FDE",
    "#EC5975",
    "#FFA500",
    "#10B981",
    "#8B5CF6",
    "#06B6D4",
  ];

  // Ensure user is admin
  if (user?.role !== "admin") {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600">You don't have access to this page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
            Analytics & Reports
          </h1>
          <p className="text-slate-600 mt-2">
            Comprehensive campus resource utilization analytics
          </p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 flex gap-2">
          <Download className="w-4 h-4" />
          Export Report
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm font-medium">
                Total Bookings
              </p>
              <p className="text-3xl font-bold text-slate-900 mt-2">
                {totalBookings}
              </p>
            </div>
            <Calendar className="w-10 h-10 text-primary opacity-20" />
          </div>
        </Card>

        <Card className="p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm font-medium">
                Total Resources
              </p>
              <p className="text-3xl font-bold text-slate-900 mt-2">
                {resources.length}
              </p>
            </div>
            <Package className="w-10 h-10 text-secondary opacity-20" />
          </div>
        </Card>

        <Card className="p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm font-medium">
                Avg Utilization
              </p>
              <p className="text-3xl font-bold text-slate-900 mt-2">
                {averageUtilization}%
              </p>
            </div>
            <TrendingUp className="w-10 h-10 text-green-500 opacity-20" />
          </div>
        </Card>

        <Card className="p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm font-medium">Peak Hour</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">
                {peakHour.hour}
              </p>
            </div>
            <Users className="w-10 h-10 text-blue-500 opacity-20" />
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Resource Type Distribution */}
        <Card className="p-6 shadow-soft">
          <h3 className="text-lg font-bold text-slate-900 mb-4">
            Resource Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={resourceTypeStats}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {resourceTypeStats.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Hourly Booking Distribution */}
        <Card className="p-6 shadow-soft">
          <h3 className="text-lg font-bold text-slate-900 mb-4">
            Hourly Bookings
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="bookings" fill="#5B5FDE" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Utilization by Resource */}
      <Card className="p-6 shadow-soft">
        <h3 className="text-lg font-bold text-slate-900 mb-4">
          Resource Utilization
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={utilizationData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 200, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" width={190} />
            <Tooltip />
            <Bar dataKey="usage" fill="#5B5FDE" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Booking Trends */}
      <Card className="p-6 shadow-soft">
        <h3 className="text-lg font-bold text-slate-900 mb-4">
          Booking Trends
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={hourlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="hour" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="bookings"
              stroke="#5B5FDE"
              strokeWidth={2}
              dot={{ fill: "#5B5FDE", r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Top Insights */}
      <Card className="p-6 shadow-soft">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Key Insights</h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50">
            <span className="text-blue-600 font-bold">📊</span>
            <div>
              <p className="font-medium text-slate-900">Peak Usage Time</p>
              <p className="text-sm text-slate-600">
                {peakHour.hour} experiences the highest booking volume with{" "}
                {peakHour.bookings} active bookings.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-lg bg-green-50">
            <span className="text-green-600 font-bold">✓</span>
            <div>
              <p className="font-medium text-slate-900">Resource Efficiency</p>
              <p className="text-sm text-slate-600">
                Average resource utilization is {averageUtilization}%. Consider
                optimizing scheduling for underutilized resources.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-lg bg-purple-50">
            <span className="text-purple-600 font-bold">💡</span>
            <div>
              <p className="font-medium text-slate-900">
                Resource Distribution
              </p>
              <p className="text-sm text-slate-600">
                You manage {resources.length} resources across{" "}
                {resourceTypeStats.length} categories.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
