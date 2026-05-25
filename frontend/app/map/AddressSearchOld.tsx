"use client";

import React, {useState} from "react";
import {TextInput} from "@mantine/core";

interface AddressSearchProps {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placesServiceRef: React.MutableRefObject<google.maps.places.PlacesService | null>;
    onSearchResults: (results: google.maps.places.PlaceResult[]) => void;
}

const AddressSearch: React.FC<AddressSearchProps> = ({
                                                         value,
                                                         onChange,
                                                         placesServiceRef,
                                                         onSearchResults,
                                                     }) => {
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [autocompleteService, setAutocompleteService] = useState<google.maps.places.AutocompleteService | null>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;
        onChange(e); // Update parent component state

        if (!autocompleteService) {
            // Initialize AutocompleteService if not already done
            setAutocompleteService(new google.maps.places.AutocompleteService());
        }

        if (inputValue.trim() && autocompleteService) {
            autocompleteService.getPlacePredictions(
                {input: inputValue},
                (predictions, status) => {
                    if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
                        setSuggestions(predictions.map((prediction) => prediction.description));
                    } else {
                        setSuggestions([]);
                    }
                }
            );
        } else {
            setSuggestions([]);
        }
    };

    const handleSuggestionClick = (suggestion: string) => {
        onChange({target: {value: suggestion}} as React.ChangeEvent<HTMLInputElement>); // Update input
        setSuggestions([]); // Clear suggestions

        console.log("PLACES SERVICE REF", placesServiceRef.current);

        if (placesServiceRef.current) {
            placesServiceRef.current.findPlaceFromQuery(
                {query: suggestion, fields: ["name", "geometry"]},
                (results, status) => {
                    if (status === google.maps.places.PlacesServiceStatus.OK && results) {
                        onSearchResults(results);
                    }
                }
            );
        }
    };

    return (
        <div style={{position: "relative"}}>
            <TextInput
                label="Location"
                placeholder="Type to search for an address"
                value={value}
                onChange={handleInputChange}
            />
            {suggestions.length > 0 && (
                <div style={{backgroundColor: "white", border: "1px solid #ddd", position: "absolute", zIndex: 1000}}>
                    {suggestions.map((suggestion, index) => (
                        <div
                            key={index}
                            onClick={() => handleSuggestionClick(suggestion)}
                            style={{padding: "8px", cursor: "pointer"}}
                        >
                            {suggestion}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AddressSearch;
