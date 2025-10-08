import { useMemo } from 'react';

import { mockDataApi } from '../services/mockData';


export const useStudentData = () => {
  return useMemo(() => {
    return mockDataApi.getCachedStudentData();
  }, []);
};

