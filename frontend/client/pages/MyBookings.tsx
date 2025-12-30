import { useAuth } from '@/hooks/useAuth';
import { useBooking } from '@/hooks/useBooking';
import { useResources } from '@/hooks/useResources';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Trash2, Calendar } from 'lucide-react';
import { useState } from 'react';

export default function MyBookings() {
  const { user } = useAuth();
  const { getBookingsByUser, cancelBooking } = useBooking();
  const { getResourceById } = useResources();
  const [cancelledId, setCancelledId] = useState<string | null>(null);

  const userBookings = user ? getBookingsByUser(user.id) : [];

  const handleCancel = (bookingId: string) => {
    cancelBooking(bookingId);
    setCancelledId(bookingId);
    setTimeout(() => setCancelledId(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900">My Bookings</h1>
        <p className="text-slate-600 mt-2">View and manage your resource bookings</p>
      </div>

      {/* Bookings List */}
      {userBookings.length > 0 ? (
        <div className="space-y-4">
          {userBookings.map((booking) => {
            const resource = getResourceById(booking.resourceId);
            const isCancelled = cancelledId === booking.id;

            return (
              <Card
                key={booking.id}
                className={`p-6 shadow-soft transition-all ${
                  isCancelled ? 'bg-red-50 border-red-200' : ''
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="font-bold text-slate-900 text-lg">
                          {booking.resourceName}
                        </h3>
                        <p className="text-slate-600 text-sm mt-1">
                          <span className="font-medium">{booking.date}</span> •{' '}
                          <span className="font-medium">
                            {String(booking.startTime).padStart(2, '0')}:00 -{' '}
                            {String(booking.endTime).padStart(2, '0')}:00
                          </span>
                        </p>
                        <p className="text-slate-500 text-xs mt-2">
                          Duration: {booking.duration} hour{booking.duration !== 1 ? 's' : ''}
                        </p>
                        {resource && (
                          <p className="text-slate-500 text-xs">
                            {resource.location && `📍 ${resource.location}`}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 md:flex-col md:items-end">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        booking.status === 'confirmed'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {booking.status}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCancel(booking.id)}
                      className="text-destructive hover:text-destructive hover:bg-red-50 border-red-200"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="p-12 text-center shadow-soft">
          <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900">No bookings yet</h3>
          <p className="text-slate-600 mt-2 mb-6">
            You haven't made any bookings. Browse available resources to get started.
          </p>
        </Card>
      )}

      {/* Booking Guidelines */}
      <Card className="p-6 shadow-soft border-l-4 border-blue-500 bg-blue-50">
        <h3 className="font-semibold text-slate-900 mb-3">📋 Booking Guidelines</h3>
        <ul className="space-y-2 text-sm text-slate-600">
          <li>• All bookings must be within 9 AM to 5 PM</li>
          <li>• Cancel bookings at least 1 hour in advance when possible</li>
          <li>• Check email for booking confirmation details</li>
          <li>• Overlapping bookings are automatically prevented by the system</li>
        </ul>
      </Card>
    </div>
  );
}
