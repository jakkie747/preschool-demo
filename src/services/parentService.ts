
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, writeBatch } from 'firebase/firestore';
import type { Child, Parent, LinkedChildInfo } from '@/lib/types';
import { promiseWithTimeout } from '@/lib/utils';

const TIMEOUT_DURATION = 20000; // 20 seconds for potentially large queries

export const getParents = async (): Promise<Parent[]> => {
    if (!db) return [];
    try {
        const childrenCollectionRef = collection(db, 'children');
        const afterschoolCollectionRef = collection(db, 'afterschoolChildren');
        
        const [childrenSnapshot, afterschoolSnapshot] = await Promise.all([
            getDocs(childrenCollectionRef),
            getDocs(afterschoolCollectionRef)
        ]);

        const parentsMap = new Map<string, Parent>();

        const processChildDoc = (doc: any, program: 'preschool' | 'afterschool') => {
            const child = { id: doc.id, ...doc.data() } as Child;
            if (!child.parentEmail) return;

            const linkedChildInfo: LinkedChildInfo = { id: child.id, name: child.name, program };

            if (parentsMap.has(child.parentEmail)) {
                const parent = parentsMap.get(child.parentEmail)!;
                // Add child if not already listed
                if (!parent.children.some(c => c.id === child.id)) {
                  parent.children.push(linkedChildInfo);
                }
                // Update parent details with most recent info
                parent.name = child.parent;
                parent.phone = child.parentPhone;
            } else {
                parentsMap.set(child.parentEmail, {
                    email: child.parentEmail,
                    name: child.parent,
                    phone: child.parentPhone,
                    children: [linkedChildInfo],
                });
            }
        };

        childrenSnapshot.docs.forEach(doc => processChildDoc(doc, 'preschool'));
        afterschoolSnapshot.docs.forEach(doc => processChildDoc(doc, 'afterschool'));
        
        const parents = Array.from(parentsMap.values());
        return parents.sort((a, b) => a.name.localeCompare(b.name));

    } catch (error) {
        console.error("Error fetching parents:", error);
        throw new Error("Could not fetch parent data.");
    }
};

export const updateParentDetails = async (email: string, newData: { name: string; phone: string }): Promise<void> => {
    if (!db) throw new Error("Firebase is not configured.");

    const batch = writeBatch(db);

    const childrenRef = collection(db, 'children');
    const afterschoolRef = collection(db, 'afterschoolChildren');

    const childrenQuery = query(childrenRef, where("parentEmail", "==", email));
    const afterschoolQuery = query(afterschoolRef, where("parentEmail", "==", email));

    try {
        const [childrenSnapshot, afterschoolSnapshot] = await promiseWithTimeout(
            Promise.all([
                getDocs(childrenQuery),
                getDocs(afterschoolQuery)
            ]),
            TIMEOUT_DURATION,
            new Error("Fetching parent's children timed out.")
        );
        
        const updatePayload = {
            parent: newData.name,
            parentPhone: newData.phone
        };

        childrenSnapshot.forEach(doc => {
            batch.update(doc.ref, updatePayload);
        });

        afterschoolSnapshot.forEach(doc => {
            batch.update(doc.ref, updatePayload);
        });

        await promiseWithTimeout(
            batch.commit(),
            TIMEOUT_DURATION,
            new Error("Updating parent details timed out.")
        );
    } catch (error) {
        console.error("Error updating parent details:", error);
        throw error;
    }
};
