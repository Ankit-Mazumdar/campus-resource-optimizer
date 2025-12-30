import { createContext, useState, useEffect, ReactNode } from 'react';
import { FacultyAvailability, TimeSlot, AvailabilityContextType } from '@/types';

export const AvailabilityContext = createContext<AvailabilityContextType | undefined>(undefined);

// Generate default availability slots (9am to 5pm, 1-hour slots)
const generateDefaultSlots = (): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  for (let hour = 9; hour < 17; hour++) {
    slots.push({
      startTime: hour,
      endTime: hour + 1,
      isAvailable: true,
    });
  }
  return slots;
};

const SEED_AVAILABILITIES: FacultyAvailability[] = [
  {
    facultyId: 'fac_001',
    facultyName: 'Dr. John Smith',
    date: new Date().toISOString().split('T')[0], // Today
    slots: generateDefaultSlots(),
    updatedAt: new Date().toISOString(),
  },
  {
    facultyId: 'fac_002',
    facultyName: 'Prof. Sarah Johnson',
    date: new Date().toISOString().split('T')[0],
    slots: generateDefaultSlots(),
    updatedAt: new Date().toISOString(),
  },
];

export function AvailabilityProvider({ children }: { children: ReactNode }) {
  const [availabilities, setAvailabilities] = useState<FacultyAvailability[]>(SEED_AVAILABILITIES);

  // Initialize from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('availabilities');
    if (stored) {
      try {
        setAvailabilities(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse stored availabilities:', e);
        setAvailabilities(SEED_AVAILABILITIES);
      }
    }
  }, []);

  // Save to localStorage whenever availabilities change
  useEffect(() => {
    localStorage.setItem('availabilities', JSON.stringify(availabilities));
  }, [availabilities]);

  const addAvailability = (availability: FacultyAvailability) => {
    setAvailabilities(prev => {
      // Remove existing for same faculty/date
      const filtered = prev.filter(a => !(a.facultyId === availability.facultyId && a.date === availability.date));
      return [...filtered, availability];
    });
  };

  const updateAvailability = (facultyId: string, date: string, slots: TimeSlot[]) => {
    const updated: FacultyAvailability = {
      facultyId,
      facultyName: availabilities.find(a => a.facultyId === facultyId)?.facultyName || '',
      date,
      slots,
      updatedAt: new Date().toISOString(),
    };
    addAvailability(updated);
  };

  const getAvailabilityByFaculty = (facultyId: string, date: string): FacultyAvailability | undefined => {
    return availabilities.find(a => a.facultyId === facultyId && a.date === date);
  };

  const markFacultyBusy = (
    facultyId: string,
    facultyName: string,
    date: string,
    startTime: number,
    endTime: number
  ) => {
    let availability = getAvailabilityByFaculty(facultyId, date);

    if (!availability) {
      // Create new availability if doesn't exist
      availability = {
        facultyId,
        facultyName,
        date,
        slots: generateDefaultSlots(),
        updatedAt: new Date().toISOString(),
      };
    }

    // Mark slots as busy
    const updatedSlots = availability.slots.map(slot => {
      const slotStart = slot.startTime;
      const slotEnd = slot.endTime;

      // Check if this slot overlaps with the busy time
      if (slotStart < endTime && slotEnd > startTime) {
        return { ...slot, isAvailable: false };
      }
      return slot;
    });

    updateAvailability(facultyId, date, updatedSlots);
  };

  return (
    <AvailabilityContext.Provider
      value={{
        availabilities,
        addAvailability,
        updateAvailability,
        getAvailabilityByFaculty,
        markFacultyBusy,
      }}
    >
      {children}
    </AvailabilityContext.Provider>
  );
}
