"use client"

import React, {useEffect, useRef, useState} from "react"
import {useForm} from "react-hook-form"
import {z} from "zod"
import {zodResolver} from "@hookform/resolvers/zod"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Textarea} from "@/components/ui/textarea"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form"
import {Progress} from "@/components/ui/progress"
import {Calculator, Check, ChevronLeft, ChevronRight, Plus, X} from "lucide-react"
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert"
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group"
import {Checkbox} from "@/components/ui/checkbox"
import {Switch} from "@/components/ui/switch"
import {Badge} from "@/components/ui/badge"
import {Label} from "@/components/ui/label"
import addData from "../firestore/addData";
import {getAuth} from "firebase/auth";
import {getDownloadURL, getStorage, ref as createStorageRef, uploadBytesResumable} from "firebase/storage";
import firebase_app from "../firebase/firebase-config";
import {Card, CardContent} from "@/components/ui/card"
import axios from "axios";
import AddressSearch from "@/map/AddressSearch";
import GoogleMapComponent from "@/map/GoogleMapComponent";
import {MapProvider} from "@/map/MapContext";
import {Libraries, useJsApiLoader} from "@react-google-maps/api";
import {googleMapsApiKey} from "@/map/config";
import {useRouter} from "next/navigation";

const storage = getStorage(firebase_app);

const amenityOptions = [
    {id: "elevator", label: "Elevator"},
    {id: "parking", label: "Parking"},
    {id: "balcony", label: "Balcony"},
    {id: "garden", label: "Garden"},
    {id: "gym", label: "Gym"},
    {id: "pool", label: "Pool"},
    {id: "air-conditioning", label: "Air Conditioning"},
    {id: "heating", label: "Heating"},
    {id: "pet-friendly", label: "Pet Friendly"},
    {id: "wifi", label: "Wi-Fi included"},
    {id: "dishwasher-washing", label: "Dishwasher / Washing machine"},
]

// Form schemas for each step
const personalInfoSchema = z.object({
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    phone: z.string().min(10, "Please enter a valid phone number"),
})

const propertyInfoSchema = z.object({
    propertyType: z.string().min(1, "Please select a property type"),
    transactionType: z.string().min(1, "Please select a transaction type"),
    furnished: z.string().min(1, "Please select if the property is furnished"),
    address: z.string().min(5, "Address must be at least 5 characters"),
    rooms: z.coerce.number().min(1, "Property must have at least 1 room"),
    bathrooms: z.coerce.number().min(1, "Property must have at least 1 bathroom"),
    surfaceArea: z.coerce.number().min(1, "Surface area must be at least 1 sqm"),
    amenities: z.array(z.string()).optional(),
    customAmenities: z.array(z.string()).optional(),
})

const listingDetailsSchema = z.object({
    title: z.string().min(5, "Title must be at least 5 characters"),
    description: z.string().min(20, "Description must be at least 20 characters"),
    price: z.coerce.number().positive("Price must be a positive number")
    // Note: We're not validating photos here as they would be handled separately in a real implementation
})

const formSchema = personalInfoSchema
    .merge(propertyInfoSchema)
    .merge(listingDetailsSchema)
    .extend({
        wantPriceSuggestion: z.boolean().optional(),
    });


type FormValues = z.infer<typeof formSchema>


interface SellerFormProps {
    location: { lat: number; lng: number } | null
    setLocation: (location: { lat: number; lng: number } | null) => void
}

const auth = getAuth(firebase_app);
const user = auth.currentUser;
const libraries: Libraries = ['places'];

