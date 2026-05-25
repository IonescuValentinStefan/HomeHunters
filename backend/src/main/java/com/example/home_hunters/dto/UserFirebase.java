package com.example.home_hunters.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class UserFirebase {
    private String id;
    private String name;
    private String email;
    private String password;
    private List<String> favorites;
}
