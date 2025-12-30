import { createContext, useState, useEffect, ReactNode } from 'react';
import { Booking, BookingContextType } from '@/types';

export const BookingContext = createContext<BookingContextType | undefined>(undefined);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [bookings, setBookings] = useState<Booking[]>([]);

  // Initialize from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('bookings');
    if (stored) {
      try {
        setBookings(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse stored bookings:', e);
      }
    }
  }, []);

  // Save to localStorage whenever bookings change
  useEffect(() => {
    localStorage.setItem('bookings', JSON.stringify(bookings));
  }, [bookings]);

  const checkConflict = (
    resourceId: string,
    date: string,
    startTime: number,
    endTime: number
  ): boolean => {
    return bookings.some(booking => {
      const isSameResource = booking.resourceId === resourceId;
      const isSameDate = booking.date === date;
      const isConfirmed = booking.status === 'confirmed';
      
      if (!isSameResource || !isSameDate || !isConfirmed) return false;

      // Check for time overlap
      const conflictStart = Math.max(booking.startTime, startTime);
      const conflictEnd = Math.min(booking.endTime, endTime);
      
      return conflictStart < conflictEnd;
    });
  };

  const addBooking = (bookingData: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>) => {
    // Check for conflicts
    if (checkConflict(bookingData.resourceId, bookingData.date, bookingData.startTime, bookingData.endTime)) {
      return { error: 'Time slot conflicts with existing booking' };
    }

    // Check if booking is within 9am-5pm
    if (bookingData.startTime < 9 || bookingData.endTime > 17) {
      return { error: 'Bookings must be between 9 AM and 5 PM' };
    }

    const newBooking: Booking = {
      ...bookingData,
      id: `booking_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setBookings(prev => [...prev, newBooking]);
    return true;
  };

  const cancelBooking = (bookingId: string) => {
    setBookings(prev =>
      prev.map(booking =>
        booking.id === bookingId ? { ...booking, status: 'cancelled' as const } : booking
      )
    );
  };

  const getBookingsByUser = (userId: string): Booking[] => {
    return bookings.filter(booking => booking.userId === userId && booking.status === 'confirmed');
  };

  const getBookingsByResource = (resourceId: string): Booking[] => {
    return bookings.filter(booking => booking.resourceId === resourceId && booking.status === 'confirmed');
  };

  return (
    <BookingContext.Provider
      value={{
        bookings: bookings.filter(b => b.status === 'confirmed'),
        addBooking,
        cancelBooking,
        getBookingsByUser,
        getBookingsByResource,
        checkConflict,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
}
