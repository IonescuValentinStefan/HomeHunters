import {collection, doc, getDoc, getDocs, getFirestore, query} from 'firebase/firestore';
import firebase_app from '../firebase/firebase-config';
import {PropertyFirebase} from '@/types/Property';

const db = getFirestore(firebase_app);

export const getProperties = async () => {

    // Define the query to filter properties based on the userId
    const propertiesCollectionRef = collection(db, 'properties');
    const propertiesQuery = query(propertiesCollectionRef);

    // Fetch the filtered properties
    const querySnapshot = await getDocs(propertiesQuery);

    // Map through the filtered properties and return them
    return querySnapshot.docs.map((doc) => {
        const property = doc.data() as PropertyFirebase;

        return {
            id: doc.id,
            email: property.email,
            firstName: property.firstName,
            lastName: property.lastName,
            phone: property.phoneNumber,
            userEmail: property.userEmail,
            userId: property.userId,
            title: property.title,
            description: property.description,
            price: property.price,
            rooms: property.rooms,
            bathrooms: property.bathrooms,
            surfaceArea: property.surfaceArea,
            firstImage: property.photoUrls?.[0] || null,
            photoCount: property.photoCount,
            hasPhotos: (property.photoCount > 0),
            photoUrls: property.photoUrls || [],
            location: property.location,
            address: property.address,
            marker: property.marker,
            amenities: property.amenities || [],
            customAmenities: property.customAmenities,
            timestamp: property.timestamp,
            dateAdded: convertToSimpleDate(property.timestamp),
            furnished: property.furnished,
            transactionType: property.transactionType,
            propertyType: property.propertyType,
        };
    });


};

export const getApartmentById = async (id: string): Promise<(PropertyFirebase & { id: string }) | null> => {
    const docRef = doc(db, 'properties', id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return null;

    const property = docSnap.data() as PropertyFirebase;

    return {
        id: docSnap.id,
        dateAdded: convertToSimpleDate(property.timestamp),
        ...property,
    };
};

function convertToSimpleDate(input: any): Date {
    const dateObj = input instanceof Date ? input : input.toDate ? input.toDate() : new Date(input);

    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const day = String(dateObj.getDate()).padStart(2, "0");

    const formattedDate = `${year}-${month}-${day}`;
    return new Date(formattedDate);
}
