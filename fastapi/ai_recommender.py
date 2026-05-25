import numpy as np
from sklearn.feature_extraction import DictVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import pandas as pd
import uuid

def recommend_with_ai(all_props: list, fav_props: list):
    if not fav_props:
        print("[WARN] Fără favorite – returnăm lista originală.")
        return {"recommended": all_props}

    # Normalizare valori lipsă
    for prop in all_props:
        prop["furnished"] = prop.get("furnished") or "unknown"
        prop["amenities"] = prop.get("amenities") or []
        prop["propertyType"] = prop.get("propertyType") or "unknown"
        prop["transactionType"] = prop.get("transactionType") or "unknown"

    for prop in fav_props:
        prop["furnished"] = prop.get("furnished") or "unknown"
        prop["amenities"] = prop.get("amenities") or []
        prop["propertyType"] = prop.get("propertyType") or "unknown"
        prop["transactionType"] = prop.get("transactionType") or "unknown"

    # Extrage doar câmpurile relevante sub formă de dict
    def flatten(prop):
        return {
            "surfaceArea": prop.get("surfaceArea") or 0.0,
            "rooms": prop.get("rooms") or 0,
            "bathrooms": prop.get("bathrooms") or 0,
            "price": prop.get("price") or 0.0,
            "transactionType": prop.get("transactionType") or "unknown",
            "furnished": prop.get("furnished") or "unknown",
            "propertyType": prop.get("propertyType") or "unknown",
            "amenities_count": len(prop.get("amenities") or [])
        }


    all_dicts = [flatten(p) for p in all_props]
    fav_dicts = [flatten(p) for p in fav_props]

    # Vectorizare
    vec = DictVectorizer(sparse=False)
    X_all = vec.fit_transform(all_dicts)
    X_fav = vec.transform(fav_dicts)

    # Vector mediu al favoritelor
    fav_mean = np.mean(X_fav, axis=0)

    # Calculează similaritatea cosinus
    similarities = cosine_similarity(X_all, [fav_mean]).flatten()

    # Adaugă scorurile și salvează CSV
    scored_props = []
    for i, prop in enumerate(all_props):
        prop_copy = dict(prop)  # copiem pentru a nu altera originalul
        prop_copy["score"] = float(similarities[i])
        scored_props.append(prop_copy)

    # Salvare CSV
    df = pd.DataFrame(scored_props)
    filename = f"csv/cosine_training_data_{uuid.uuid4().hex[:6]}.csv"
    df.to_csv(filename, index=False)
    print(f"[INFO] Saved CSV with scores: {filename}")

    # Sortare descrescătoare după scor
    sorted_props = sorted(scored_props, key=lambda x: x["score"], reverse=True)
    return {"recommended": sorted_props}
