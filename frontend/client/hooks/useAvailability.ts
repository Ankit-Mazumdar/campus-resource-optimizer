import { useContext } from 'react';
import { AvailabilityContext } from '@/context/AvailabilityContext';
import { AvailabilityContextType } from '@/types';

export function useAvailability(): AvailabilityContextType {
  const context = useContext(AvailabilityContext);
  if (!context) {
    throw new Error('useAvailability must be used within AvailabilityProvider');
  }
  return context;
}
