import numpy as np
import pandas as pd
from sklearn.preprocessing import OneHotEncoder, MinMaxScaler
from sklearn.metrics.pairwise import cosine_similarity

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

def rank_properties_by_similarity_weighted(all_properties, favorite_properties):
    if not favorite_properties:
        return all_properties

    # 1. Amenity list
    all_amenities = sorted({a for p in all_properties + favorite_properties if p.amenities for a in p.amenities})

    # 2. Encode properties
    df_all = _encode_properties(all_properties, all_amenities)
    df_fav = _encode_properties(favorite_properties, all_amenities)

    # 3. Simplify categorical values
    df_all["propertyType"] = df_all["propertyType"].apply(lambda x: x if x == "apartment" else "other")
    df_fav["propertyType"] = df_fav["propertyType"].apply(lambda x: x if x == "apartment" else "other")

    # 4. One-hot encode categorical
    encoder = OneHotEncoder(handle_unknown="ignore", sparse=False)
    encoded_fav = encoder.fit_transform(df_fav[["transactionType", "propertyType", "furnished"]])
    encoded_all = encoder.transform(df_all[["transactionType", "propertyType", "furnished"]])

    # 5. Get numeric columns
    num_cols = ["rooms", "bathrooms", "surfaceArea", "price"] + [c for c in df_all.columns if c.startswith("amenity_")]

    # 6. Normalize numeric features
    scaler = MinMaxScaler()
    df_all[num_cols] = scaler.fit_transform(df_all[num_cols])
    df_fav[num_cols] = scaler.transform(df_fav[num_cols])

    # 7. Apply weights
    encoded_all *= [50 if "transactionType" in f else 20 if "propertyType" in f else 1 for f in encoder.get_feature_names_out()]
    encoded_fav *= [50 if "transactionType" in f else 20 if "propertyType" in f else 1 for f in encoder.get_feature_names_out()]
    df_all["rooms"] *= 10
    df_fav["rooms"] *= 10

    # 8. Create final vectors
    mat_all = np.hstack([encoded_all, df_all[num_cols].values])
    mat_fav = np.hstack([encoded_fav, df_fav[num_cols].values])
    avg_vector = np.mean(mat_fav, axis=0)

    # 9. Cosine similarity
    similarity_scores = cosine_similarity([avg_vector], mat_all)[0]

    # 10. Score mapping
    favorite_ids = {p.id for p in favorite_properties}
    favorites = [p for p in all_properties if p.id in favorite_ids]
    others = [p for p in all_properties if p.id not in favorite_ids]
    others_sorted = sorted(others, key=lambda p: similarity_scores[all_properties.index(p)], reverse=True)

    sorted_properties = favorites + others_sorted

    print(f"Sorted properties by similarity: {[p.id for p in sorted_properties]}")
    return sorted_properties
