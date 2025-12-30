import { useContext } from 'react';
import { ResourceContext } from '@/context/ResourceContext';
import { ResourceContextType } from '@/types';

export function useResources(): ResourceContextType {
  const context = useContext(ResourceContext);
  if (!context) {
    throw new Error('useResources must be used within ResourceProvider');
  }
  return context;
}
