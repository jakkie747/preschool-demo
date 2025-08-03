

import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, writeBatch, doc, query, orderBy, updateDoc, deleteDoc, getDoc, where } from 'firebase/firestore';
import type { Child } from '@/lib/types';
import { promiseWithTimeout } from '@/lib/utils';
import { deleteImageFromUrl } from './storageService';

const TIMEOUT_DURATION = 15000; // 15 seconds

export const getChildren = async (): Promise<Child[]> => {
    if (!db) return [];
    try {
        const childrenCollectionRef = collection(db, 'children');
        const q = query(childrenCollectionRef, orderBy("name")); // Sorting by name
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Child));
    } catch (error: any) {
         if ((error as any).code === 'failed-precondition') {
            const message = (error as Error).message;
            console.error("Firebase Error: The following error message contains a link to create the required Firestore index. Please click the link to resolve the issue:", error);
            throw new Error(`A database index is required to sort children by name. Please open the browser console (F12) to find a link to create the required Firestore index, then refresh the page. Raw error: ${message}`);
        }
        console.error("Error fetching children:", error);
        throw new Error("Could not fetch children.");
    }
};

export const getChildById = async (childId: string): Promise<Child | null> => {
    if (!db) return null;
    try {
        const childDocRef = doc(db, 'children', childId);
        const docSnap = await getDoc(childDocRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as Child;
        }
        return null;
    } catch (error) {
        console.error("Error fetching child by ID:", error);
        throw new Error("Could not fetch child data.");
    }
}

export const getChildrenByParentEmail = async (email: string): Promise<Child[]> => {
    if (!db) return [];
    try {
        const childrenCollectionRef = collection(db, 'children');
        const afterschoolCollectionRef = collection(db, 'afterschoolChildren');

        const childrenQuery = query(childrenCollectionRef, where("parentEmail", "==", email));
        const afterschoolQuery = query(afterschoolCollectionRef, where("parentEmail", "==", email));
        
        const [childrenSnapshot, afterschoolSnapshot] = await promiseWithTimeout(
            Promise.all([
                getDocs(childrenQuery),
                getDocs(afterschoolQuery)
            ]),
            TIMEOUT_DURATION,
            new Error("Fetching children by parent email timed out. Check Firestore indexes.")
        );

        const preschoolChildren = childrenSnapshot.docs.map(doc => ({ id: doc.id, program: 'preschool', ...doc.data() } as Child));
        const afterschoolChildren = afterschoolSnapshot.docs.map(doc => ({ id: doc.id, program: 'afterschool', ...doc.data() } as Child));
        
        return [...preschoolChildren, ...afterschoolChildren];

    } catch (error: any) {
         if ((error as any).code === 'failed-precondition') {
            const message = (error as Error).message;
            console.error("Firebase Error: The following error message contains a link to create the required Firestore index. Please click the link to resolve the issue:", error);
            throw new Error(`A database index is required to query children by parent email. Please open the browser console (F12) to find a link to create the required Firestore index, then refresh this page. Raw error: ${message}`);
        }
        console.error("Error fetching children by parent email:", error);
        throw new Error("Could not fetch children for the logged in parent.");
    }
};

export const addChild = async (childData: Omit<Child, 'id'>): Promise<string> => {
    if (!db) throw new Error("Firebase is not configured.");
    const childrenCollectionRef = collection(db, 'children');
    const docRef = await promiseWithTimeout(
        addDoc(childrenCollectionRef, childData),
        TIMEOUT_DURATION,
        new Error("Adding child document timed out.")
    );
    return docRef.id;
};

export const addMultipleChildren = async (childrenData: Omit<Child, 'id'>[]): Promise<void> => {
    if (!db) throw new Error("Firebase is not configured.");
    if (childrenData.length === 0) return;

    const childrenCollectionRef = collection(db, 'children');
    const batch = writeBatch(db);

    childrenData.forEach(child => {
        const docRef = doc(childrenCollectionRef); // Create a new document reference with a unique ID
        batch.set(docRef, child);
    });

    await promiseWithTimeout(
        batch.commit(),
        TIMEOUT_DURATION * 3, // Allow more time for batch writes
        new Error("Batch adding children timed out.")
    );
};

export const updateChild = async (childId: string, childData: Partial<Omit<Child, 'id'>>): Promise<void> => {
    if (!db) throw new Error("Firebase is not configured.");
    const childDoc = doc(db, 'children', childId);
    await promiseWithTimeout(
        updateDoc(childDoc, childData),
        TIMEOUT_DURATION,
        new Error(`Updating child ${childId} timed out.`)
    );
};

export const deleteChild = async (childId: string): Promise<void> => {
    if (!db) throw new Error("Firebase is not configured.");
    const childDocRef = doc(db, 'children', childId);

    try {
        const docSnap = await getDoc(childDocRef);
        if (docSnap.exists()) {
            const childData = docSnap.data() as Child;
            if (childData.photo) {
                await deleteImageFromUrl(childData.photo);
            }
        }
    } catch (error) {
        console.error("Could not fetch child doc for photo deletion, but proceeding with Firestore delete.", error);
    }
    
    await promiseWithTimeout(
        deleteDoc(childDocRef),
        TIMEOUT_DURATION,
        new Error(`Deleting child ${childId} timed out.`)
    );
};

    