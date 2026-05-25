import {useEffect, useState} from "react";
import axios from "axios";

export function useMarkers(userType: string, userId: string | undefined, refreshKey = 0) {
    const [markers, setMarkers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

    useEffect(() => {
        const fetchMarkers = async () => {
            try {
                setLoading(true);
                setError(null);

                let url = "";

                if (userType === "buyer") {
                    console.log("Fetching markers for buyer");

                    url = `${BACKEND_URL}/api/firestore/properties/markers`;
                } else if (userType === "seller" && userId) {
                    console.log("Fetching markers for seller with userId:", userId);

                    url = `${BACKEND_URL}/api/firestore/properties/markers/user/${userId}`;
                } else {
                    setMarkers([]);
                    return;
                }

                const response = await axios.get(url);
                setMarkers(response.data);
            } catch (err) {
                setError("Failed to fetch markers");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        void fetchMarkers();
    }, [userType, userId, refreshKey]);

    return {markers, loading, error};
}