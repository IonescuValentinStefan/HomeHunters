package com.example.home_hunters.service;

import com.example.home_hunters.dto.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.api.core.ApiFuture;
import com.google.cloud.Timestamp;
import com.google.cloud.firestore.*;
import com.google.firebase.cloud.FirestoreClient;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.ExecutionException;
import java.util.stream.Collectors;

@Slf4j
@Service
public class FirestoreService {

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final Firestore db = FirestoreClient.getFirestore();

    // ───────────────────────────────────────────────────────
    // 🔹 Generic Firestore GET/SET
    // ───────────────────────────────────────────────────────

    public String save(String collection, String documentId, Map<String, Object> data) throws ExecutionException, InterruptedException {
        ApiFuture<WriteResult> result = db.collection(collection).document(documentId).set(data);
        return result.get().getUpdateTime().toString();
    }

    public Map<String, Object> get(String collection, String documentId) throws ExecutionException, InterruptedException {
        DocumentSnapshot document = db.collection(collection).document(documentId).get().get();
        return document.exists() ? document.getData() : null;
    }

    // ───────────────────────────────────────────────────────
    // 🔹 Properties
    // ───────────────────────────────────────────────────────

    public List<PropertyFirebase> getAllProperties() throws ExecutionException, InterruptedException {
        List<QueryDocumentSnapshot> documents = db.collection("properties").get().get().getDocuments();
        List<PropertyFirebase> properties = new ArrayList<>();

        for (QueryDocumentSnapshot doc : documents) {
            PropertyFirebase property = doc.toObject(PropertyFirebase.class);
            property.setId(doc.getId());
            properties.add(property);
        }

        return properties;
    }

    public void deleteProperty(String propertyId) throws Exception {
        db.collection("properties").document(propertyId).delete().get();

        ApiFuture<QuerySnapshot> usersFuture = db.collection("users").get();
        List<QueryDocumentSnapshot> users = usersFuture.get().getDocuments();

        for (QueryDocumentSnapshot userDoc : users) {
            Object favoritesObj = userDoc.get("favorites");

            if (favoritesObj instanceof List<?> rawList) {
                List<String> favorites = rawList.stream()
                        .filter(Objects::nonNull)
                        .map(Object::toString)
                        .collect(Collectors.toList());

                if (favorites.contains(propertyId)) {
                    favorites.remove(propertyId);

                    db.collection("users")
                            .document(userDoc.getId())
                            .update("favorites", favorites);
                }
            }
        }
    }

    public String addPropertyAutoId(String collection, PropertyFirebase property) throws ExecutionException, InterruptedException {
        Map<String, Object> data = objectMapper.convertValue(property, Map.class);
        data.put("timestamp", Timestamp.now());

        ApiFuture<DocumentReference> future = db.collection(collection).add(data);
        return future.get().getId();
    }

    public List<PropertyFirebase> getPropertiesByUser(String userId) throws Exception {
        List<QueryDocumentSnapshot> documents = db.collection("properties")
                .whereEqualTo("userId", userId)
                .get().get().getDocuments();

        List<PropertyFirebase> properties = new ArrayList<>();
        for (QueryDocumentSnapshot doc : documents) {
            PropertyFirebase property = doc.toObject(PropertyFirebase.class);
            property.setId(doc.getId());
            properties.add(property);
        }

        return properties.stream()
                .sorted(Comparator.comparing(PropertyFirebase::getTimestamp, Comparator.nullsLast(Comparator.reverseOrder())))
                .toList();
    }


    // ───────────────────────────────────────────────────────
    // 🔹 Users
    // ───────────────────────────────────────────────────────

    public List<UserFirebase> getAllUsers() throws ExecutionException, InterruptedException {
        List<QueryDocumentSnapshot> documents = db.collection("users").get().get().getDocuments();

        return documents.stream()
                .map(doc -> {
                    UserFirebase user = doc.toObject(UserFirebase.class);
                    user.setId(doc.getId());
                    return user;
                })
                .toList();
    }

