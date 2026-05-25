package com.example.home_hunters.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;

import java.io.InputStream;

@Slf4j
@Configuration
public class FirebaseConfig {

    @PostConstruct
    public void init() {
        try {
            InputStream serviceAccount =
                    getClass().getClassLoader().getResourceAsStream("firebase/homehunters-92c76-firebase-adminsdk-h2dej-9eb5f4f8f2.json");

            FirebaseOptions options = null;
            if (serviceAccount != null) {
                options = FirebaseOptions.builder()
                        .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                        .build();
            }

            if (FirebaseApp.getApps().isEmpty()) {
                if (options != null) {
                    FirebaseApp.initializeApp(options);
                    log.info("Firebase initialized");
                } else {
                    log.info("Firebase options were null");
                }
            }
        } catch (Exception e) {
            throw new RuntimeException("Could not initialize Firebase", e);
        }
    }
}
