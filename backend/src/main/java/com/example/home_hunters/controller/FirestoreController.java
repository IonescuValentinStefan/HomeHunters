package com.example.home_hunters.controller;

import com.example.home_hunters.dto.*;
import com.example.home_hunters.service.FirestoreService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Slf4j
@CrossOrigin(origins = {"http://localhost:3000", "https://homehunters.live"})
@RestController
@RequestMapping("/api/firestore")
public class FirestoreController {

    private final FirestoreService firestoreService;

    public FirestoreController(FirestoreService firestoreService) {
        this.firestoreService = firestoreService;
    }

    @PostMapping("/{collection}/{id}")
    public String save(@PathVariable String collection, @PathVariable String id, @RequestBody Map<String, Object> data) throws Exception {
        return firestoreService.save(collection, id, data);
    }

    @GetMapping("/{collection}/{id}")
    public Map<String, Object> get(@PathVariable String collection, @PathVariable String id) throws Exception {
        return firestoreService.get(collection, id);
    }

    @GetMapping("/properties")
    public List<PropertyFirebase> getAllProperties() throws Exception {

        log.info("Fetching all properties from Firestore");
        return firestoreService.getAllProperties();
    }

    @PostMapping("/properties")
    public String addProperty(@RequestBody PropertyFirebase property) throws Exception {

        log.info("Adding new property: {}", property);
        return firestoreService.addPropertyAutoId("properties", property);
    }

    @DeleteMapping("/properties/{propertyId}")
    public ResponseEntity<String> deleteProperty(@PathVariable String propertyId) {

        log.info("Deleting property with ID: {}", propertyId);

        try {
            firestoreService.deleteProperty(propertyId);
            return ResponseEntity.ok("Property deleted successfully.");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Failed to delete property: " + e.getMessage());
        }
    }

