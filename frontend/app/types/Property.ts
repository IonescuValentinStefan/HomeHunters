export type PropertyFirebase = {
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    userEmail: string;
    userId: string;
    title: string;
    description: string;
    price: number;
    rooms: number;
    bathrooms: number;
    surfaceArea: number;
    photoUrls: string[];
    photoCount: number;
    location: string;
    address: string;
    marker: any;
    amenities?: string[];
    customAmenities?: string[];
    timestamp: any;
    furnished: boolean;
    transactionType: string;
    propertyType: string;
};

type PropertyWebsite = {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    userEmail: string;
    userId: string;
    title: string;
    description: string;
    price: number;
    rooms: number;
    bathrooms: number;
    surfaceArea: number;
    firstImage?: string | null;
    photoCount?: number;
    hasPhotos?: boolean;
    photoUrls?: string[];
    location?: any; // Adjust type as needed
    address: string;
    marker?: any; // Adjust type as needed
    amenities?: string[];
    customAmenities?: string[];
    timestamp?: any; // Adjust type as needed
    dateAdded?: Date | null;
    furnished?: boolean | null;
    transactionType?: string | null;
    propertyType?: string | null;
}

export function convertFirebaseToWebsite(property: PropertyFirebase): PropertyWebsite {
    return {
        id: "",
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
        photoUrls: property.photoUrls,
        photoCount: property.photoCount,
        hasPhotos: property.photoUrls.length > 0,
        firstImage: property.photoUrls.length > 0 ? property.photoUrls[0] : null,
        location: property.location,
        address: property.address,
        marker: property.marker,
        amenities: property.amenities,
        customAmenities: property.customAmenities,
        timestamp: property.timestamp,
        dateAdded: property.timestamp?.toDate?.() ?? null,
        furnished: property.furnished ?? null,
        transactionType: property.transactionType ?? null,
        propertyType: property.propertyType ?? null
    };
}
