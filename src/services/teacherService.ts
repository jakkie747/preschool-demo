
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import type { Teacher } from '@/lib/types';
import { promiseWithTimeout } from '@/lib/utils';
import { deleteImageFromUrl } from './storageService';

const TIMEOUT_DURATION = 15000;

export const getTeachers = async (): Promise<Teacher[]> => {
    if (!db) return [];
    const teachersCollectionRef = collection(db, 'teachers');
    const snapshot = await getDocs(teachersCollectionRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Teacher));
};

export const addTeacher = async (uid: string, teacherData: Omit<Teacher, 'id' | 'uid'>): Promise<void> => {
    if (!db) throw new Error("Firebase is not configured.");
    const teacherDocRef = doc(db, 'teachers', uid);
    await promiseWithTimeout(
        setDoc(teacherDocRef, { ...teacherData, uid }),
        TIMEOUT_DURATION,
        new Error("Adding teacher document timed out.")
    );
};

export const updateTeacher = async (teacherId: string, teacherData: Partial<Omit<Teacher, 'id' | 'uid' | 'email'>>): Promise<void> => {
    if (!db) throw new Error("Firebase is not configured.");
    const teacherDocRef = doc(db, 'teachers', teacherId);
    await promiseWithTimeout(
        updateDoc(teacherDocRef, teacherData),
        TIMEOUT_DURATION,
        new Error(`Updating teacher document ${teacherId} timed out.`)
    );
};

export const getTeacherByUid = async (uid: string): Promise<Teacher | null> => {
    if (!db) return null;
    const teacherDocRef = doc(db, 'teachers', uid);
    const docSnap = await promiseWithTimeout(
        getDoc(teacherDocRef),
        TIMEOUT_DURATION,
        new Error("Fetching teacher by UID timed out.")
    );

    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Teacher;
    } else {
        return null;
    }
};

/**
 * Deletes a teacher's profile from Firestore and their photo from Storage.
 * This does NOT delete their Firebase Authentication record.
 */
export const deleteTeacherProfile = async (teacherId: string): Promise<void> => {
    if (!db) throw new Error("Firebase is not configured.");
    const teacherDocRef = doc(db, 'teachers', teacherId);

    try {
        const docSnap = await getDoc(teacherDocRef);
        if (docSnap.exists()) {
            const teacherData = docSnap.data() as Teacher;
            if (teacherData.photo) {
                // This will attempt to delete the photo but won't throw an error if it fails
                await deleteImageFromUrl(teacherData.photo);
            }
        }
    } catch (error) {
        console.error("Could not fetch teacher doc for photo deletion, but proceeding with Firestore delete.", error);
    }
    
    // Delete the Firestore document
    await promiseWithTimeout(
        deleteDoc(teacherDocRef),
        TIMEOUT_DURATION,
        new Error(`Deleting teacher profile for ${teacherId} timed out.`)
    );
};
