// src/components/PlaceCategorySelect.tsx
import React from 'react';
import {Select} from '@mantine/core';

interface PlaceCategorySelectProps {
    category: string | null;
    setCategory: (category: string | null) => void;
    searchPlacesByCategory: (category: string) => void;
}

const PlaceCategorySelect: React.FC<PlaceCategorySelectProps> = ({
                                                                     category,
                                                                     setCategory,
                                                                     searchPlacesByCategory,
                                                                 }) => {
    return (
        <Select
            label="Search Places by Category"
            placeholder="Select a category"
            data={[
                {value: 'restaurant', label: 'Restaurants'},
                {value: 'gym', label: 'Gyms'},
                {value: 'hospital', label: 'Hospitals'},
                {value: 'school', label: 'Schools'},
                {value: 'subway_station', label: 'Subway Stations'},
                {value: 'park', label: 'Parks'},
            ]}
            value={category}
            onChange={(value) => {
                setCategory(value);
                searchPlacesByCategory(value || '');
            }}
        />
    );
};

export default PlaceCategorySelect;
