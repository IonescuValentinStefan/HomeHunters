"use client"

import type React from "react"
import {useEffect, useState} from "react"
import {ArrowDownAZ, ArrowUpAZ, ArrowUpWideNarrow, CalendarArrowUp, Camera, Search, SortAsc} from "lucide-react"
import {getTrackBackground, Range} from "react-range"

import {Button} from "@/components/ui/button"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {Checkbox} from "@/components/ui/checkbox"
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {Separator} from "@/components/ui/separator"
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "@/components/ui/accordion"
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group"
import {Badge} from "@/components/ui/badge"
import {Switch} from "@/components/ui/switch"
import {ApartmentCard} from "./apartment-card"
import axios from "axios";
import {getAuth} from "firebase/auth";
import firebase_app from "@/firebase/firebase-config";
import Loading from "@/components/loading";

const PRICE_STEP = 100
const PRICE_MIN = 0
const PRICE_MAX = 500000

const SQMT_STEP = 5
const SQMT_MIN = 20
const SQMT_MAX = 250

// Property type options
const propertyTypeOptions = [
    {id: "any", label: "Any"},
    {id: "apartment", label: "Apartment"},
    {id: "house", label: "House"},
    {id: "studio", label: "Studio"},
    {id: "penthouse", label: "Penthouse"},
    {id: "loft", label: "Loft"},
]

// Bedroom options
const bedroomOptions = [
    {id: "any", label: "Any"},
    {id: "1", label: "1 Bedroom"},
    {id: "2", label: "2 Bedrooms"},
    {id: "3", label: "3+ Bedrooms"},
]

// Bathroom options
const bathroomOptions = [
    {id: "any", label: "Any"},
    {id: "1", label: "1 Bathroom"},
    {id: "2", label: "2 Bathrooms"},
    {id: "3", label: "3+ Bathrooms"},
]

// Furnished options
const furnishedOptions = [
    {id: "any", label: "Any"},
    {id: "furnished", label: "Furnished"},
    {id: "partially-furnished", label: "Partially Furnished"},
    {id: "unfurnished", label: "Unfurnished"},
]

// Amenity options
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

// Sort options
type SortOption = {
    id: string
    label: string
    icon: React.ReactNode
}

const sortOptions: SortOption[] = [
    {id: "newest", label: "Newest First", icon: <CalendarArrowUp className="h-4 w-4 mr-2"/>},
    {id: "recommended", label: "Recommended", icon: <ArrowUpWideNarrow className="h-4 w-4 mr-2"/>},
    {id: "price-asc", label: "Price: Low to High", icon: <ArrowUpAZ className="h-4 w-4 mr-2"/>},
    {id: "price-desc", label: "Price: High to Low", icon: <ArrowDownAZ className="h-4 w-4 mr-2"/>},
]

