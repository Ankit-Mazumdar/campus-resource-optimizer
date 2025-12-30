import { createContext, useState, useEffect, ReactNode } from 'react';
import { Resource, ResourceContextType, ResourceType } from '@/types';

export const ResourceContext = createContext<ResourceContextType | undefined>(undefined);

const SEED_RESOURCES: Resource[] = [
  {
    id: 'room_101',
    name: 'Classroom A101',
    type: 'classroom',
    description: 'Standard classroom with projector',
    capacity: 50,
    location: 'Building A, Floor 1',
    availableFrom: 9,
    availableTo: 17,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'room_102',
    name: 'Classroom A102',
    type: 'classroom',
    description: 'Standard classroom with projector',
    capacity: 45,
    location: 'Building A, Floor 1',
    availableFrom: 9,
    availableTo: 17,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'room_201',
    name: 'Lab L201',
    type: 'classroom',
    description: 'Computer Laboratory',
    capacity: 30,
    location: 'Building B, Floor 2',
    availableFrom: 9,
    availableTo: 17,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'equip_001',
    name: 'Projector Premium',
    type: 'equipment',
    description: 'High-resolution projector',
    location: 'Tech Store',
    availableFrom: 9,
    availableTo: 17,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'equip_002',
    name: 'Microphone System',
    type: 'equipment',
    description: 'Wireless microphone and speaker system',
    location: 'Tech Store',
    availableFrom: 9,
    availableTo: 17,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'equip_003',
    name: 'Laptop Cart',
    type: 'equipment',
    description: 'Mobile cart with 20 laptops',
    capacity: 20,
    location: 'Tech Store',
    availableFrom: 9,
    availableTo: 17,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'book_101',
    name: 'Advanced Algorithms',
    type: 'book',
    description: 'Comprehensive algorithms textbook',
    capacity: 3,
    location: 'Library, Section A',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'book_102',
    name: 'Database Systems',
    type: 'book',
    description: 'Database design and management',
    capacity: 2,
    location: 'Library, Section A',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'fac_001',
    name: 'Dr. John Smith',
    type: 'faculty_hours',
    description: 'Computer Science Department',
    department: 'Computer Science',
    location: 'Office B305',
    availableFrom: 9,
    availableTo: 17,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'fac_002',
    name: 'Prof. Sarah Johnson',
    type: 'faculty_hours',
    description: 'Mathematics Department',
    department: 'Mathematics',
    location: 'Office C402',
    availableFrom: 9,
    availableTo: 17,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export function ResourceProvider({ children }: { children: ReactNode }) {
  const [resources, setResources] = useState<Resource[]>(SEED_RESOURCES);

  // Initialize from localStorage on mount (with seed data as fallback)
  useEffect(() => {
    const stored = localStorage.getItem('resources');
    if (stored) {
      try {
        setResources(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse stored resources:', e);
        setResources(SEED_RESOURCES);
      }
    }
  }, []);

  // Save to localStorage whenever resources change
  useEffect(() => {
    localStorage.setItem('resources', JSON.stringify(resources));
  }, [resources]);

  const addResource = (resource: Omit<Resource, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newResource: Resource = {
      ...resource,
      id: `res_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setResources(prev => [...prev, newResource]);
  };

  const updateResource = (id: string, updates: Partial<Resource>) => {
    setResources(prev =>
      prev.map(resource =>
        resource.id === id
          ? {
              ...resource,
              ...updates,
              updatedAt: new Date().toISOString(),
            }
          : resource
      )
    );
  };

  const deleteResource = (id: string) => {
    setResources(prev => prev.filter(resource => resource.id !== id));
  };

  const getResourcesByType = (type: ResourceType): Resource[] => {
    return resources.filter(resource => resource.type === type);
  };

  const getResourceById = (id: string): Resource | undefined => {
    return resources.find(resource => resource.id === id);
  };

  return (
    <ResourceContext.Provider
      value={{
        resources,
        addResource,
        updateResource,
        deleteResource,
        getResourcesByType,
        getResourceById,
      }}
    >
      {children}
    </ResourceContext.Provider>
  );
}
