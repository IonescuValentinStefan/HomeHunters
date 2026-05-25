package com.example.home_hunters.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.List;

@Data
public class RecommendationRequest {
    @JsonProperty("all_properties")
    private List<PropertyLite> allProperties;

    @JsonProperty("favorite_properties")
    private List<PropertyLite> favoriteProperties;
}
