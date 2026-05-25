package com.example.home_hunters.controller;

import com.example.home_hunters.dto.PropertyFirebase;
import com.example.home_hunters.dto.PropertyLite;
import com.example.home_hunters.dto.RecommendationRequest;
import com.example.home_hunters.service.FirestoreService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.Comparator;
import java.util.List;
import java.util.Objects;

@Slf4j
@CrossOrigin(origins = {"http://localhost:3000", "https://homehunters.live"})
@RestController
@RequestMapping("/api/firestore")
public class RecommedationController {

    private final FirestoreService firestoreService;
    @Value("${fastapi.url}")
    private String fastapiUrl;

    public RecommedationController(FirestoreService firestoreService) {
        this.firestoreService = firestoreService;
    }

    @GetMapping("/properties/sorted")
    public List<PropertyFirebase> getSortedProperties(
            @RequestParam("sort") String sortType,
            @RequestParam("userId") String userId) throws Exception {

        List<PropertyFirebase> properties = firestoreService.getAllProperties();

        return switch (sortType.toLowerCase()) {
            case "price-desc" -> properties.stream()
                    .sorted(Comparator.comparing(PropertyFirebase::getPrice, Comparator.nullsLast(Comparator.reverseOrder())))
                    .toList();

            case "price-asc" -> properties.stream()
                    .sorted(Comparator.comparing(PropertyFirebase::getPrice, Comparator.nullsLast(Comparator.naturalOrder())))
                    .toList();

            case "newest" -> properties.stream()
                    .sorted(Comparator.comparing(PropertyFirebase::getTimestamp, Comparator.nullsLast(Comparator.reverseOrder())))
                    .toList();

            case "recommended" -> getRecommendedSorted(userId, properties);

            default -> throw new IllegalArgumentException("Unknown sort type: " + sortType);
        };
    }

    private List<PropertyFirebase> getRecommendedSorted(String userId, List<PropertyFirebase> all) {
        try {
            List<PropertyFirebase> favorites = firestoreService.getFavoritesIdsForUser(userId).stream()
                    .map(favId -> all.stream()
                            .filter(p -> p.getId().equals(favId))
                            .findFirst()
                            .orElse(null))
                    .filter(Objects::nonNull)
                    .toList();

            List<PropertyLite> allLite = all.stream().map(this::toLite).toList();
            List<PropertyLite> favLite = favorites.stream().map(this::toLite).toList();

            RecommendationRequest body = new RecommendationRequest();
            body.setAllProperties(allLite);
            body.setFavoriteProperties(favLite);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<RecommendationRequest> request = new HttpEntity<>(body, headers);
            RestTemplate restTemplate = new RestTemplate();

            ResponseEntity<PropertyLite[]> response = restTemplate.postForEntity(
                    fastapiUrl + "/recommend",
                    request,
                    PropertyLite[].class
            );

            List<PropertyLite> sortedLite = List.of(Objects.requireNonNull(response.getBody()));

            // map sortedLite back to PropertyFirebase
            return sortedLite.stream()
                    .map(lite -> all.stream()
                            .filter(p -> p.getId().equals(lite.getId()))
                            .findFirst()
                            .orElse(null))
                    .filter(Objects::nonNull)
                    .toList();

        } catch (Exception e) {
            log.info("Error during recommendation: {}", e.getMessage());
            return all; // fallback
        }
    }


    private PropertyLite toLite(PropertyFirebase pf) {
        PropertyLite lite = new PropertyLite();
        lite.setId(pf.getId());
        lite.setTitle(pf.getTitle());
        lite.setDescription(pf.getDescription());
        lite.setSurfaceArea(pf.getSurfaceArea());
        lite.setRooms(pf.getRooms());
        lite.setBathrooms(pf.getBathrooms());
        lite.setAmenities(pf.getAmenities());
        lite.setTransactionType(pf.getTransactionType());
        lite.setFurnished(pf.getFurnished());
        lite.setPropertyType(pf.getPropertyType());
        lite.setPrice(pf.getPrice());
        return lite;
    }
}