    public String addOrUpdateUser(UserRequest request) throws Exception {
        DocumentReference userRef = db.collection("users").document(request.getUserId());
        DocumentSnapshot snapshot = userRef.get().get();

        Map<String, Object> data = new HashMap<>();
        data.put("name", request.getName());
        data.put("email", request.getEmail());
        data.put("password", request.getPassword());

        if (snapshot.exists()) {
            // update existing user
            userRef.update(data);
        } else {
            // create new user
            userRef.set(data);
        }
        return request.getUserId();
    }

    // ───────────────────────────────────────────────────────
    // 🔹 Favorites (user-property link)
    // ───────────────────────────────────────────────────────

    public List<String> getFavoritesIdsForUser(String userId) throws ExecutionException, InterruptedException {
        DocumentSnapshot userDoc = db.collection("users").document(userId).get().get();
        if (!userDoc.exists()) {
            // return empty list if user does not exist
            return List.of();
        }

        List<?> favoritesRaw = (List<?>) userDoc.get("favorites");

        return favoritesRaw == null
                ? List.of()
                : favoritesRaw.stream()
                .map(Object::toString)
                .collect(Collectors.toList());
    }

    public void addFavorite(String userId, String propertyId) throws ExecutionException, InterruptedException {
        DocumentReference userRef = db.collection("users").document(userId);

        DocumentSnapshot snapshot = userRef.get().get();
        if (!snapshot.exists()) {
            throw new IllegalArgumentException("User not found: " + userId);
        }

        // initialize list if it doesn't exist
        if (!snapshot.contains("favorites")) {
            userRef.update("favorites", new ArrayList<String>()).get();
        }

        userRef.update("favorites", FieldValue.arrayUnion(propertyId)).get();
    }

    public void removeFavorite(String userId, String propertyId) throws ExecutionException, InterruptedException {
        DocumentReference userRef = db.collection("users").document(userId);

        DocumentSnapshot snapshot = userRef.get().get();
        if (!snapshot.exists()) {
            throw new IllegalArgumentException("User not found: " + userId);
        }

        userRef.update("favorites", FieldValue.arrayRemove(propertyId)).get();
    }

    public boolean isFavorite(String userId, String propertyId) throws ExecutionException, InterruptedException {
        DocumentSnapshot userDoc = db.collection("users").document(userId).get().get();

        if (!userDoc.exists()) {
            throw new IllegalArgumentException("User not found: " + userId);
        }

        List<?> favoritesRaw = (List<?>) userDoc.get("favorites");
        List<String> favoriteIds = favoritesRaw == null
                ? List.of()
                : favoritesRaw.stream()
                .map(Object::toString)
                .toList();

        return favoriteIds.contains(propertyId);
    }

    // ───────────────────────────────────────────────────────
    // 🔹 Markers
    // ───────────────────────────────────────────────────────

    public List<Marker> getallMarkers() throws ExecutionException, InterruptedException {
        List<QueryDocumentSnapshot> documents = db.collection("properties").get().get().getDocuments();
        return getMarkers(documents);
    }

    public List<Marker> getMarkersByUser(String userId) throws ExecutionException, InterruptedException {
        List<QueryDocumentSnapshot> documents = db.collection("properties")
                .whereEqualTo("userId", userId)
                .get().get().getDocuments();

        return getMarkers(documents);
    }

    private List<Marker> getMarkers(List<QueryDocumentSnapshot> documents) {
        return documents.stream()
                .map(doc -> {
                    Map<String, Object> data = doc.getData();

                    Object locationObj = data.get("location");
                    if (!(locationObj instanceof Map)) return null;

                    Map<String, Object> locationMap = (Map<String, Object>) locationObj;
                    Object latObj = locationMap.get("lat");
                    Object lngObj = locationMap.get("lng");

                    if (!(latObj instanceof Number) || !(lngObj instanceof Number)) return null;

                    Location location = new Location(
                            ((Number) latObj).doubleValue(),
                            ((Number) lngObj).doubleValue()
                    );

                    return new Marker(
                            location,
                            data.get("price") instanceof Number ? ((Number) data.get("price")).doubleValue() : 0.0,
                            data.get("rooms") instanceof Number ? ((Number) data.get("rooms")).intValue() : 0,
                            (String) data.get("title"),
                            data.get("surfaceArea") instanceof Number ? ((Number) data.get("surfaceArea")).doubleValue() : 0.0
                    );
                })
                .filter(Objects::nonNull)
                .toList();
    }

