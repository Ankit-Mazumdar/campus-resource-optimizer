import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useAvailability } from "@/hooks/useAvailability";
import { useBooking } from "@/hooks/useBooking";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Clock, CheckCircle2 } from "lucide-react";

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const HOURS = Array.from({ length: 9 }, (_, i) => i + 9);

export default function AvailabilityManagement() {
  const { user } = useAuth();
  const { getAvailabilityByFaculty, updateAvailability } = useAvailability();
  const { getBookingsByUser } = useBooking();

  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [saved, setSaved] = useState(false);

  const userBookings = user ? getBookingsByUser(user.id) : [];
  const todayAvailability = user
    ? getAvailabilityByFaculty(user.id, selectedDate)
    : undefined;

  const [availability, setAvailability] = useState(
    todayAvailability?.slots ||
      Array.from({ length: 8 }, (_, i) => ({
        startTime: i + 9,
        endTime: i + 10,
        isAvailable: true,
      })),
  );

  const handleToggleSlot = (index: number) => {
    const updated = [...availability];
    updated[index].isAvailable = !updated[index].isAvailable;
    setAvailability(updated);
  };

  const handleSetAllAvailable = () => {
    setAvailability(
      availability.map((slot) => ({
        ...slot,
        isAvailable: true,
      })),
    );
  };

  const handleSetAllUnavailable = () => {
    setAvailability(
      availability.map((slot) => ({
        ...slot,
        isAvailable: false,
      })),
    );
  };

  const handleSave = () => {
    if (user) {
      updateAvailability(user.id, selectedDate, availability);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  // Ensure user is faculty
  if (user?.role !== "faculty") {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600">You don't have access to this page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
          Availability Management
        </h1>
        <p className="text-slate-600 mt-2">
          Set your availability for class bookings
        </p>
      </div>

      {/* Success Message */}
      {saved && (
        <div className="p-4 rounded-lg bg-green-50 border border-green-200 flex gap-3 animate-slide-in-down">
          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-600 font-medium">
            Availability updated successfully!
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar and Controls */}
        <div className="lg:col-span-1">
          <Card className="p-6 shadow-soft space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Select Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50"
              />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-700">
                Quick Actions
              </p>
              <Button
                variant="outline"
                className="w-full justify-start text-slate-700"
                onClick={handleSetAllAvailable}
              >
                All Available
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start text-slate-700"
                onClick={handleSetAllUnavailable}
              >
                All Unavailable
              </Button>
            </div>

            <div className="pt-4 border-t border-slate-200">
              <p className="text-sm font-medium text-slate-700 mb-3">
                Today's Bookings
              </p>
              {userBookings.filter((b) => b.date === selectedDate).length >
              0 ? (
                <div className="space-y-2">
                  {userBookings
                    .filter((b) => b.date === selectedDate)
                    .map((booking) => (
                      <div
                        key={booking.id}
                        className="p-3 bg-blue-50 rounded-lg border border-blue-200"
                      >
                        <p className="text-xs font-semibold text-blue-900">
                          {booking.resourceName}
                        </p>
                        <p className="text-xs text-blue-700">
                          {String(booking.startTime).padStart(2, "0")}:00 -{" "}
                          {String(booking.endTime).padStart(2, "0")}:00
                        </p>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500">No bookings today</p>
              )}
            </div>
          </Card>
        </div>

        {/* Availability Grid */}
        <div className="lg:col-span-2">
          <Card className="p-6 shadow-soft">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Set Your Availability
            </h3>

            <div className="space-y-2">
              {availability.map((slot, index) => (
                <div
                  key={index}
                  onClick={() => handleToggleSlot(index)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    slot.isAvailable
                      ? "border-green-300 bg-green-50"
                      : "border-slate-200 bg-slate-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-4 h-4 rounded-full ${slot.isAvailable ? "bg-green-500" : "bg-slate-300"}`}
                      ></div>
                      <span className="font-medium text-slate-900">
                        {String(slot.startTime).padStart(2, "0")}:00 -{" "}
                        {String(slot.endTime).padStart(2, "0")}:00
                      </span>
                    </div>
                    <span
                      className={`text-sm font-medium ${slot.isAvailable ? "text-green-700" : "text-slate-600"}`}
                    >
                      {slot.isAvailable ? "Available" : "Unavailable"}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-slate-200">
              <Button
                onClick={handleSave}
                className="bg-primary hover:bg-primary/90 w-full md:w-auto"
              >
                Save Availability
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Tips */}
      <Card className="p-6 shadow-soft border-l-4 border-blue-500 bg-blue-50">
        <h3 className="font-semibold text-slate-900 mb-3">💡 Tips</h3>
        <ul className="space-y-2 text-sm text-slate-600">
          <li>• Click on any time slot to toggle your availability</li>
          <li>• Green slots mean you're available for class bookings</li>
          <li>• Gray slots mean you're unavailable during that time</li>
          <li>
            • Your availability automatically updates when you book a classroom
          </li>
        </ul>
      </Card>
    </div>
  );
}
