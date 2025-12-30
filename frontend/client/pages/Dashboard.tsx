import { useAuth } from '@/hooks/useAuth';
import { useBooking } from '@/hooks/useBooking';
import { useResources } from '@/hooks/useResources';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import {
  BarChart3,
  BookMarked,
  Package,
  Users,
  TrendingUp,
  Calendar,
  Clock,
  AlertCircle,
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const { bookings, getBookingsByUser } = useBooking();
  const { resources } = useResources();

  const userBookings = user ? getBookingsByUser(user.id) : [];
  const upcomingBookings = userBookings.slice(0, 5);

  const stats = {
    totalBookings: userBookings.length,
    upcomingBookings: userBookings.length,
    totalResources: resources.length,
    utilizationPercentage: Math.round((bookings.length / (resources.length * 8)) * 100),
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-slate-600 mt-2">Here's what's happening in your campus today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm font-medium">Total Bookings</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{stats.totalBookings}</p>
            </div>
            <BookMarked className="w-10 h-10 text-primary opacity-20" />
          </div>
        </Card>

        <Card className="p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm font-medium">Resources Available</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{stats.totalResources}</p>
            </div>
            <Package className="w-10 h-10 text-secondary opacity-20" />
          </div>
        </Card>

        <Card className="p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm font-medium">Upcoming Today</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{upcomingBookings.length}</p>
            </div>
            <Calendar className="w-10 h-10 text-blue-500 opacity-20" />
          </div>
        </Card>

        <Card className="p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm font-medium">Utilization Rate</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{stats.utilizationPercentage}%</p>
            </div>
            <TrendingUp className="w-10 h-10 text-green-500 opacity-20" />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card className="p-6 shadow-soft lg:col-span-1">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link to="/resources">
              <Button variant="outline" className="w-full justify-start">
                <Package className="w-4 h-4 mr-2" />
                Browse Resources
              </Button>
            </Link>
            <Link to="/my-bookings">
              <Button variant="outline" className="w-full justify-start">
                <BookMarked className="w-4 h-4 mr-2" />
                My Bookings
              </Button>
            </Link>
            {user?.role === 'admin' && (
              <Link to="/admin/resources">
                <Button variant="outline" className="w-full justify-start">
                  <Users className="w-4 h-4 mr-2" />
                  Manage Resources
                </Button>
              </Link>
            )}
            {user?.role === 'faculty' && (
              <Link to="/availability">
                <Button variant="outline" className="w-full justify-start">
                  <Clock className="w-4 h-4 mr-2" />
                  Set Availability
                </Button>
              </Link>
            )}
          </div>
        </Card>

        {/* Upcoming Bookings */}
        <Card className="p-6 shadow-soft lg:col-span-2">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Your Upcoming Bookings</h3>
          {upcomingBookings.length > 0 ? (
            <div className="space-y-3">
              {upcomingBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="p-4 border border-slate-200 rounded-lg hover:border-primary transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-slate-900">{booking.resourceName}</h4>
                      <p className="text-sm text-slate-600 mt-1">
                        {booking.date} • {booking.startTime}:00 - {booking.endTime}:00
                      </p>
                      <span className="inline-block mt-2 px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                        {booking.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600">No upcoming bookings</p>
              <Link to="/resources">
                <Button variant="link" className="mt-2">
                  Browse and book resources
                </Button>
              </Link>
            </div>
          )}
        </Card>
      </div>

      {/* Role-Specific Info */}
      {user?.role === 'admin' && (
        <Card className="p-6 shadow-soft border-l-4 border-primary">
          <div className="flex items-start gap-4">
            <BarChart3 className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="font-bold text-slate-900">Admin Panel</h3>
              <p className="text-slate-600 text-sm mt-1">
                You have full access to manage all resources, users, and view detailed analytics.
              </p>
              <Link to="/admin/resources">
                <Button variant="link" className="mt-3">
                  Go to Admin Panel →
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      )}

      {user?.role === 'faculty' && (
        <Card className="p-6 shadow-soft border-l-4 border-secondary">
          <div className="flex items-start gap-4">
            <Users className="w-6 h-6 text-secondary flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="font-bold text-slate-900">Faculty Features</h3>
              <p className="text-slate-600 text-sm mt-1">
                Manage your availability, book classrooms for lectures, and track your schedule efficiently.
              </p>
              <Link to="/availability">
                <Button variant="link" className="mt-3">
                  Manage Availability →
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      )}

      {user?.role === 'student' && (
        <Card className="p-6 shadow-soft border-l-4 border-blue-500">
          <div className="flex items-start gap-4">
            <Users className="w-6 h-6 text-blue-500 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="font-bold text-slate-900">Student Resources</h3>
              <p className="text-slate-600 text-sm mt-1">
                View the campus schedule, find available resources, and borrow books from the library.
              </p>
              <Link to="/resources">
                <Button variant="link" className="mt-3">
                  Browse Resources →
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
