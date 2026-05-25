import React, {createContext, ReactNode, useContext, useRef, useState} from 'react';

// Extending the GlobalState interface to include placesServiceRef and mapRef
interface GlobalState {
    isLoaded: boolean;
    setIsLoaded: (value: boolean) => void;
    placesServiceRef: React.MutableRefObject<google.maps.places.PlacesService | null>;
    mapRef: React.MutableRefObject<google.maps.Map | null>;
}

const GlobalContext = createContext<GlobalState | undefined>(undefined);

export const GlobalProvider: React.FC<{ children: ReactNode }> = ({children}) => {
    const [isLoaded, setIsLoaded] = useState(false);

    // Create refs for placesService and map
    const placesServiceRef = useRef<google.maps.places.PlacesService | null>(null);
    const mapRef = useRef<google.maps.Map | null>(null);

    return (
        <GlobalContext.Provider value={{isLoaded, setIsLoaded, placesServiceRef, mapRef}}>
            {children}
        </GlobalContext.Provider>
    );
};

export const useGlobalState = () => {
    const context = useContext(GlobalContext);
    if (!context) {
        throw new Error('useGlobalState must be used within a GlobalProvider');
    }
    return context;
};
