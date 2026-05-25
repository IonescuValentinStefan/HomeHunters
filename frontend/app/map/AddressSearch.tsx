"use client"

import React, {useState} from "react"
import {Input} from "@/components/ui/input"
import {Search} from "lucide-react"

interface AddressSearchProps {
    value: string
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    placesServiceRef: React.MutableRefObject<google.maps.places.PlacesService | null>
    onSearchResults: (results: google.maps.places.PlaceResult[]) => void
}

const AddressSearch: React.FC<AddressSearchProps> = ({
                                                         value,
                                                         onChange,
                                                         placesServiceRef,
                                                         onSearchResults,
                                                     }) => {
    const [suggestions, setSuggestions] = useState<string[]>([])
    const [autocompleteService, setAutocompleteService] =
        useState<google.maps.places.AutocompleteService | null>(null)

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value
        onChange(e)

        if (!autocompleteService && typeof window !== "undefined") {
            setAutocompleteService(new google.maps.places.AutocompleteService())
        }

        if (inputValue.trim() && autocompleteService) {
            void autocompleteService.getPlacePredictions({input: inputValue}, (predictions, status) => {
                if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
                    setSuggestions(predictions.map((p) => p.description))
                } else {
                    setSuggestions([])
                }
            })
        } else {
            setSuggestions([])
        }
    }

    const handleSuggestionClick = (suggestion: string) => {
        onChange({target: {value: suggestion}} as React.ChangeEvent<HTMLInputElement>)
        setSuggestions([])

        if (placesServiceRef.current) {
            placesServiceRef.current.findPlaceFromQuery(
                {query: suggestion, fields: ["name", "geometry"]},
                (results, status) => {
                    if (status === google.maps.places.PlacesServiceStatus.OK && results) {
                        onSearchResults(results)
                    }
                }
            )
        }
    }

    return (
        <div className="w-full space-y-1 relative">
            <label className="text-sm font-medium text-gray-700">Search Address</label>
            <div className="flex items-center bg-white border rounded-md px-3">
                <Search className="text-gray-400 h-4 w-4 mr-2"/>
                <Input
                    placeholder="Type to search for an address"
                    className="border-none focus-visible:ring-0 focus-visible:ring-offset-0"
                    value={value}
                    onChange={handleInputChange}
                />
            </div>

            {suggestions.length > 0 && (
                <div className="absolute left-0 right-0 mt-1 z-10 bg-white border rounded shadow">
                    {suggestions.map((s, idx) => (
                        <div
                            key={idx}
                            onClick={() => handleSuggestionClick(s)}
                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                        >
                            {s}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default AddressSearch
