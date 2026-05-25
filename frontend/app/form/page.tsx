'use client'
import React, {useEffect, useRef, useState} from "react";
import {usePlacesService} from "../map/useEffectsMap";
import {Libraries, useJsApiLoader} from "@react-google-maps/api";
import {googleMapsApiKey} from "../map/config";
import {MapProvider} from "../map/MapContext";
import {Box, Group, Loader, NumberInput, Radio, Select, Textarea, TextInput} from "@mantine/core";
import MapComponent from "../map/MapComponent";
import MarkerFormComponent from "../seller/MarkerFormComponent";
import Stepper, {Step} from "../components/Stepper/Stepper";
import AddressSearch from "../map/AddressSearch";
import {useForm} from "@mantine/form";
import {useAuthContext} from "../context/AuthContext";
import {getAuth, onAuthStateChanged} from "firebase/auth";
import firebase_app from "../firebase/firebase-config";
import {createMarker, recenterMap} from "../map/MapUtils";
import Link from "next/link";

const auth = getAuth(firebase_app);
const libraries: Libraries = ['places'];

export default function Page() {
    const [name, setName] = useState('');
    const mapRef = useRef<google.maps.Map | null>(null);
    const {isLoaded, loadError} = useJsApiLoader({
        googleMapsApiKey,
        libraries,
    });
    const placesServiceRef = usePlacesService(isLoaded, mapRef);
    const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
    const [loading, setLoading] = useState(false);
    const [searchResults, setSearchResults] = useState<google.maps.places.PlaceResult[]>([]);
    const [valueSearch, setValueSearch] = useState('');
    const [searchAddressResult, setSearchAddressResult] = useState<google.maps.places.PlaceResult[]>([]);
    const [searchAddressMarker, setSearchAddressMarker] = useState<{
        lat: number;
        lng: number;
        marker: google.maps.Marker
    }[]>([]);
    const [user, setUser] = useState<any | null>(null);
    const {user1} = useAuthContext();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (authUser) => {
            if (authUser) {
                setUser(authUser);
            } else {
                setUser(null);
            }
        });

        return () => unsubscribe();
    }, []);

    // Step 1 Form
    const step1Form = useForm({
        initialValues: {
            propertyType: "",
            transactionType: "renting",
        },
        validate: {
            propertyType: (value) => (value ? null : "Property type is required"),
            transactionType: (value) => (value ? null : "Transaction type is required"),
        },
    });

    // Step 2 Form
    const step2Form = useForm({
        initialValues: {
            location: "",
        },
        validate: {
            location: (value) => (value ? null : "Location is required"),
        },
    });

    // Step 3 Form
    const step3Form = useForm({
        initialValues: {
            rooms: 1,
            surface: 0,
        },
        validate: {
            rooms: (value) => (value > 0 ? null : "Number of rooms should be greater than 0"),
            surface: (value) => (value > 0 ? null : "Surface area should be greater than 0"),
        },
    });

    // Step 4 Form
    const step4Form = useForm({
        initialValues: {
            title: "",
            description: "",
        },
        validate: {
            title: (value) => (value ? null : "Title is required"),
            description: (value) => (value ? null : "Description is required"),
        },
    });

    // Step 5 Form
    const step5Form = useForm({
        initialValues: {
            price: 0,
        },
        validate: {
            price: (value) => (value > 0 ? null : "Price should be greater than 0"),
        },
    });

    const handleSubmit = () => {
        setLoading(true);

        const markerData = searchAddressMarker[0] ? {
            lat: searchAddressMarker[0].lat,
            lng: searchAddressMarker[0].lng,
        } : null;

        const finalValues = {
            ...step1Form.values,
            ...step2Form.values,
            ...step3Form.values,
            ...step4Form.values,
            ...step5Form.values,
        };

        setTimeout(async () => {
            try {
                const propertyId = Date.now().toString();
                console.log("Added data: propertyId: ", propertyId, " propertyType: ", finalValues.propertyType, " transactionType: ", finalValues.transactionType, " location: ", finalValues.location, " rooms: ", finalValues.rooms, " surface: ", finalValues.surface, " title: ", finalValues.title, " description: ", finalValues.description, " price: ", finalValues.price, " timestamp: ", new Date(), " userId: ", user?.uid, " userEmail: ", user?.email, " marker: ", markerData);

                step1Form.reset();
                step2Form.reset();
                step3Form.reset();
                step4Form.reset();
                step5Form.reset();
            } catch (error) {
                console.error("Error adding document: ", error);
            } finally {
                setLoading(false);
            }
        }, 1000);
    };

    const handleSearchResults = (results: google.maps.places.PlaceResult[]) => {
        searchAddressMarker.forEach((place) => place.marker.setMap(null));
        setSearchAddressMarker([]);

        if (results.length > 0) {
            const place = results[0];
            setSearchAddressResult(results);

            if (mapRef) {
                createMarker(place, mapRef.current, setSearchAddressMarker, infoWindowRef);
                recenterMap(mapRef, place.geometry?.location);
            }
        }
    };

    const validateStep = (step: number) => {
        switch (step) {
            case 1:
                return step1Form.validate().hasErrors === false;
            case 2:
                return step2Form.validate().hasErrors === false;
            case 3:
                return step3Form.validate().hasErrors === false;
            case 4:
                return step4Form.validate().hasErrors === false;
            case 5:
                return step5Form.validate().hasErrors === false;
            default:
                return true;
        }
    };

    if (!isLoaded) {
        return (
            <Box style={{display: "flex", justifyContent: "center", alignItems: "center", height: "600px"}}>
                <Loader/>
            </Box>
        );
    }

    return (
        <MapProvider
            mapRef={mapRef}
            placesServiceRef={placesServiceRef}
            isLoaded={isLoaded}
        >
            <div>
                <div className='justify-center align-center'>
                    <Link href="/">
                        <button className="mt-4 p-2 bg-blue-500 text-white rounded">Back to Home</button>
                    </Link>
                </div>
                <Group justify="center" grow>
                    <MapComponent userType="seller"/>
                    <MarkerFormComponent/>
                </Group>
            </div>
            <Stepper
                initialStep={1}
                onStepChange={(step) => {
                    console.log(step);
                }}
                onFinalStepCompleted={() => {
                    console.log("All steps completed!");
                    handleSubmit();
                }}
                backButtonText="Previous"
                nextButtonText="Next"
                validateStep={validateStep} // Pass the validateStep function
            >
                <Step>
                    <h2>Step 1</h2>
                    <form onSubmit={step1Form.onSubmit(() => {
                    })}>
                        <Select
                            label="Property Type"
                            placeholder="Select property type"
                            mb="sm"
                            data={["Apartment", "House", "Field", "Commercial", "Penthouse"]}
                            {...step1Form.getInputProps("propertyType")}
                            required
                        />
                        <Radio.Group
                            label="Transaction Type"
                            mb="sm"
                            {...step1Form.getInputProps("transactionType")}
                            required
                        >
                            <Radio value="selling" label="Selling" mb="xs"/>
                            <Radio value="renting" label="Renting" mb="xs"/>
                        </Radio.Group>
                    </form>
                </Step>
                <Step>
                    <h2>Step 2</h2>
                    <form onSubmit={step2Form.onSubmit(() => {
                    })}>
                        <AddressSearch
                            value={valueSearch}
                            onChange={(e) => {
                                const newValue = e.target.value;
                                setValueSearch(newValue);
                                step2Form.setFieldValue("location", newValue);
                            }}
                            placesServiceRef={placesServiceRef}
                            onSearchResults={handleSearchResults}
                        />
                    </form>
                </Step>
                <Step>
                    <h2>Step 3</h2>
                    <form onSubmit={step3Form.onSubmit(() => {
                    })}>
                        <NumberInput
                            label="Number of Rooms"
                            placeholder="Enter number of rooms"
                            mb="sm"
                            min={1}
                            {...step3Form.getInputProps("rooms")}
                            required
                        />
                        <NumberInput
                            label="Surface Area (sqm)"
                            placeholder="Enter surface area"
                            mb="sm"
                            min={1}
                            {...step3Form.getInputProps("surface")}
                            required
                        />
                    </form>
                </Step>
                <Step>
                    <h2>Step 4</h2>
                    <form onSubmit={step4Form.onSubmit(() => {
                    })}>
                        <TextInput
                            label="Title"
                            placeholder="Enter a title for your listing"
                            mb="sm"
                            {...step4Form.getInputProps("title")}
                            required
                        />
                        <Textarea
                            label="Short Description"
                            placeholder="Enter a brief description"
                            mb="sm"
                            {...step4Form.getInputProps("description")}
                            minRows={3}
                            required
                        />
                    </form>
                </Step>
                <Step>
                    <h2>Final Step</h2>
                    <p>You made it!</p>
                    <form onSubmit={step5Form.onSubmit(() => {
                    })}>
                        <NumberInput
                            label="Price (€)"
                            placeholder="Enter price"
                            mb="sm"
                            min={0}
                            step={100}
                            {...step5Form.getInputProps("price")}
                            required
                        />
                    </form>
                </Step>
            </Stepper>
        </MapProvider>
    );
}