    @GetMapping("/properties/user/{userId}")
    public ResponseEntity<List<PropertyFirebase>> getPropertiesByUser(@PathVariable String userId) {

        log.info("Fetching properties for user: {}", userId);

        try {
            List<PropertyFirebase> properties = firestoreService.getPropertiesByUser(userId);
            return ResponseEntity.ok(properties);
        } catch (Exception e) {
            log.error("Failed to fetch properties for user: {}. Error: {}", userId, e.getMessage());
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/users/{userId}/favorites")
    public List<String> getUserFavorites(@PathVariable String userId) throws Exception {

        log.info("Fetching favorite properties for user: {}", userId);
        return firestoreService.getFavoritesIdsForUser(userId);
    }

    @GetMapping("/users")
    public List<UserFirebase> getAllUsers() throws Exception {

        log.info("Fetching all users from Firestore");
        return firestoreService.getAllUsers();
    }

    @PostMapping("/users")
    public ResponseEntity<String> addOrUpdateUser(@RequestBody UserRequest request) {

        log.info("Adding or updating user: {}", request);

        try {
            String id = firestoreService.addOrUpdateUser(request);
            return ResponseEntity.ok("User added with ID: " + id);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Failed to add user: " + e.getMessage());
        }
    }

    @GetMapping("/properties/markers")
    public List<Marker> getAllMarkers() throws Exception {

        log.info("Fetching all markers from Firestore");
        return firestoreService.getallMarkers();
    }

    @GetMapping("/properties/markers/user/{userId}")
    public List<Marker> getUserMarkers(@PathVariable String userId) throws Exception {

        log.info("Fetching markers for user: {}", userId);
        return firestoreService.getMarkersByUser(userId);
    }

    @PostMapping("/users/{userId}/favorites/{propertyId}")
    public ResponseEntity<String> addFavorite(
            @PathVariable String userId,
            @PathVariable String propertyId) {

        log.info("Adding favorite for user: {}, property: {}", userId, propertyId);

        try {
            firestoreService.addFavorite(userId, propertyId);
            log.info("Favorite added successfully for user: {}, property: {}", userId, propertyId);
            return ResponseEntity.ok("Property added to favorites.");
        } catch (Exception e) {
            log.error("Failed to add favorite for user: {}, property: {}. Error: {}", userId, propertyId, e.getMessage());
            return ResponseEntity.status(500).body("Failed to add favorite: " + e.getMessage());
        }
    }

    @DeleteMapping("/users/{userId}/favorites/{propertyId}")
    public ResponseEntity<String> removeFavorite(
            @PathVariable String userId,
            @PathVariable String propertyId) {

        log.info("Removing favorite for user: {}, property: {}", userId, propertyId);

        try {
            firestoreService.removeFavorite(userId, propertyId);
            log.info("Favorite removed successfully for user: {}, property: {}", userId, propertyId);
            return ResponseEntity.ok("Property removed from favorites.");
        } catch (Exception e) {
            log.error("Failed to remove favorite for user: {}, property: {}. Error: {}", userId, propertyId, e.getMessage());
            return ResponseEntity.status(500).body("Failed to remove favorite: " + e.getMessage());
        }
    }

    @GetMapping("/users/{userId}/favorites/{propertyId}/check")
    public ResponseEntity<Boolean> isFavorite(
            @PathVariable String userId,
            @PathVariable String propertyId) {

        log.info("Checking if property: {} is favorite for user: {}", propertyId, userId);

        try {
            boolean isFavorite = firestoreService.isFavorite(userId, propertyId);
            log.info("Favorite check for user: {}, property: {} returned: {}", userId, propertyId, isFavorite);
            return ResponseEntity.ok(isFavorite);
        } catch (Exception e) {
            log.error("Failed to check favorite for user: {}, property: {}. Error: {}", userId, propertyId, e.getMessage());
            return ResponseEntity.status(500).build();
        }
    }

    @PostMapping("/viewings")
    public ResponseEntity<String> addViewing(@RequestBody ViewingRequest request) {

        log.info("Scheduling viewing for property: {}, user: {}", request.getPropertyId(), request.getUserId());

        try {
            String docId = firestoreService.addViewing(request);
            log.info("Viewing scheduled successfully with ID: {}", docId);
            return ResponseEntity.ok("Viewing scheduled with ID: " + docId);
        } catch (Exception e) {
            log.error("Failed to schedule viewing for property: {}, user: {}. Error: {}", request.getPropertyId(), request.getUserId(), e.getMessage());
            return ResponseEntity.status(500).body("Failed to schedule viewing: " + e.getMessage());
        }
    }

    @GetMapping("/viewings/user/{userId}")
    public ResponseEntity<List<ViewingResponse>> getViewingsByUser(@PathVariable String userId) {

        log.info("Fetching viewings for user: {}", userId);

        try {
            List<ViewingResponse> viewings = firestoreService.getViewingsByUser(userId);
            if (viewings.isEmpty()) {
                log.info("No viewings found for user: {}", userId);
                return ResponseEntity.ok(viewings);
            } else {
                log.info("Found {} viewings for user: {}", viewings.size(), userId);
            }
            return ResponseEntity.ok(viewings);
        } catch (Exception e) {
            log.error("Failed to fetch viewings for user: {}. Error: {}", userId, e.getMessage());
            return ResponseEntity.status(500).build();
        }
    }

    @DeleteMapping("/viewings/{viewingId}")
    public ResponseEntity<String> cancelViewing(@PathVariable String viewingId) {

        log.info("Cancelling viewing with ID: {}", viewingId);

        try {
            firestoreService.deleteViewing(viewingId);
            log.info("Viewing with ID: {} cancelled successfully.", viewingId);
            return ResponseEntity.ok("Viewing cancelled successfully.");
        } catch (Exception e) {
            log.error("Failed to cancel viewing with ID: {}. Error: {}", viewingId, e.getMessage());
            return ResponseEntity.status(500).body("Failed to cancel viewing: " + e.getMessage());
        }
    }

    @PostMapping("/reviews")
    public ResponseEntity<String> addReview(@RequestBody ReviewRequest request) {

        log.info("Adding review for user : {} ({}) , with rating: {}, with review: {}",
                request.getFullName(), request.getEmail(), request.getRating(), request.getReview());

        try {
            String id = firestoreService.addReview(request);
            log.info("Review added successfully with ID: {}", id);
            return ResponseEntity.ok("Review added with ID: " + id);
        } catch (Exception e) {
            log.error("Failed to add review for user: {}. Error: {}", request.getEmail(), e.getMessage());
            return ResponseEntity.status(500).body("Failed to add review: " + e.getMessage());
        }
    }

    @GetMapping("/reviews/latest")
    public ResponseEntity<List<ReviewResponse>> getLatestReviews() {

        log.info("Fetching latest reviews from Firestore");

        try {
            List<ReviewResponse> reviews = firestoreService.getLatestReviews(3);
            if (reviews.isEmpty()) {
                log.info("No reviews found.");
                return ResponseEntity.ok(reviews);
            } else {
                log.info("Found {} latest reviews.", reviews.size());
            }
            return ResponseEntity.ok(reviews);
        } catch (Exception e) {
            log.error("Failed to fetch latest reviews. Error: {}", e.getMessage());
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/reviews/average-rating")
    public ResponseEntity<Double> getAverageRating() {

        log.info("Calculating average rating from reviews");

        try {
            double average = firestoreService.getAverageRating();
            log.info("Average rating calculated: {}", average);
            return ResponseEntity.ok(average);
        } catch (Exception e) {
            log.error("Failed to calculate average rating. Error: {}", e.getMessage());
            return ResponseEntity.status(500).body(0.0);
        }
    }

    @GetMapping("/availability")
    public ResponseEntity<List<ViewingsAvailabilityResponse>> getAvailability(@RequestParam String propertyId) {

        log.info("Fetching viewing availability for property ID: {}", propertyId);

        try {
            List<ViewingsAvailabilityResponse> availability = firestoreService.getViewingAvailability(propertyId);
            if (availability.isEmpty()) {
                log.info("No availability found for property ID: {}", propertyId);
                return ResponseEntity.ok(availability);
            } else {
                log.info("Found {} available viewings for property ID: {}", availability.size(), propertyId);
            }
            return ResponseEntity.ok(availability);
        } catch (Exception e) {
            log.error("Failed to fetch availability for property ID: {}. Error: {}", propertyId, e.getMessage());
            return ResponseEntity.status(500).build();
        }
    }

}
