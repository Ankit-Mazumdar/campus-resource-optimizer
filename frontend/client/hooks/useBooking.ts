import { useContext } from 'react';
import { BookingContext } from '@/context/BookingContext';
import { BookingContextType } from '@/types';

export function useBooking(): BookingContextType {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within BookingProvider');
  }
  return context;
}
