import React, {useEffect, useRef, useState} from "react";
import {useForm} from "@mantine/form";
import {
    Box,
    Button,
    Card,
    Container,
    Group,
    Loader,
    NumberInput,
    Radio,
    Select,
    Textarea,
    TextInput,
    Title
} from "@mantine/core";
import AddressSearch from "../map/AddressSearch";
import {Libraries} from "@react-google-maps/api";
import {createMarker, recenterMap} from "../map/MapUtils";
import addData from "../firestore/addData";
import {getAuth, onAuthStateChanged} from "firebase/auth";
import firebase_app from '../firebase/firebase-config';
import {useAuthContext} from "../context/AuthContext";
import {useMapContext} from '../map/MapContext';

const auth = getAuth(firebase_app);
const libraries: Libraries = ["places"];

export default function RentingForm() {
    // Global context for isLoaded, mapRef, and placesServiceRef
    // const { isLoaded, mapRef, placesServiceRef, setMapRef, setPlacesServiceRef } = useGlobalState(); // Access global state

    const {mapRef, placesServiceRef, isLoaded} = useMapContext();
    // const mapRef = useRef<google.maps.Map | null>(null);
    const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);

    // Load the Google Maps API
    // const {isLoaded, loadError} = useJsApiLoader({
    //     googleMapsApiKey,
    //     libraries,
    // });

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

    // Ensure placesServiceRef is initialized only after the API is loaded
    // const placesServiceRef = usePlacesService(isLoaded, mapRef);
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

    const form = useForm({
        initialValues: {
            propertyType: "",
            transactionType: "renting",
            location: "",
            rooms: 1,
            surface: 0,
            title: "",
            description: "",
            price: 0,
        },
    });

    const handleSubmit = (values: typeof form.values) => {

        console.log("address search result: ", searchAddressResult);

        setLoading(true);

        const markerData = searchAddressMarker[0] ? {
            lat: searchAddressMarker[0].lat,
            lng: searchAddressMarker[0].lng,
        } : null;

        setTimeout(async () => {
            try {
                const propertyId = Date.now().toString();
                const firestoreResult = await addData("properties", propertyId, {
                    propertyType: values.propertyType,
                    transactionType: values.transactionType,
                    location: values.location,
                    rooms: values.rooms,
                    surface: values.surface,
                    title: values.title,
                    description: values.description,
                    price: values.price,
                    timestamp: new Date(),
                    userId: user?.uid,
                    userEmail: user?.email,
                    marker: markerData,
                });

                form.reset();
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

    if (!isLoaded) {
        return (
            <Box style={{display: "flex", justifyContent: "center", alignItems: "center", height: "600px"}}>
                <Loader/>
            </Box>
        );
    }

    return (
        <Container size="sm">
            <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Group align="center" justify="center">
                    <Title order={2} mb="lg">
                        Renting Registration Form
                    </Title>
                </Group>
                <form onSubmit={form.onSubmit(handleSubmit)}>
                    {/* Property Type Dropdown */}
                    <Select label="Property Type" placeholder="Select property type" mb="sm"
                            data={["Apartment", "House", "Field", "Commercial", "Penthouse"]} {...form.getInputProps("propertyType")}
                            required/>

                    {/* Transaction Type Radio */}
                    <Radio.Group label="Transaction Type" mb="sm" {...form.getInputProps("transactionType")} required>
                        <Radio value="selling" label="Selling" mb="xs"/>
                        <Radio value="renting" label="Renting" mb="xs"/>
                    </Radio.Group>

                    {/* Location Address */}
                    <AddressSearch value={valueSearch} onChange={(e) => {
                        const newValue = e.target.value;
                        setValueSearch(newValue);
                        form.setFieldValue("location", newValue);
                    }} placesServiceRef={placesServiceRef} onSearchResults={handleSearchResults}/>

                    {/* Number of rooms */}
                    <NumberInput label="Number of Rooms" placeholder="Enter number of rooms" mb="sm"
                                 min={1} {...form.getInputProps("rooms")} required/>

                    {/* Surface Area */}
                    <NumberInput label="Surface Area (sqm)" placeholder="Enter surface area" mb="sm"
                                 min={1} {...form.getInputProps("surface")} required/>

                    {/* Title */}
                    <TextInput label="Title" placeholder="Enter a title for your listing"
                               mb="sm" {...form.getInputProps("title")} required/>

                    {/* Short Description */}
                    <Textarea label="Short Description" placeholder="Enter a brief description"
                              mb="sm" {...form.getInputProps("description")} minRows={3} required/>

                    {/* Price Area */}
                    <NumberInput
                        label="Price (€)"
                        placeholder="Enter price"
                        mb="sm"
                        min={0}
                        step={100} // Increment by 100
                        {...form.getInputProps("price")}
                        required
                    />

                    {/* Submit Button */}
                    <Group align="center" justify="center" mt="md">
                        <Button type="submit" loading={loading}>
                            Submit
                        </Button>
                    </Group>
                </form>
            </Card>
        </Container>
    );
}