    // ───────────────────────────────────────────────────────
    // 🔹 Viewings
    // ───────────────────────────────────────────────────────

    public String addViewing(ViewingRequest request) throws Exception {
        Map<String, Object> data = new HashMap<>();
        data.put("userId", request.getUserId());
        data.put("propertyId", request.getPropertyId());
        data.put("date", request.getDate());
        data.put("time", request.getTime());

        // search for existing viewing
        ApiFuture<QuerySnapshot> query = db.collection("viewings")
                .whereEqualTo("userId", request.getUserId())
                .whereEqualTo("propertyId", request.getPropertyId())
                .whereEqualTo("date", request.getDate())
                .whereEqualTo("time", request.getTime())
                .get();

        List<QueryDocumentSnapshot> documents = query.get().getDocuments();

        // if viewing already exists, return its ID
        if (!documents.isEmpty()) {
            log.info("Viewing already exists for user {} and property {} on {} at {}",
                    request.getUserId(), request.getPropertyId(), request.getDate(), request.getTime());

            return documents.getFirst().getId();
        }

        // add new viewing
        log.info("Adding new viewing for user {} and property {} on {} at {}",
                request.getUserId(), request.getPropertyId(), request.getDate(), request.getTime());
        ApiFuture<DocumentReference> future = db.collection("viewings").add(data);

        return future.get().getId();
    }

    public List<ViewingResponse> getViewingsByUser(String userId) throws Exception {
        List<ViewingResponse> viewings = new ArrayList<>();

        ApiFuture<QuerySnapshot> future = db.collection("viewings")
                .whereEqualTo("userId", userId)
                .get();

        List<QueryDocumentSnapshot> documents = future.get().getDocuments();

        for (QueryDocumentSnapshot doc : documents) {
            String propertyId = doc.getString("propertyId");

            if (propertyId == null) continue;

            // fetch full property info
            DocumentSnapshot propertyDoc = db.collection("properties").document(propertyId).get().get();
            if (!propertyDoc.exists()) continue;

            PropertyFirebase property = propertyDoc.toObject(PropertyFirebase.class);

            if (property == null) continue;

            property.setId(propertyDoc.getId());

            ViewingResponse viewing = new ViewingResponse(
                    doc.getString("userId"),
                    property,
                    doc.getString("date"),
                    doc.getString("time")
            );

            viewing.setId(doc.getId());

            viewings.add(viewing);
        }

        // filter out past viewings
        LocalDateTime now = LocalDateTime.now();

        viewings = viewings.stream()
                .filter(v -> {
                    try {
                        LocalDateTime viewingDateTime = LocalDateTime.parse(
                                v.getDate() + "T" + v.getTime(),
                                DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm")
                        );

                        // Keep only viewings in the present or future
                        return !viewingDateTime.isBefore(now);
                    } catch (Exception e) {
                        return false;
                    }
                })
                .sorted(Comparator.comparing(v -> {
                    try {
                        return LocalDateTime.parse(
                                v.getDate() + "T" + v.getTime(),
                                DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm")
                        );
                    } catch (Exception e) {
                        return LocalDateTime.MAX;
                    }
                }))
                .collect(Collectors.toList());

        // sort viewings by date and time
        viewings.sort(Comparator.comparing(v -> {
            try {
                return LocalDateTime.parse(
                        v.getDate() + "T" + v.getTime(),
                        DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm")
                );
            } catch (Exception e) {
                // If parsing fails, push to the end
                return LocalDateTime.MAX;
            }
        }));

        return viewings;
    }

    public void deleteViewing(String viewingId) throws Exception {
        db.collection("viewings").document(viewingId).delete().get();
    }

