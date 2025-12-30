// User types
export type UserRole = 'admin' | 'faculty' | 'student';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  phone?: string;
}

// Resource types
export type ResourceType = 'classroom' | 'equipment' | 'book' | 'faculty_hours';

export interface Resource {
  id: string;
  name: string;
  type: ResourceType;
  description: string;
  department?: string;
  capacity?: number;
  location?: string;
  availableFrom?: number; // hour 0-23
  availableTo?: number; // hour 0-23
  createdAt: string;
  updatedAt: string;
}

// Booking types
export type BookingStatus = 'confirmed' | 'pending' | 'cancelled';

export interface Booking {
  id: string;
  userId: string;
  userName: string;
  resourceId: string;
  resourceName: string;
  resourceType: ResourceType;
  date: string; // YYYY-MM-DD format
  startTime: number; // hour 0-23
  endTime: number; // hour 0-23
  duration: number; // in hours
  status: BookingStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Time slot types
export interface TimeSlot {
  startTime: number; // hour 0-23
  endTime: number; // hour 0-23
  isAvailable: boolean;
}

// Faculty availability types
export interface FacultyAvailability {
  facultyId: string;
  facultyName: string;
  date: string; // YYYY-MM-DD format
  slots: TimeSlot[];
  updatedAt: string;
}

// Analytics/Utilization types
export interface ResourceUtilization {
  resourceId: string;
  resourceName: string;
  resourceType: ResourceType;
  totalCapacity: number;
  hoursUsed: number;
  utilizationPercentage: number;
  upcomingBookings: number;
}

export interface BusyHourData {
  hour: number;
  bookingCount: number;
  resourcesInUse: number;
}

// Auth context types
export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, role: UserRole) => void;
  signup: (name: string, email: string, password: string, role: UserRole) => void;
  logout: () => void;
}

// Booking context types
export interface BookingContextType {
  bookings: Booking[];
  addBooking: (booking: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>) => boolean | { error: string };
  cancelBooking: (bookingId: string) => void;
  getBookingsByUser: (userId: string) => Booking[];
  getBookingsByResource: (resourceId: string) => Booking[];
  checkConflict: (resourceId: string, date: string, startTime: number, endTime: number) => boolean;
}

// Resource context types
export interface ResourceContextType {
  resources: Resource[];
  addResource: (resource: Omit<Resource, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateResource: (id: string, updates: Partial<Resource>) => void;
  deleteResource: (id: string) => void;
  getResourcesByType: (type: ResourceType) => Resource[];
  getResourceById: (id: string) => Resource | undefined;
}

// Availability context types
export interface AvailabilityContextType {
  availabilities: FacultyAvailability[];
  addAvailability: (availability: FacultyAvailability) => void;
  updateAvailability: (facultyId: string, date: string, slots: TimeSlot[]) => void;
  getAvailabilityByFaculty: (facultyId: string, date: string) => FacultyAvailability | undefined;
  markFacultyBusy: (facultyId: string, facultyName: string, date: string, startTime: number, endTime: number) => void;
}
