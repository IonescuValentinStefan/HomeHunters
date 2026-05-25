import {addMarker} from './MapUtils';

export const handleMapClick = (
    event: google.maps.MapMouseEvent,
    user: string,
    setMarkers: React.Dispatch<React.SetStateAction<{ lat: number; lng: number }[]>> // add setMarkers if it needs to be passed down
) => {
    console.log("User: ", user);

    if (user === 'buyer') {
        console.log('User does not have permission to add markers.');
        return;
    }

    const latLng = event.latLng;
    if (latLng) {
        const lat = latLng.lat();
        const lng = latLng.lng();

        console.log("Adding marker at:", lat, lng);

        addMarker(lat, lng).then((r) => console.log(r));
        setMarkers((prevMarkers) => [...prevMarkers, {lat, lng}]);
    }
};

export const handleMapDblClick = (
    event: google.maps.MapMouseEvent,
    user: string,
    bermudaTriangle: google.maps.Polygon | null,
    mapRef: React.RefObject<google.maps.Map | null>
) => {
    const latLng = event.latLng;
    if (!latLng) {
        console.log("No latLng found in event:", event);
        return;
    }

    console.log("Double click at:", latLng.lat(), latLng.lng());
    console.log("User: ", user);

    if (user !== 'buyer') {
        console.log('User does not have permission to double click.');
        return;
    }

    if (bermudaTriangle && google.maps.geometry.poly.containsLocation(latLng, bermudaTriangle)) {
        console.log("Inside the triangle!");
    } else {
        console.log("Outside the triangle!");
    }

    if (bermudaTriangle) {
        const resultColor = google.maps.geometry.poly.containsLocation(
            latLng,
            bermudaTriangle
        )
            ? "blue"
            : "red";
        const resultPath = google.maps.geometry.poly.containsLocation(
            latLng,
            bermudaTriangle
        )
            ? // A triangle.
            "m 0 -1 l 1 2 -2 0 z"
            : google.maps.SymbolPath.CIRCLE;

        new google.maps.Marker({
            position: event.latLng,
            map: mapRef.current,
            icon: {
                path: resultPath,
                fillColor: resultColor,
                fillOpacity: 0.2,
                strokeColor: "white",
                strokeWeight: 0.5,
                scale: 10,
            },
        });
    }
};

// const triangleCoords = [
//     {lat: 44.37703333630288, lng: 26.1201399190022},
//     {lat: 44.37997795420136, lng: 26.134688220698976},
//     {lat: 44.393748211491236, lng: 26.120998225886964},
// ];
//
// export const onMapLoad = (
//     map: google.maps.Map,
//     user: string,
//     setBermudaTriangle: React.Dispatch<React.SetStateAction<google.maps.Polygon | null>>,
//     placesServiceRef: React.MutableRefObject<google.maps.places.PlacesService | null>
// ) => {
//     console.log("User: ", user);
//
//     if (window.google && window.google.maps && !placesServiceRef.current) {
//         placesServiceRef.current = new google.maps.places.PlacesService(map);
//     }
//
//     if (user === 'buyer') {
//         setBermudaTriangle(
//             new google.maps.Polygon({
//                 paths: triangleCoords,
//                 strokeColor: "#FF0000",
//                 strokeOpacity: 0.8,
//                 strokeWeight: 2,
//                 fillColor: "#FF0000",
//                 fillOpacity: 0.1,
//                 clickable: true,
//             })
//         );
//     }
// };