export default function ApartmentFilter() {
    // Filter states
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 500000])
    const [squareMetersRange, setSquareMetersRange] = useState<[number, number]>([40, 150])
    const [keyword, setKeyword] = useState("")
    const [selectedBedrooms, setSelectedBedrooms] = useState<string[]>(["any"])
    const [selectedBathrooms, setSelectedBathrooms] = useState<string[]>(["any"])
    const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])
    const [selectedPropertyTypes, setSelectedPropertyTypes] = useState<string[]>(["any"])
    // Update the furnished state to be an array like bedrooms
    const [selectedFurnished, setSelectedFurnished] = useState<string[]>(["any"])
    const [listingType, setListingType] = useState<string>("any") // "any", "rent", "sale"
    const [onlyWithPhotos, setOnlyWithPhotos] = useState<boolean>(false)
    const [sortBy, setSortBy] = useState<string>("newest")
    const [loading, setLoading] = useState(true);

    const [priceMinMax, setPriceMinMax] = useState<[number, number]>([0, 1000000])
    const [sqmMinMax, setSqmMinMax] = useState<[number, number]>([0, 500])

    const [apartments, setApartments] = useState([]);

    const auth = getAuth(firebase_app);
    const user = auth.currentUser;
    const userId = user ? user.uid : null;

    useEffect(() => {
        const loadProperties = async () => {
            setLoading(true);
            try {
                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/firestore/properties/sorted`,
                    {
                        params: {
                            userId,
                            sort: sortBy,
                        },
                    }
                );
                setApartments(response.data);
            } catch (error) {
                console.error("Failed to load properties:", error);
            } finally {
                setLoading(false);
            }
        };

        void loadProperties();
    }, [sortBy]);

    useEffect(() => {
        if (apartments.length > 0) {
            const prices = apartments.map((a) => a.price)
            const sqms = apartments.map((a) => a.surfaceArea ?? a.squareMeters)

            const minPrice = Math.min(...prices)
            const maxPrice = Math.max(...prices)
            const minSqm = Math.min(...sqms)
            const maxSqm = Math.max(...sqms)

            // actualizează range-urile
            setPriceRange([minPrice, maxPrice])
            setSquareMetersRange([minSqm, maxSqm])

            // opțional: setează și range-urile min/max absolute pentru sliders
            setPriceMinMax([minPrice, maxPrice])
            setSqmMinMax([minSqm, maxSqm])
        }
    }, [apartments])

    useEffect(() => {
        console.log("Changed apartments:", apartments);
    }, [apartments]);

    const handlePropertyTypeChange = (typeId: string, checked: boolean) => {
        if (typeId === "any" && checked) {
            setSelectedPropertyTypes(["any"])
        } else if (checked) {
            setSelectedPropertyTypes((prev) => {
                const newSelection = prev.filter((id) => id !== "any")
                return [...newSelection, typeId]
            })
        } else {
            setSelectedPropertyTypes((prev) => {
                const newSelection = prev.filter((id) => id !== typeId)
                return newSelection.length === 0 ? ["any"] : newSelection
            })
        }
    }

    // Handle bedroom selection
    const handleBedroomChange = (bedroomId: string, checked: boolean) => {
        if (bedroomId === "any" && checked) {
            // If "Any" is selected, clear other selections
            setSelectedBedrooms(["any"])
        } else if (checked) {
            // If another option is selected, remove "Any" and add the new option
            setSelectedBedrooms((prev) => {
                const newSelection = prev.filter((id) => id !== "any")
                return [...newSelection, bedroomId]
            })
        } else {
            // If an option is deselected, remove it
            setSelectedBedrooms((prev) => {
                const newSelection = prev.filter((id) => id !== bedroomId)
                // If no options are selected, default to "Any"
                return newSelection.length === 0 ? ["any"] : newSelection
            })
        }
    }

    // Handle bathroom selection
    const handleBathroomChange = (bathroomId: string, checked: boolean) => {
        if (bathroomId === "any" && checked) {
            // If "Any" is selected, clear other selections
            setSelectedBathrooms(["any"])
        } else if (checked) {
            // If another option is selected, remove "Any" and add the new option
            setSelectedBathrooms((prev) => {
                const newSelection = prev.filter((id) => id !== "any")
                return [...newSelection, bathroomId]
            })
        } else {
            // If an option is deselected, remove it
            setSelectedBathrooms((prev) => {
                const newSelection = prev.filter((id) => id !== bathroomId)
                // If no options are selected, default to "Any"
                return newSelection.length === 0 ? ["any"] : newSelection
            })
        }
    }

    // Handle furnished selection
    const handleFurnishedChange = (furnishedId: string, checked: boolean) => {
        if (furnishedId === "any" && checked) {
            // If "Any" is selected, clear other selections
            setSelectedFurnished(["any"])
        } else if (checked) {
            // If another option is selected, remove "Any" and add the new option
            setSelectedFurnished((prev) => {
                const newSelection = prev.filter((id) => id !== "any")
                return [...newSelection, furnishedId]
            })
        } else {
            // If an option is deselected, remove it
            setSelectedFurnished((prev) => {
                const newSelection = prev.filter((id) => id !== furnishedId)
                // If no options are selected, default to "Any"
                return newSelection.length === 0 ? ["any"] : newSelection
            })
        }
    }

    // Handle amenity selection
    const handleAmenityChange = (amenityId: string, checked: boolean) => {
        if (checked) {
            setSelectedAmenities((prev) => [...prev, amenityId])
        } else {
            setSelectedAmenities((prev) => prev.filter((id) => id !== amenityId))
        }
    }

    // Get current sort option
    const currentSortOption = sortOptions.find((option) => option.id === sortBy) || sortOptions[0]

    // Filtered apartments
    let filteredApartments = apartments.filter((apartment) => {

        console.log("Apartment:", apartment)
        console.log("listingType:", listingType)

        // Filter by listing type
        if (listingType !== "any" && apartment.transactionType !== listingType) {
            return false
        }

        // Filter by price
        if (apartment.price < priceRange[0] || apartment.price > priceRange[1]) {
            return false
        }

        // Filter by square meters
        if (apartment.squareMeters < squareMetersRange[0] || apartment.squareMeters > squareMetersRange[1]) {
            return false
        }

        // Filter by property type
        if (!selectedPropertyTypes.includes("any")) {
            if (!selectedPropertyTypes.includes(apartment.propertyType?.toLowerCase())) {
                return false
            }
        }

        // Filter by rooms
        if (!selectedBedrooms.includes("any")) {
            const roomMatches = selectedBedrooms.some((roomOption) => {
                const roomValue = Number.parseInt(roomOption)
                if (roomOption === "3") {
                    // For "3+" option, match apartments with 3 or more rooms
                    return apartment.rooms >= 3
                }
                return apartment.rooms === roomValue
            })
            if (!roomMatches) return false
        }

        // Filter by bathrooms
        if (!selectedBathrooms.includes("any")) {
            const bathroomMatches = selectedBathrooms.some((bathroomOption) => {
                if (bathroomOption === "1") return apartment.bathrooms === 1
                if (bathroomOption === "2") return apartment.bathrooms === 2
                if (bathroomOption === "3") return apartment.bathrooms >= 3
                return false
            })
            if (!bathroomMatches) return false
        }

        // Update the filtering logic for furnished status
        if (!selectedFurnished.includes("any")) {
            if (!selectedFurnished.includes(apartment.furnished)) {
                return false
            }
        }

        // Filter by photos (check if first photo is not the default image)
        const DEFAULT_PHOTO_URL = "https://firebasestorage.googleapis.com/v0/b/homehunters-92c76.firebasestorage.app/o/property_photos%2Fproperty_default.jpg?alt=media&token=3f9afaee-5059-4378-a5ab-ff2ef03021f8"

        if (onlyWithPhotos && apartment.photoUrls?.[0] === DEFAULT_PHOTO_URL) {
            return false
        }

        // Filter by amenities
        if (selectedAmenities.length > 0) {

            console.log("Selected Amenities:", selectedAmenities)

            // const amenityLabels = amenityOptions
            //     .filter((option) => selectedAmenities.includes(option.id))
            //     .map((option) => option.label)

            // console.log("Amenitiy labels:", amenityLabels)

            // Check if apartment has all selected amenities
            // const hasAllAmenities = amenityLabels.every((amenity) => apartment.amenities.includes(amenity))

            const hasAllAmenities = selectedAmenities.every((amenity) => apartment.amenities.includes(amenity))

            console.log("Apartment Amenities:", apartment.amenities)
            console.log("Has All Amenities:", hasAllAmenities)

            if (!hasAllAmenities) return false
        }

        // Filter by keyword
        if (keyword) {
            console.log("Keyword search:", keyword);

            const searchTerm = keyword.toLowerCase();

            return (
                (apartment.title?.toLowerCase().includes(searchTerm) ?? false) ||
                (apartment.description?.toLowerCase().includes(searchTerm) ?? false) ||
                (apartment.address?.toLowerCase().includes(searchTerm) ?? false) ||
                (apartment.amenities?.some((amenity) => amenity?.toLowerCase().includes(searchTerm)) ?? false)
            );
        }


        return true
    })

    // Sort apartments
    // filteredApartments = [...filteredApartments].sort((a, b) => {
    //     switch (sortBy) {
    //         case "newest":
    //             return b.dateAdded.getTime() - a.dateAdded.getTime()
    //         case "price-asc":
    //             return a.price - b.price
    //         case "price-desc":
    //             return b.price - a.price
    //         default:
    //             return 0
    //     }
    // })

    if (loading) {
        return <Loading/>;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6 p-4 md:p-6">
            {/* Filter sidebar */}
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Filters</CardTitle>
                        <CardDescription>Find your perfect apartment</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">

                        {/* Keyword search */}
                        <div className="space-y-2">
                            <Label htmlFor="keyword">Search</Label>
                            <div className="relative">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground"/>
                                <Input
                                    id="keyword"
                                    placeholder="Location, amenities, etc."
                                    className="pl-8"
                                    value={keyword}
                                    onChange={(e) => setKeyword(e.target.value)}
                                />
                            </div>
                        </div>

                        <Separator/>

                        {/* Listing Type */}
                        <div className="space-y-2">
                            <Label>Listing Type</Label>
                            <RadioGroup value={listingType} onValueChange={setListingType}
                                        className="flex flex-col space-y-2">
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="any" id="listing-any"/>
                                    <Label htmlFor="listing-any" className="font-normal">
                                        Any
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="renting" id="listing-rent"/>
                                    <Label htmlFor="listing-rent" className="font-normal">
                                        For Rent
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="selling" id="listing-sale"/>
                                    <Label htmlFor="listing-sale" className="font-normal">
                                        For Sale
                                    </Label>
                                </div>
                            </RadioGroup>
                        </div>

                        <Separator/>

                        {/* Price range filter */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="price-range">Price Range</Label>
                                <span className="text-sm text-muted-foreground">
                  €{priceRange[0]} - €{priceRange[1]}
                </span>
                            </div>
                            <div className="px-1 py-6">
                                <Range
                                    step={PRICE_STEP}
                                    min={priceMinMax[0]}
                                    max={priceMinMax[1]}
                                    values={priceRange}
                                    onChange={(values) => setPriceRange(values as [number, number])}
                                    renderTrack={({props, children}) => {
                                        const {key, ...trackProps} = props
                                        return (
                                            <div
                                                key={key}
                                                {...trackProps}
                                                style={{
                                                    ...trackProps.style,
                                                    height: "6px",
                                                    width: "100%",
                                                    borderRadius: "3px",
                                                    background: getTrackBackground({
                                                        values: priceRange,
                                                        colors: ["#e5e7eb", "#4f46e5", "#e5e7eb"],
                                                        min: priceMinMax[0],
                                                        max: priceMinMax[1],
                                                    }),
                                                }}
                                            >
                                                {children}
                                            </div>
                                        )
                                    }}
                                    renderThumb={({props, isDragged}) => {
                                        const {key, ...thumbProps} = props
                                        return (
                                            <div
                                                key={key}
                                                {...thumbProps}
                                                style={{
                                                    ...thumbProps.style,
                                                    height: "20px",
                                                    width: "20px",
                                                    borderRadius: "50%",
                                                    backgroundColor: "#4f46e5",
                                                    border: "2px solid #ffffff",
                                                    boxShadow: isDragged ? "0 0 0 5px rgba(79, 70, 229, 0.2)" : "0 2px 4px rgba(0, 0, 0, 0.1)",
                                                    display: "flex",
                                                    justifyContent: "center",
                                                    alignItems: "center",
                                                }}
                                            />
                                        )
                                    }}
                                />
                            </div>
                            <div className="flex justify-between items-center">
                                <div className="bg-indigo-100 border border-indigo-200 rounded px-2 py-1">
                                    <span className="text-xs font-medium text-indigo-700">Min: ${priceRange[0]}</span>
                                </div>
                                <div className="bg-indigo-100 border border-indigo-200 rounded px-2 py-1">
                                    <span className="text-xs font-medium text-indigo-700">Max: ${priceRange[1]}</span>
                                </div>
                            </div>
                        </div>

                        <Separator/>

                        {/* Square Meters range filter */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="sqm-range">Square Meters</Label>
                                <span className="text-sm text-muted-foreground">
                  {squareMetersRange[0]} - {squareMetersRange[1]} m²
                </span>
                            </div>
                            <div className="px-1 py-6">
                                <Range
                                    step={SQMT_STEP}
                                    min={sqmMinMax[0]}
                                    max={sqmMinMax[1]}
                                    values={squareMetersRange}
                                    onChange={(values) => setSquareMetersRange(values as [number, number])}
                                    renderTrack={({props, children}) => {
                                        const {key, ...trackProps} = props
                                        return (
                                            <div
                                                key={key}
                                                {...trackProps}
                                                style={{
                                                    ...trackProps.style,
                                                    height: "6px",
                                                    width: "100%",
                                                    borderRadius: "3px",
                                                    background: getTrackBackground({
                                                        values: squareMetersRange,
                                                        colors: ["#e5e7eb", "#4f46e5", "#e5e7eb"],
                                                        min: sqmMinMax[0],
                                                        max: sqmMinMax[1],
                                                    }),
                                                }}
                                            >
                                                {children}
                                            </div>
                                        )
                                    }}
                                    renderThumb={({props, isDragged}) => {
                                        const {key, ...thumbProps} = props
                                        return (
                                            <div
                                                key={key}
                                                {...thumbProps}
                                                style={{
                                                    ...thumbProps.style,
                                                    height: "20px",
                                                    width: "20px",
                                                    borderRadius: "50%",
                                                    backgroundColor: "#4f46e5",
                                                    border: "2px solid #ffffff",
                                                    boxShadow: isDragged ? "0 0 0 5px rgba(79, 70, 229, 0.2)" : "0 2px 4px rgba(0, 0, 0, 0.1)",
                                                    display: "flex",
                                                    justifyContent: "center",
                                                    alignItems: "center",
                                                }}
                                            />
                                        )
                                    }}
                                />
                            </div>
                            <div className="flex justify-between items-center">
                                <div className="bg-indigo-100 border border-indigo-200 rounded px-2 py-1">
                                    <span
                                        className="text-xs font-medium text-indigo-700">Min: {squareMetersRange[0]} m²</span>
                                </div>
                                <div className="bg-indigo-100 border border-indigo-200 rounded px-2 py-1">
                                    <span
                                        className="text-xs font-medium text-indigo-700">Max: {squareMetersRange[1]} m²</span>
                                </div>
                            </div>
                        </div>

                        <Separator/>

                        {/* Additional filters */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <Camera className="h-4 w-4 text-muted-foreground"/>
                                    <Label htmlFor="photos-only" className="font-normal">
                                        Only Show Listings with Photos
                                    </Label>
                                </div>
                                <Switch id="photos-only" checked={onlyWithPhotos} onCheckedChange={setOnlyWithPhotos}/>
                            </div>
                        </div>

                        <Separator/>

                        {/* Use accordion for filters to save space */}
                        <Accordion type="multiple" className="w-full">
                            <AccordionItem value="propertyType">
                                <AccordionTrigger className="text-base font-medium">Property Type</AccordionTrigger>
                                <AccordionContent>
                                    <div className="flex flex-col space-y-2 pt-1">
                                        {propertyTypeOptions.map((option) => (
                                            <div key={option.id} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`property-${option.id}`}
                                                    checked={selectedPropertyTypes.includes(option.id)}
                                                    onCheckedChange={(checked) => handlePropertyTypeChange(option.id, checked === true)}
                                                />
                                                <Label htmlFor={`property-${option.id}`} className="font-normal">
                                                    {option.label}
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>

                            {/* Number of rooms - with checkboxes */}
                            <AccordionItem value="bedrooms">
                                <AccordionTrigger className="text-base font-medium">Bedrooms</AccordionTrigger>
                                <AccordionContent>
                                    <div className="flex flex-col space-y-2 pt-1">
                                        {bedroomOptions.map((option) => (
                                            <div key={option.id} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`bedroom-${option.id}`}
                                                    checked={selectedBedrooms.includes(option.id)}
                                                    onCheckedChange={(checked) => handleBedroomChange(option.id, checked === true)}
                                                />
                                                <Label htmlFor={`bedroom-${option.id}`} className="font-normal">
                                                    {option.label}
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>

                            {/* Number of bathrooms - with checkboxes */}
                            <AccordionItem value="bathrooms">
                                <AccordionTrigger className="text-base font-medium">Bathrooms</AccordionTrigger>
                                <AccordionContent>
                                    <div className="flex flex-col space-y-2 pt-1">
                                        {bathroomOptions.map((option) => (
                                            <div key={option.id} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`bathroom-${option.id}`}
                                                    checked={selectedBathrooms.includes(option.id)}
                                                    onCheckedChange={(checked) => handleBathroomChange(option.id, checked === true)}
                                                />
                                                <Label htmlFor={`bathroom-${option.id}`} className="font-normal">
                                                    {option.label}
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>

                            {/* Amenities filter - with checkboxes */}
                            <AccordionItem value="amenities">
                                <AccordionTrigger className="text-base font-medium">
                                  <span className="flex items-center">
                                    Amenities
                                      {selectedAmenities.length > 0 && (
                                          <Badge variant="secondary" className="ml-2">
                                              {selectedAmenities.length}
                                          </Badge>
                                      )}
                                  </span>
                                </AccordionTrigger>
                                <AccordionContent>
                                    <div className="flex flex-col space-y-2 pt-1">
                                        {amenityOptions.map((option) => (
                                            <div key={option.id} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`amenity-${option.id}`}
                                                    checked={selectedAmenities.includes(option.id)}
                                                    onCheckedChange={(checked) => handleAmenityChange(option.id, checked === true)}
                                                />
                                                <Label htmlFor={`amenity-${option.id}`} className="font-normal">
                                                    {option.label}
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>

                            {/* Furnished status - now with checkboxes */}
                            <AccordionItem value="furnished">
                                <AccordionTrigger className="text-base font-medium">Furnished Status</AccordionTrigger>
                                <AccordionContent>
                                    <div className="flex flex-col space-y-2 pt-1">
                                        {furnishedOptions.map((option) => (
                                            <div key={option.id} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`furnished-${option.id}`}
                                                    checked={selectedFurnished.includes(option.id)}
                                                    onCheckedChange={(checked) => handleFurnishedChange(option.id, checked === true)}
                                                />
                                                <Label htmlFor={`furnished-${option.id}`} className="font-normal">
                                                    {option.label}
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>

                        <Button
                            className="w-full"
                            onClick={() => {
                                // Reset all filters
                                setPriceRange([0, 500000])
                                setSquareMetersRange([40, 150])
                                setKeyword("")
                                setSelectedPropertyTypes(["any"])
                                setSelectedBedrooms(["any"])
                                setSelectedBathrooms(["any"])
                                setSelectedAmenities([])
                                setSelectedFurnished(["any"])
                                setListingType("any")
                                setOnlyWithPhotos(false)
                                setSortBy("newest")
                            }}
                        >
                            Reset Filters
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Results */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold tracking-tight">
                        {filteredApartments.length} {filteredApartments.length === 1 ? "Apartment" : "Apartments"} Found
                    </h2>

                    {/* Sort dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="flex items-center gap-2">
                                <SortAsc className="h-4 w-4"/>
                                <span>Sort: {currentSortOption.label}</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[200px]">
                            {sortOptions.map((option) => (
                                <DropdownMenuItem
                                    key={option.id}
                                    className="flex items-center cursor-pointer"
                                    onClick={() => setSortBy(option.id)}
                                >
                                    {option.icon}
                                    {option.label}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredApartments.map((apartment) => (
                        <ApartmentCard
                            from={"feed"}
                            key={apartment.id}
                            apartment={apartment}
                            selectedAmenities={selectedAmenities}
                            amenityOptions={amenityOptions}
                        />
                    ))}
                </div>

                {filteredApartments.length === 0 && (
                    <div className="text-center py-12">
                        <h3 className="text-lg font-medium">No apartments match your filters</h3>
                        <p className="text-muted-foreground mt-1">Try adjusting your search criteria</p>
                    </div>
                )}
            </div>
        </div>
    )
}