export default function SellerForm({location, setLocation}: SellerFormProps) {
    const router = useRouter();

    const [step, setStep] = useState(1)
    const totalSteps = 3
    const progress = (step / totalSteps) * 100
    const [customAmenity, setCustomAmenity] = useState("")
    const [photos, setPhotos] = useState([]);
    const [photoCount, setPhotoCount] = useState(0)
    const [loading, setLoading] = useState(false) // Add loading state
    const [success, setSuccess] = useState(false) // Add success state
    const [photoUrls, setPhotoUrls] = useState<string[]>([]);
    const [suggestedPrice, setSuggestedPrice] = useState<number | null>(null)
    const [isCalculatingPrice, setIsCalculatingPrice] = useState(false)

    const [searchValue, setSearchValue] = useState("")
    // const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)

    const mapRef = useRef<google.maps.Map | null>(null)
    const placesServiceRef = useRef<google.maps.places.PlacesService | null>(null)

    const handleSearchResults = (results: google.maps.places.PlaceResult[]) => {
        const result = results[0]
        if (result?.geometry?.location) {
            const latLng = {
                lat: result.geometry.location.lat(),
                lng: result.geometry.location.lng(),
            }
            setLocation(latLng)
            form.setValue("location", latLng)
            if (mapRef.current) {
                mapRef.current.panTo(latLng)
            }
        }
    }

    const handleMapClick = (e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
            const latLng = {
                lat: e.latLng.lat(),
                lng: e.latLng.lng(),
            }
            setLocation(latLng)
            form.setValue("location", latLng)
        }
    }

    const handleUseCurrentLocation = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const currentLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                };
                setLocation(currentLocation); // setezi starea externă
                form.setValue("location", currentLocation); // salvezi și în formular
                if (mapRef.current) {
                    mapRef.current.panTo(currentLocation);
                }
            },
            (error) => {
                console.error("Geolocation error:", error);
                alert("Could not retrieve your location");
            }
        );
    };


    const {isLoaded, loadError} = useJsApiLoader({
        googleMapsApiKey,
        libraries,
    });

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            phone: "0712345678",
            propertyType: "apartment",
            transactionType: "renting",
            furnished: "furnished",
            address: "123 St",
            rooms: 2,
            bathrooms: 1,
            surfaceArea: 50,
            amenities: ["wifi", "air-conditioning"],
            customAmenities: ["Near subway", "Pet area"],
            title: "Modern Apartment for Rent",
            description: "Spacious and bright apartment in a quiet neighborhood...",
            price: 0,
            wantPriceSuggestion: false,
        },
        mode: "onChange",
    })

    const auth = getAuth(firebase_app);
    const user = auth.currentUser;

    useEffect(() => {
        if (user) {
            if (!form.getValues("firstName")) {
                const displayName = user.displayName || "";
                const [firstName, lastName] = displayName.split(" ");
                form.setValue("firstName", firstName || "Marius");
                form.setValue("lastName", lastName || "Marin");
            }

            if (!form.getValues("email")) {
                form.setValue("email", user.email || "marius@gmail.com");
            }
        }
    }, [user, form]);

    const calculateSuggestedPrice = async () => {
        setIsCalculatingPrice(true)

        const formData = form.getValues()

        try {
            const res = await axios.post(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/price`,
                formData,
                {
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );

            console.log(res.data);

            setSuggestedPrice(parseFloat(res.data))
            setIsCalculatingPrice(false)
        } catch (error) {
            console.error('Error calling API:', error);
        }
    }

    // Watch for changes to wantPriceSuggestion
    useEffect(() => {
        const subscription = form.watch((value, {name}) => {
            if (name === "wantPriceSuggestion" && value.wantPriceSuggestion) {
                calculateSuggestedPrice()
                    .then(r => console.log("Price suggestion calculated:", suggestedPrice))
                    .catch(error => console.error("Error calculating price suggestion:", error))
            }
        })

        return () => subscription.unsubscribe()
    }, [form.watch])

    // Apply suggested price to form
    const applyPriceSuggestion = () => {
        if (suggestedPrice) {
            form.setValue("price", suggestedPrice)
        }
    }

    const nextStep = async () => {
        let schemaToValidate

        if (step === 1) {
            schemaToValidate = personalInfoSchema
        } else if (step === 2) {
            schemaToValidate = propertyInfoSchema
        }

        if (schemaToValidate) {
            const result = await form.trigger(Object.keys(schemaToValidate.shape) as any)
            if (result) {
                setStep(step + 1)
            }
        }
    }

    const prevStep = () => {
        setStep(step - 1)
    }

    const addCustomAmenity = () => {
        if (customAmenity.trim() === "") return

        const currentCustomAmenities = form.getValues().customAmenities || []
        form.setValue("customAmenities", [...currentCustomAmenities, customAmenity])
        setCustomAmenity("")
    }

    const removeCustomAmenity = (index: number) => {
        const currentCustomAmenities = form.getValues().customAmenities || []

        form.setValue(
            "customAmenities",
            currentCustomAmenities.filter((_, i) => i !== index),
        )
    }

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files) {
            const fileArray = Array.from(files);
            setPhotos(fileArray);
            setPhotoCount(fileArray.length);
        }
    };

    const onSubmit = async (data: FormValues) => {
        if (!location) {
            alert("Please set property location before submitting");
            return;
        }

        setLoading(true);
        console.log("Submitting form...");
        console.log("Location:", location);

        // const markerData = {
        //     position: location,
        //     propertyType: data.propertyType,
        //     price: data.price,
        //     rooms: data.rooms,
        //     surface: data.surfaceArea,
        // };

        const photoUrls: string[] = [];

        try {
            if (photoCount === 0) {
                console.log("No photos uploaded. Using default Firebase image.");
                try {
                    const defaultRef = createStorageRef(storage, "property_photos/property_default.jpg");
                    const defaultUrl = await getDownloadURL(defaultRef);
                    photoUrls.push(defaultUrl);
                } catch (error) {
                    console.error("Failed to get default photo URL:", error);
                    alert("Error getting default photo. Please try again.");
                    setLoading(false);
                    return;
                }
            } else {
                const uploadPromises = photos.map((file) => {
                    console.log(`Uploading photo: ${file.name}`);
                    const fileRef = createStorageRef(storage, `property_photos/${file.name}`);
                    const uploadTask = uploadBytesResumable(fileRef, file);

                    return new Promise<void>((resolve, reject) => {
                        uploadTask.on(
                            "state_changed",
                            null,
                            (error) => {
                                console.error("Upload error:", error);
                                reject(error);
                            },
                            async () => {
                                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                                photoUrls.push(downloadURL);
                                resolve();
                            }
                        );
                    });
                });

                console.log("Uploading photos...");
                await Promise.all(uploadPromises);
            }

            const propertyId = Date.now().toString();
            console.log(`Generated property ID: ${propertyId}`);

            await addData("properties", propertyId, {
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                phone: data.phone,
                propertyType: data.propertyType,
                transactionType: data.transactionType,
                furnished: data.furnished,
                address: data.address,
                rooms: data.rooms,
                bathrooms: data.bathrooms,
                surfaceArea: data.surfaceArea,
                amenities: data.amenities,
                customAmenities: data.customAmenities,
                location,
                title: data.title,
                description: data.description,
                price: data.price,
                photoCount: photoUrls.length,
                photoUrls,
                timestamp: new Date(),
                userId: user?.uid,
                userEmail: user?.email,
                // marker: markerData,
            });

            console.log("Property saved successfully!");
            setSuccess(true);

            setTimeout(() => {
                router.push("/seller-dashboard");
            }, 2000);

        } catch (error) {
            console.error("Submission failed:", error);
            alert("There was an error submitting your listing. Please try again.");
        } finally {
            setLoading(false);
        }
    };


    return (
        <MapProvider
            mapRef={mapRef}
            placesServiceRef={placesServiceRef}
            isLoaded={isLoaded}
        >
            <div className="space-y-6">
                {success ? (
                    <Alert className="bg-green-50 text-green-800 border-green-200">
                        <Check className="h-4 w-4"/>
                        <AlertTitle>Success!</AlertTitle>
                        <AlertDescription>
                            Your property listing has been submitted successfully.
                        </AlertDescription>
                    </Alert>
                ) : (
                    <>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">
                        Step {step} of {totalSteps}
                    </span>
                                <span className="text-sm font-medium">{Math.round(progress)}% complete</span>
                            </div>
                            <Progress value={progress} className="h-2"/>
                        </div>

                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                {step === 1 && (
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-medium">Contact Information</h3>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="firstName"
                                                render={({field}) => (
                                                    <FormItem>
                                                        <FormLabel>First Name *</FormLabel>
                                                        <FormControl>
                                                            {<Input placeholder="John" {...field} /> as React.ReactNode}
                                                        </FormControl>
                                                        <FormMessage/>
                                                    </FormItem>
                                                )}
                                            />


                                            <FormField
                                                control={form.control}
                                                name="lastName"
                                                render={({field}) => (
                                                    <FormItem>
                                                        <FormLabel>Last Name *</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Doe" {...field} />
                                                        </FormControl>
                                                        <FormMessage/>
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <FormField
                                            control={form.control}
                                            name="email"
                                            render={({field}) => (
                                                <FormItem>
                                                    <FormLabel>Email Address *</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="john.doe@example.com"
                                                               type="email" {...field} />
                                                    </FormControl>
                                                    <FormMessage/>
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            // control={form.control}
                                            name="phone"
                                            render={({field}) => (
                                                <FormItem>
                                                    <FormLabel>Phone Number *</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="(123) 456-7890" {...field} />
                                                    </FormControl>
                                                    <FormMessage/>
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                )}

                                {step === 2 && (
                                    <div className="space-y-6">
                                        <h3 className="text-lg font-medium">Property Information</h3>

                                        <div className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <FormField
                                                    control={form.control}
                                                    name="propertyType"
                                                    render={({field}) => (
                                                        <FormItem>
                                                            <FormLabel>Property Type *</FormLabel>
                                                            <Select onValueChange={field.onChange}
                                                                    defaultValue={field.value}>
                                                                <FormControl>
                                                                    <SelectTrigger>
                                                                        <SelectValue
                                                                            placeholder="Select property type"/>
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent>
                                                                    <SelectItem value="apartment">Apartment</SelectItem>
                                                                    <SelectItem value="house">House</SelectItem>
                                                                    <SelectItem value="studio">Studio</SelectItem>
                                                                    <SelectItem value="penthouse">Penthouse</SelectItem>
                                                                    <SelectItem value="loft">Loft</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                            <FormMessage/>
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name="transactionType"
                                                    render={({field}) => (
                                                        <FormItem>
                                                            <FormLabel>Transaction Type *</FormLabel>
                                                            <Select onValueChange={field.onChange}
                                                                    defaultValue={field.value}>
                                                                <FormControl>
                                                                    <SelectTrigger>
                                                                        <SelectValue
                                                                            placeholder="Select transaction type"/>
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent>
                                                                    <SelectItem value="selling">Selling</SelectItem>
                                                                    <SelectItem value="renting">Renting</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                            <FormMessage/>
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            <FormField
                                                control={form.control}
                                                name="furnished"
                                                render={({field}) => (
                                                    <FormItem>
                                                        <FormLabel>Furnished Status *</FormLabel>
                                                        <FormControl>
                                                            <RadioGroup
                                                                onValueChange={field.onChange}
                                                                defaultValue={field.value}
                                                                className="flex flex-col space-y-1 sm:flex-row sm:space-y-0 sm:space-x-4"
                                                            >
                                                                <div className="flex items-center space-x-2">
                                                                    <RadioGroupItem value="furnished" id="furnished"/>
                                                                    <Label htmlFor="furnished">Furnished</Label>
                                                                </div>
                                                                <div className="flex items-center space-x-2">
                                                                    <RadioGroupItem value="unfurnished"
                                                                                    id="unfurnished"/>
                                                                    <Label htmlFor="unfurnished">Unfurnished</Label>
                                                                </div>
                                                                <div className="flex items-center space-x-2">
                                                                    <RadioGroupItem value="partially-furnished"
                                                                                    id="partially-furnished"/>
                                                                    <Label htmlFor="partially-furnished">Partially
                                                                        Furnished</Label>
                                                                </div>
                                                            </RadioGroup>
                                                        </FormControl>
                                                        <FormMessage/>
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="address"
                                                render={({field}) => (
                                                    <FormItem>
                                                        <FormLabel>Property Address *</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                placeholder="123 Main St, City, State, Zip" {...field} />
                                                        </FormControl>
                                                        <FormMessage/>
                                                    </FormItem>
                                                )}
                                            />

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <FormField
                                                    control={form.control}
                                                    name="rooms"
                                                    render={({field}) => (
                                                        <FormItem>
                                                            <FormLabel>Number of Rooms *</FormLabel>
                                                            <FormControl>
                                                                <Input type="number" min="1" {...field} />
                                                            </FormControl>
                                                            <FormMessage/>
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name="bathrooms"
                                                    render={({field}) => (
                                                        <FormItem>
                                                            <FormLabel>Number of Bathrooms *</FormLabel>
                                                            <FormControl>
                                                                <Input type="number" min="1" {...field} />
                                                            </FormControl>
                                                            <FormMessage/>
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name="surfaceArea"
                                                    render={({field}) => (
                                                        <FormItem>
                                                            <FormLabel>Surface Area (sqm) *</FormLabel>
                                                            <FormControl>
                                                                <Input type="number" min="1" {...field} />
                                                            </FormControl>
                                                            <FormMessage/>
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            <div className="space-y-3">
                                                <div>
                                                    <h4 className="text-sm font-medium mb-1">Amenities</h4>
                                                    <p className="text-sm text-muted-foreground mb-3">
                                                        Select all amenities that apply to your property
                                                    </p>

                                                    <FormField
                                                        control={form.control}
                                                        name="amenities"
                                                        render={({field}) => (
                                                            <FormItem>
                                                                <div
                                                                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                                                    {amenityOptions.map((amenity) => (
                                                                        <div key={amenity.id}
                                                                             className="flex items-center space-x-2">
                                                                            <Checkbox
                                                                                id={`amenity-${amenity.id}`}
                                                                                checked={field.value?.includes(amenity.id)}
                                                                                onCheckedChange={(checked) => {
                                                                                    const currentValue = field.value || []
                                                                                    return checked
                                                                                        ? field.onChange([...currentValue, amenity.id])
                                                                                        : field.onChange(currentValue.filter((value) => value !== amenity.id))
                                                                                }}
                                                                            />
                                                                            <Label
                                                                                htmlFor={`amenity-${amenity.id}`}>{amenity.label}</Label>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                                <FormMessage/>
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>

                                                <div className="pt-2">
                                                    <Label className="text-sm">Custom Amenities</Label>
                                                    <p className="text-xs text-muted-foreground mb-2">Add any additional
                                                        amenities
                                                        not listed above</p>
                                                    <div className="flex items-center mt-2 space-x-2">
                                                        <Input
                                                            placeholder="Enter custom amenity"
                                                            value={customAmenity}
                                                            onChange={(e) => setCustomAmenity(e.target.value)}
                                                            className="flex-1"
                                                        />
                                                        <Button type="button" size="sm" onClick={addCustomAmenity}
                                                                disabled={customAmenity.trim() === ""}>
                                                            <Plus className="h-4 w-4 mr-1"/> Add
                                                        </Button>
                                                    </div>

                                                    {form.watch("customAmenities")?.length > 0 && (
                                                        <div className="flex flex-wrap gap-2 mt-3">
                                                            {form.watch("customAmenities")?.map((amenity, index) => (
                                                                <Badge key={index} variant="secondary"
                                                                       className="flex items-center gap-1">
                                                                    {amenity}
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => removeCustomAmenity(index)}
                                                                        className="text-muted-foreground hover:text-foreground"
                                                                    >
                                                                        <X className="h-3 w-3"/>
                                                                    </button>
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4 pt-4 border-t">
                                            <h4 className="font-medium">Property Location</h4>
                                            {/*<div className="h-[400px] w-full rounded-md overflow-hidden border">*/}
                                            {/*    <LocationMap location={location} setLocation={setLocation}/>*/}
                                            {/*</div>*/}
                                            <div className="space-y-4">
                                                <AddressSearch
                                                    value={searchValue}
                                                    onChange={(e) => setSearchValue(e.target.value)}
                                                    placesServiceRef={placesServiceRef}
                                                    onSearchResults={handleSearchResults}
                                                />

                                                <div className="h-[400px] w-full rounded-md overflow-hidden border">
                                                    <GoogleMapComponent
                                                        markers={location ? [{
                                                            location,
                                                            price: 0,
                                                            rooms: "",
                                                            title: "Selected Location",
                                                            surfaceArea: 0
                                                        }] : []}
                                                        userLocation={location}
                                                        showUserLocation={false}
                                                        onMapLoad={(map) => {
                                                            mapRef.current = map
                                                            if (!placesServiceRef.current) {
                                                                placesServiceRef.current = new google.maps.places.PlacesService(map)
                                                            }
                                                        }}
                                                    />
                                                </div>
                                            </div>

                                            <Button
                                                type="button"
                                                onClick={handleUseCurrentLocation}
                                                className="bg-blue-600 hover:bg-blue-700 text-white"
                                            >
                                                Use My Current Location
                                            </Button>

                                            {location && (
                                                <div className="p-3 bg-muted rounded-md">
                                                    <p className="text-sm font-medium">Selected Location:</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        Latitude: {location.lat.toFixed(6)},
                                                        Longitude: {location.lng.toFixed(6)}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {step === 3 && (
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-medium">Listing Details</h3>

                                        <FormField
                                            control={form.control}
                                            name="title"
                                            render={({field}) => (
                                                <FormItem>
                                                    <FormLabel>Listing Title *</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="e.g., Spacious 2-Bedroom Apartment with Amazing View" {...field} />
                                                    </FormControl>
                                                    <FormMessage/>
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="description"
                                            render={({field}) => (
                                                <FormItem>
                                                    <FormLabel>Property Description *</FormLabel>
                                                    <FormControl>
                                                        <Textarea
                                                            placeholder="Describe your property in detail, including features, amenities, and neighborhood..."
                                                            className="min-h-[150px]"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage/>
                                                </FormItem>
                                            )}
                                        />

                                        <div className="space-y-4">
                                            <FormField
                                                control={form.control}
                                                name="wantPriceSuggestion"
                                                render={({field}) => (
                                                    <FormItem
                                                        className="flex flex-row items-center justify-between rounded-lg border p-4 mb-4">
                                                        <div className="space-y-0.5">
                                                            <FormLabel className="text-base">Need help with
                                                                pricing?</FormLabel>
                                                            <FormDescription>
                                                                Let us suggest a competitive price based on your
                                                                property
                                                                details
                                                            </FormDescription>
                                                        </div>
                                                        <FormControl>
                                                            <Switch checked={field.value}
                                                                    onCheckedChange={field.onChange}/>
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />

                                            {form.watch("wantPriceSuggestion") && (
                                                <Card className="mb-4 bg-muted/30">
                                                    <CardContent className="pt-6">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <Calculator className="h-5 w-5 text-primary"/>
                                                            <h4 className="font-medium">Price Suggestion</h4>
                                                        </div>

                                                        {isCalculatingPrice ? (
                                                            <div
                                                                className="py-4 flex flex-col items-center justify-center">
                                                                <div
                                                                    className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin mb-2"></div>
                                                                <p className="text-sm text-muted-foreground">Calculating
                                                                    optimal
                                                                    price...</p>
                                                            </div>
                                                        ) : suggestedPrice ? (
                                                            <div className="space-y-3">
                                                                <div
                                                                    className="flex flex-col items-center sm:flex-row sm:justify-between sm:items-baseline gap-2 py-2">
                                                                    <div>
                                                                        <p className="text-sm text-muted-foreground">Our
                                                                            suggested
                                                                            price:</p>
                                                                        <p className="text-2xl font-bold text-primary">
                                                                            €{suggestedPrice.toLocaleString()}
                                                                            <span
                                                                                className="text-sm font-normal text-muted-foreground ml-1">
                                                                              {form.watch("transactionType") === "renting" ? "/month" : ""}
                                                                            </span>
                                                                        </p>
                                                                    </div>
                                                                    <Button type="button" onClick={applyPriceSuggestion}
                                                                            size="sm">
                                                                        Use This Price
                                                                    </Button>
                                                                </div>
                                                                <p className="text-xs text-muted-foreground">
                                                                    This price is calculated based on your property
                                                                    details,
                                                                    location, and current market
                                                                    trends. You can still set your own price below.
                                                                </p>
                                                            </div>
                                                        ) : (
                                                            <p className="py-2 text-sm text-muted-foreground">
                                                                We couldn't calculate a price suggestion. Please make
                                                                sure
                                                                you've
                                                                filled out all property
                                                                details.
                                                            </p>
                                                        )}
                                                    </CardContent>
                                                </Card>
                                            )}

                                            <FormField
                                                control={form.control}
                                                name="price"
                                                render={({field}) => (
                                                    <FormItem>
                                                        <FormLabel>Price *</FormLabel>
                                                        <FormControl>
                                                            <div className="relative">
                                                        <span
                                                            className="absolute left-3 top-1/2 -translate-y-1/2">€</span>
                                                                <Input type="number" min="0"
                                                                       className="pl-7" {...field} />
                                                            </div>
                                                        </FormControl>
                                                        <FormDescription>
                                                            {form.watch("transactionType") === "renting"
                                                                ? "Enter the monthly rental price"
                                                                : "Enter the selling price"}
                                                        </FormDescription>
                                                        <FormMessage/>
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <div className="space-y-4 pt-4 border-t">
                                            <h4 className="font-medium">Additional Information</h4>

                                            <div className="space-y-4">

                                                <div className="space-y-2">
                                                    <Label>Property Photos (optional)</Label>
                                                    <div className="grid gap-2">
                                                        <div className="flex items-center justify-center w-full">
                                                            <label
                                                                htmlFor="property-photos"
                                                                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted"
                                                            >
                                                                <div
                                                                    className="flex flex-col items-center justify-center pt-5 pb-6">
                                                                    <svg
                                                                        className="w-8 h-8 mb-3 text-muted-foreground"
                                                                        aria-hidden="true"
                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                        fill="none"
                                                                        viewBox="0 0 20 16"
                                                                    >
                                                                        <path
                                                                            stroke="currentColor"
                                                                            strokeLinecap="round"
                                                                            strokeLinejoin="round"
                                                                            strokeWidth="2"
                                                                            d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                                                                        />
                                                                    </svg>
                                                                    <p className="mb-1 text-sm text-muted-foreground">
                                                                <span
                                                                    className="font-semibold">Click to upload</span> or
                                                                        drag and drop
                                                                    </p>
                                                                    <p className="text-xs text-muted-foreground">PNG,
                                                                        JPG or
                                                                        WEBP
                                                                        (MAX. 10MB per image)</p>
                                                                </div>
                                                                <input
                                                                    id="property-photos"
                                                                    type="file"
                                                                    className="hidden"
                                                                    multiple
                                                                    accept="image/*"
                                                                    onChange={handleFileChange}
                                                                />
                                                            </label>
                                                        </div>
                                                        {photoCount > 0 && (
                                                            <p className="text-sm text-muted-foreground">
                                                                {photoCount} {photoCount === 1 ? "photo" : "photos"} selected
                                                            </p>
                                                        )}
                                                        <p className="text-xs text-muted-foreground">
                                                            High-quality photos significantly increase interest in your
                                                            property
                                                            listing
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {!location && (
                                            <div
                                                className="p-4 border border-yellow-200 bg-yellow-50 rounded-md text-yellow-800">
                                                <p className="text-sm">
                                                    Warning: You haven't set your property location yet. Please go back
                                                    to the
                                                    Property Information step
                                                    to set the location before submitting.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="flex justify-between pt-4">
                                    <Button type="button" variant="outline" onClick={prevStep}
                                            disabled={step === 1 || loading}>
                                        <ChevronLeft className="h-4 w-4 mr-2"/>
                                        Previous
                                    </Button>

                                    {step < totalSteps ? (
                                        <Button type="button" onClick={nextStep} disabled={loading}>
                                            Next
                                            <ChevronRight className="h-4 w-4 ml-2"/>
                                        </Button>
                                    ) : (
                                        <Button type="submit" disabled={!location || !user || loading}>
                                            {loading ? (
                                                <>
                                                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
                                                         xmlns="http://www.w3.org/2000/svg" fill="none"
                                                         viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10"
                                                                stroke="currentColor"
                                                                strokeWidth="4"></circle>
                                                        <circle className="opacity-25" cx="12" cy="12" r="10"
                                                                stroke="currentColor"
                                                                strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor"
                                                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Submitting...
                                                </>
                                            ) : (
                                                <>
                                                    <Check className="h-4 w-4 mr-2"/>
                                                    Submit Listing
                                                </>
                                            )}
                                        </Button>
                                    )}
                                </div>
                            </form>
                        </Form>
                    </>
                )}
            </div>
        </MapProvider>
    )
}