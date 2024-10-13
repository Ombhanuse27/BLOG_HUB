import { db } from './firebase'; // Adjust the path if necessary
import { collection, getDocs } from 'firebase/firestore';

// Fetch categories from Firestore
export const fetchCategories = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'categories')); // Replace 'categories' with your actual collection name
    const categories = [];
    querySnapshot.forEach((doc) => {
      categories.push({ id: doc.id, ...doc.data() });
    });
    return categories;
  } catch (error) {
    console.error("Error fetching categories: ", error);
    throw new Error('Failed to fetch categories');
  }
};
