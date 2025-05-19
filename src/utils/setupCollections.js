import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase/config';

// Initialize collections for a student
export const setupStudentCollections = async (studentId) => {
  try {
    // Check if student has any existing data
    const collections = ['jobApplications', 'webinarAttendance', 'sessions'];
    let hasData = false;

    // Check each collection for existing data
    for (const collectionName of collections) {
      const q = query(
        collection(db, collectionName),
        where('studentId', '==', studentId)
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        hasData = true;
        break;
      }
    }

    // If student already has data, no need to initialize
    if (hasData) {
      console.log('Student already has data:', studentId);
      return;
    }

    // If no data exists, let collections start empty
    console.log('Initialized empty collections for student:', studentId);
  } catch (error) {
    console.error('Error checking student collections:', error);
    throw error;
  }
};