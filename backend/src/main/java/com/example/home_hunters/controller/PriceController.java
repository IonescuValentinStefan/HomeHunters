package com.example.home_hunters.controller;

import com.example.home_hunters.dto.FormData;
import lombok.Getter;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.Objects;

@Slf4j
@CrossOrigin(origins = {"http://localhost:3000", "https://homehunters.live"})
@RestController
@RequestMapping("/api")
public class PriceController {

    @Value("${fastapi.url}")
    private String fastapiUrl;

    @PostMapping("/price")
    public ResponseEntity<Integer> getRecommendedPrice(@RequestBody FormData data) {
        try {

            log.info("Received data: {}", data);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<FormData> request = new HttpEntity<>(data, headers);
            RestTemplate restTemplate = new RestTemplate();

            ResponseEntity<PythonPriceResponse> response = restTemplate.postForEntity(
                    fastapiUrl + "/calculate-price", request, PythonPriceResponse.class
            );

            int price = Objects.requireNonNull(response.getBody()).getPrice();

            log.info("Price received: {}", price);

            return ResponseEntity.ok(price);

        } catch (Exception e) {
            return ResponseEntity.ok(2000);
        }
    }

    @Getter
    @Setter
    static class PythonPriceResponse {
        private int price;
    }
}