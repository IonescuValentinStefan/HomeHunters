import numpy as np
import pandas as pd
from sklearn.preprocessing import OneHotEncoder
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import MinMaxScaler

def _encode_properties(properties, amenities_list):
    records = []
    for prop in properties:
        record = {
            "transactionType": prop.transactionType,
            "propertyType": prop.propertyType,
            "furnished": prop.furnished,
            "rooms": prop.rooms,
            "bathrooms": prop.bathrooms,
            "surfaceArea": prop.surfaceArea,
            "price": prop.price or 0.0,
        }
        for a in amenities_list:
            record[f"amenity_{a}"] = int(prop.amenities and a in prop.amenities)
        records.append(record)
    return pd.DataFrame(records)

def rank_properties_by_similarity(all_properties, favorite_properties):
    if not favorite_properties:
        return all_properties  # fallback dacă nu sunt favorite

    # amenity-uri unificate
    all_amenities = sorted({a for p in all_properties + favorite_properties if p.amenities for a in p.amenities})

    # vectori de caracteristici
    df_all = _encode_properties(all_properties, all_amenities)
    df_fav = _encode_properties(favorite_properties, all_amenities)

    # Pondere mare pentru 'rooms'
    df_all["rooms"] = df_all["rooms"].fillna(0) * 3
    df_fav["rooms"] = df_fav["rooms"].fillna(0) * 3

    # Simplificăm propertyType
    df_all["propertyType"] = df_all["propertyType"].apply(lambda x: x if x == "apartment" else "other")
    df_fav["propertyType"] = df_fav["propertyType"].apply(lambda x: x if x == "apartment" else "other")

    # Găsim cel mai frecvent transactionType în favorite
    dominant_type = df_fav["transactionType"].mode()[0]

    # Adăugăm feature binar `transaction_match` cu pondere mare (×50)
    df_all["transaction_match"] = (df_all["transactionType"] == dominant_type).astype(int) * 50
    df_fav["transaction_match"] = 50  # toate sunt din același tip, deci = 1×50

    # One-hot pentru categorice
    encoder = OneHotEncoder(handle_unknown="ignore", sparse=False)
    encoded_fav = encoder.fit_transform(df_fav[["propertyType", "furnished"]])
    encoded_all = encoder.transform(df_all[["propertyType", "furnished"]])

    # Coloane numerice
    num_cols = ["rooms", "bathrooms", "surfaceArea", "price", "transaction_match"] + [
        c for c in df_all.columns if c.startswith("amenity_")
    ]

    # Normalizare
    scaler = MinMaxScaler()
    df_all[num_cols] = scaler.fit_transform(df_all[num_cols])
    df_fav[num_cols] = scaler.transform(df_fav[num_cols])

    # Vectori
    mat_fav = np.hstack([encoded_fav, df_fav[num_cols].values])
    mat_all = np.hstack([encoded_all, df_all[num_cols].values])

    # Similaritate
    avg_vector = np.mean(mat_fav, axis=0)
    similarity_scores = cosine_similarity([avg_vector], mat_all)[0]

    # Mapare scoruri
    scored_properties = list(zip(all_properties, similarity_scores))
    favorite_ids = {p.id for p in favorite_properties}
    favorites = [p for p in all_properties if p.id in favorite_ids]
    others = [p for p, _ in scored_properties if p.id not in favorite_ids]

    others_sorted = sorted(others, key=lambda p: similarity_scores[all_properties.index(p)], reverse=True)

    sorted_properties = favorites + others_sorted
    print(f"Sorted properties by similarity: {[p.id for p in sorted_properties]}")
    return sorted_properties
