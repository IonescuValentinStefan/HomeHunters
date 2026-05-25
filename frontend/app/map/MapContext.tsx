import React, {createContext, MutableRefObject, useContext} from 'react';

interface MapContextType {
    mapRef: MutableRefObject<google.maps.Map | null>;
    placesServiceRef: MutableRefObject<google.maps.places.PlacesService | null>;
    isLoaded: boolean;
}

const MapContext = createContext<MapContextType | null>(null);

export const useMapContext = () => {
    const context = useContext(MapContext);
    if (!context) {
        throw new Error('useMapContext must be used within a MapProvider');
    }
    return context;
};

interface MapProviderProps {
    children: React.ReactNode;
    mapRef: MutableRefObject<google.maps.Map | null>;
    placesServiceRef: MutableRefObject<google.maps.places.PlacesService | null>;
    isLoaded: boolean;
}

export const MapProvider: React.FC<MapProviderProps> = ({
                                                            children,
                                                            mapRef,
                                                            placesServiceRef,
                                                            isLoaded
                                                        }) => {
    return (
        <MapContext.Provider value={{mapRef, placesServiceRef, isLoaded}}>
            {children}
        </MapContext.Provider>
    );
};