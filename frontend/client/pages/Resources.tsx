import { useState, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useResources } from '@/hooks/useResources';
import { useBooking } from '@/hooks/useBooking';
import { useAvailability } from '@/hooks/useAvailability';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  BookOpen,
  Search,
  Filter,
  MapPin,
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { ResourceType } from '@/types';

export default function Resources() {
  const { user } = useAuth();
  const { resources } = useResources();
  const { addBooking, checkConflict } = useBooking();
  const { markFacultyBusy } = useAvailability();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<ResourceType | 'all'>('all');
  const [selectedResource, setSelectedResource] = useState<string | null>(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingStartTime, setBookingStartTime] = useState('9');
  const [bookingEndTime, setBookingEndTime] = useState('10');
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Filter resources
  const filteredResources = useMemo(() => {
    return resources.filter((resource) => {
      const matchesSearch = resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            resource.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || resource.type === filterType;
      return matchesSearch && matchesType;
    });
  }, [resources, searchTerm, filterType]);

  const handleBooking = () => {
    setBookingError('');
    setBookingSuccess(false);

    if (!selectedResource || !bookingDate || !bookingStartTime || !bookingEndTime) {
      setBookingError('Please fill in all booking details');
      return;
    }

    const startTime = parseInt(bookingStartTime);
    const endTime = parseInt(bookingEndTime);

    if (startTime >= endTime) {
      setBookingError('End time must be after start time');
      return;
    }

    if (startTime < 9 || endTime > 17) {
      setBookingError('Bookings must be between 9 AM and 5 PM');
      return;
    }

    const resource = resources.find(r => r.id === selectedResource);
    if (!resource) {
      setBookingError('Invalid resource');
      return;
    }

    // Check for conflicts
    if (checkConflict(selectedResource, bookingDate, startTime, endTime)) {
      setBookingError('Time slot conflicts with existing booking. Please choose another time.');
      return;
    }

    const result = addBooking({
      userId: user!.id,
      userName: user!.name,
      resourceId: selectedResource,
      resourceName: resource.name,
      resourceType: resource.type,
      date: bookingDate,
      startTime,
      endTime,
      duration: endTime - startTime,
      status: 'confirmed',
    });

    if (typeof result === 'object' && result.error) {
      setBookingError(result.error);
      return;
    }

    // If faculty booked a classroom, mark them as busy
    if (user?.role === 'faculty' && resource.type === 'classroom') {
      markFacultyBusy(user.id, user.name, bookingDate, startTime, endTime);
    }

    setBookingSuccess(true);
    setSelectedResource(null);
    setBookingDate('');
    setBookingStartTime('9');
    setBookingEndTime('10');

    setTimeout(() => setBookingSuccess(false), 3000);
  };

  const resourceIcon = (type: ResourceType) => {
    switch (type) {
      case 'classroom':
        return '📚';
      case 'equipment':
        return '🖥️';
      case 'book':
        return '📖';
      case 'faculty_hours':
        return '👨‍🏫';
      default:
        return '📦';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Resources</h1>
        <p className="text-slate-600 mt-2">Browse and book available campus resources</p>
      </div>

      {/* Success Message */}
      {bookingSuccess && (
        <div className="p-4 rounded-lg bg-green-50 border border-green-200 flex gap-3 animate-slide-in-down">
          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-green-900">Booking confirmed!</p>
            <p className="text-sm text-green-800">A confirmation email has been sent.</p>
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
          <Input
            placeholder="Search resources..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white"
          />
        </div>
        <div className="w-full md:w-48">
          <Select value={filterType} onValueChange={(value) => setFilterType(value as ResourceType | 'all')}>
            <SelectTrigger className="bg-white">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Resources</SelectItem>
              <SelectItem value="classroom">Classrooms</SelectItem>
              <SelectItem value="equipment">Equipment</SelectItem>
              <SelectItem value="book">Books</SelectItem>
              <SelectItem value="faculty_hours">Faculty Hours</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.length > 0 ? (
          filteredResources.map((resource) => (
            <Card key={resource.id} className="p-6 shadow-soft hover:shadow-medium transition-shadow">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{resourceIcon(resource.type)}</span>
                      <h3 className="font-bold text-slate-900">{resource.name}</h3>
                    </div>
                    <p className="text-sm text-slate-600 mt-1">{resource.description}</p>
                  </div>
                </div>

                {/* Badge */}
                <Badge className="w-fit capitalize" variant="outline">
                  {resource.type === 'faculty_hours' ? 'Faculty Hours' : resource.type}
                </Badge>

                {/* Details */}
                <div className="space-y-2 text-sm">
                  {resource.location && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <MapPin className="w-4 h-4" />
                      {resource.location}
                    </div>
                  )}
                  {resource.capacity && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <Users className="w-4 h-4" />
                      Capacity: {resource.capacity}
                    </div>
                  )}
                  {resource.availableFrom && resource.availableTo && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <Clock className="w-4 h-4" />
                      {String(resource.availableFrom).padStart(2, '0')}:00 -{' '}
                      {String(resource.availableTo).padStart(2, '0')}:00
                    </div>
                  )}
                </div>

                {/* Book Button */}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      onClick={() => setSelectedResource(resource.id)}
                      className="w-full bg-primary hover:bg-primary/90 text-white"
                    >
                      Book Now
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Book {resource.name}</DialogTitle>
                    </DialogHeader>

                    {bookingError && (
                      <div className="p-3 rounded-lg bg-red-50 border border-red-200 flex gap-2">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-600">{bookingError}</p>
                      </div>
                    )}

                    <div className="space-y-4">
                      {/* Date */}
                      <div className="space-y-2">
                        <Label htmlFor="date">Date</Label>
                        <Input
                          id="date"
                          type="date"
                          value={bookingDate}
                          onChange={(e) => setBookingDate(e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                        />
                      </div>

                      {/* Time Slots */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="start-time">Start Time</Label>
                          <Select value={bookingStartTime} onValueChange={setBookingStartTime}>
                            <SelectTrigger id="start-time">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 8 }, (_, i) => i + 9).map((hour) => (
                                <SelectItem key={hour} value={String(hour)}>
                                  {String(hour).padStart(2, '0')}:00
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="end-time">End Time</Label>
                          <Select value={bookingEndTime} onValueChange={setBookingEndTime}>
                            <SelectTrigger id="end-time">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 8 }, (_, i) => i + 10).map((hour) => (
                                <SelectItem key={hour} value={String(hour)}>
                                  {String(hour).padStart(2, '0')}:00
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Notes */}
                      <div className="space-y-2">
                        <Label className="text-xs text-slate-500">
                          Campus hours: 9 AM - 5 PM only
                        </Label>
                      </div>

                      {/* Buttons */}
                      <Button
                        onClick={handleBooking}
                        className="w-full bg-primary hover:bg-primary/90"
                      >
                        Confirm Booking
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600">No resources found matching your search.</p>
          </div>
        )}
      </div>

      {/* Info Box */}
      <Card className="p-6 shadow-soft border-l-4 border-blue-500 bg-blue-50">
        <h3 className="font-semibold text-slate-900 mb-3">💡 Booking Tips</h3>
        <ul className="space-y-2 text-sm text-slate-600">
          <li>• Use the search bar to find specific resources</li>
          <li>• Filter by resource type to narrow down options</li>
          <li>• All bookings are within 9 AM to 5 PM</li>
          <li>• Overlapping bookings are automatically prevented</li>
          <li>• Booking confirmations will be sent to your email</li>
        </ul>
      </Card>
    </div>
  );
}