    public List<ViewingsAvailabilityResponse> getViewingAvailability(String propertyId) throws Exception {
        Firestore db = FirestoreClient.getFirestore();

        // get all viewings for the property
        ApiFuture<QuerySnapshot> future = db.collection("viewings")
                .whereEqualTo("propertyId", propertyId)
                .get();

        List<QueryDocumentSnapshot> documents = future.get().getDocuments();

        // map already booked slots by date
        Map<String, Set<String>> bookedSlotsMap = new HashMap<>();
        for (QueryDocumentSnapshot doc : documents) {
            String date = doc.getString("date");  // format yyyy-MM-dd
            String time = doc.getString("time");  // format HH:mm

            if (date != null && time != null) {
                bookedSlotsMap
                        .computeIfAbsent(date, k -> new HashSet<>())
                        .add(time);
            }
        }

        // slots from 10:00 to 16:00
        List<String> hourStrings = new ArrayList<>();
        for (int hour = 10; hour <= 16; hour++) {
            hourStrings.add(String.format("%02d:00", hour));
        }

        // availability list for the next 30 days
        List<ViewingsAvailabilityResponse> availabilityList = new ArrayList<>();
        LocalDate today = LocalDate.now();

        for (int i = 0; i < 30; i++) {
            LocalDate currentDate = today.plusDays(i);
            String dateStr = currentDate.toString();

            Set<String> bookedSlots = bookedSlotsMap.getOrDefault(dateStr, Collections.emptySet());

            List<TimeSlot> freeSlots = hourStrings.stream()
                    .filter(slot -> !bookedSlots.contains(slot))
                    .map(slot -> new TimeSlot(slot, convertToLabel(slot)))
                    .collect(Collectors.toList());

            if (!freeSlots.isEmpty()) {
                availabilityList.add(new ViewingsAvailabilityResponse(dateStr, freeSlots));
            }
        }

        log.info("Generated viewing availability for property {}: {}",
                propertyId, availabilityList);

        return availabilityList;
    }

    private String convertToLabel(String hour24) {
        int hour = Integer.parseInt(hour24.split(":")[0]);
        String ampm = hour < 12 ? "AM" : "PM";
        int hour12 = hour % 12 == 0 ? 12 : hour % 12;
        return hour12 + ":00 " + ampm;
    }


    // ───────────────────────────────────────────────────────
    // 🔹 Reviews
    // ───────────────────────────────────────────────────────

    public List<ReviewResponse> getLatestReviews(int limit) throws Exception {
        List<ReviewResponse> reviews = new ArrayList<>();

        ApiFuture<QuerySnapshot> future = db.collection("reviews")
                .orderBy("date", Query.Direction.DESCENDING)
                .limit(limit)
                .get();

        List<QueryDocumentSnapshot> documents = future.get().getDocuments();
        for (QueryDocumentSnapshot doc : documents) {
            ReviewResponse review = new ReviewResponse(
                    Objects.requireNonNull(doc.getLong("rating")).intValue(),
                    doc.getString("review"),
                    doc.getString("fullName"),
                    doc.getString("email"),
                    doc.getDate("date")
            );
            reviews.add(review);
        }

        return reviews;
    }

    public double getAverageRating() throws Exception {
        List<QueryDocumentSnapshot> docs = db.collection("reviews").get().get().getDocuments();

        if (docs.isEmpty()) return 0.0;

        double sum = 0;
        int count = 0;

        for (QueryDocumentSnapshot doc : docs) {
            Number rating = doc.getDouble("rating");
            if (rating != null) {
                sum += rating.doubleValue();
                count++;
            }
        }

        double avg = count == 0 ? 0.0 : sum / count;

        // round to one decimal place
        return Math.round(avg * 10.0) / 10.0;
    }

    public String addReview(ReviewRequest request) throws Exception {
        Map<String, Object> data = new HashMap<>();
        data.put("rating", request.getRating());
        data.put("review", request.getReview());
        data.put("fullName", request.getFullName());
        data.put("email", request.getEmail());
        data.put("date", new Date());

        return saveAutoId("reviews", data);
    }

    public String saveAutoId(String collection, Map<String, Object> data) throws Exception {
        return db.collection(collection).add(data).get().getId();
    }
}