import { useMemo } from 'react';

import { getCachedStudentData } from '../services/mockData';
// import { Student, Class, HighlightList } from '../types';


export const useStudentData = () => {
  return useMemo(() => {
    return getCachedStudentData();
  }, []);
};

