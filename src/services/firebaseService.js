import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    onSnapshot,
    query,
    orderBy,
    serverTimestamp
} from "firebase/firestore";
import { db } from "../firebase";

// Generic fetching with real-time updates (removed strict orderBy to prevent issues with missing fields)
export const subscribeToCollection = (collectionName, callback) => {
    const q = query(collection(db, collectionName));
    return onSnapshot(q, (snapshot) => {
        const items = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        // Sort manually if createdAt exists
        const sortedItems = items.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        callback(sortedItems);
    });
};

// Seed functionality to populate empty database
export const seedDatabase = async () => {
    const initialMenu = [
        { name: 'Low Sodium Chicken Broth', price: 12.00, ingredients: 'Chicken, Carrots, Celery', status: 'Available', dietary: 'Low Sodium' },
        { name: 'Steamed White Fish', price: 18.50, ingredients: 'Cod, Lemon, Steamed Veggies', status: 'Available', dietary: 'High Protein' },
        { name: 'Vegetable Puree', price: 10.00, ingredients: 'Potato, Spinach, Carrots', status: 'Available', dietary: 'Soft Diet' },
        { name: 'Whole Grain Salad', price: 14.00, ingredients: 'Quinoa, Lettuce, Cucumber', status: 'Available', dietary: 'Diabetic Friendly' }
    ];

    const initialStock = [
        { name: 'Medical Grade Oats', quantity: 50, unit: 'kg', status: 'In Stock' },
        { name: 'Fresh Protein (Cod)', quantity: 20, unit: 'kg', status: 'Low Stock' },
        { name: 'Vitamins / Supplements', quantity: 100, unit: 'units', status: 'In Stock' }
    ];

    for (const item of initialMenu) await addItem('menu', item);
    for (const item of initialStock) await addItem('stock', item);
};

// CRUD Operations
export const addItem = async (collectionName, item) => {
    return await addDoc(collection(db, collectionName), {
        ...item,
        createdAt: serverTimestamp()
    });
};

export const updateItem = async (collectionName, id, updates) => {
    const itemRef = doc(db, collectionName, id);
    return await updateDoc(itemRef, updates);
};

export const deleteItem = async (collectionName, id) => {
    const itemRef = doc(db, collectionName, id);
    return await deleteDoc(itemRef);
};
