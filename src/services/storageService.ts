
import { storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { promiseWithTimeout } from "@/lib/utils";

const TIMEOUT_DURATION = 15000; // 15 seconds

export const uploadImage = async (file: File, path: 'activities' | 'events' | 'children' | 'teachers' | 'documents' | 'reports'): Promise<string> => {
    if (!storage) {
        throw new Error("Firebase Storage is not configured. Please check your firebase.ts file.");
    }
    const filePath = `${path}/${Date.now()}-${file.name}`;
    const storageRef = ref(storage, filePath);
    
    await promiseWithTimeout(
        uploadBytes(storageRef, file), 
        TIMEOUT_DURATION, 
        new Error(`Image upload to ${filePath} timed out. Check storage rules and network.`)
    );

    const downloadUrl = await promiseWithTimeout(
        getDownloadURL(storageRef),
        TIMEOUT_DURATION,
        new Error(`Getting download URL for ${filePath} timed out.`)
    );
    return downloadUrl;
};

// Function to delete an image from a Firebase Storage URL
export const deleteImageFromUrl = async (url: string): Promise<void> => {
    // Don't try to delete placeholder images
    if (!url || !url.includes('firebasestorage.googleapis.com')) {
        return;
    }
    
    if (!storage) {
        // If storage isn't configured, we can't delete, so just exit gracefully.
        return;
    }
    
    try {
        const storageRef = ref(storage, url);
        await promiseWithTimeout(
            deleteObject(storageRef),
            TIMEOUT_DURATION,
            new Error(`Deleting image ${url} timed out.`)
        );
    } catch (error: any) {
        // If the file doesn't exist, we can ignore the error.
        if (error.code !== 'storage/object-not-found') {
            console.error("Error deleting image from storage:", error);
            // We don't re-throw, as failing to delete an old image shouldn't block the user flow.
        }
    }
};
