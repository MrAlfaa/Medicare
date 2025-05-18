package com.medicare.medicare.repository;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.medicare.medicare.model.User;
import org.springframework.stereotype.Repository;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Repository
public class UserFileRepository {
    private static final String FILE_PATH = "src/main/resources/data/users.json";
    private final ObjectMapper objectMapper;

    public UserFileRepository() {
        this.objectMapper = new ObjectMapper();
        // Configure ObjectMapper to ignore unknown properties
        this.objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
    }

    public List<User> findAll() {
        try {
            File file = new File(FILE_PATH);
            if (!file.exists()) {
                return new ArrayList<>();
            }
            
            return objectMapper.readValue(file, new TypeReference<List<User>>() {});
        } catch (IOException e) {
            e.printStackTrace();
            return new ArrayList<>();
        }
    }

    public Optional<User> findById(Long id) {
        return findAll().stream()
                .filter(user -> user.getId().equals(id))
                .findFirst();
    }
    
    public Optional<User> findByEmail(String email) {
        if (email == null) {
            return Optional.empty();
        }
        
        // Add more debugging
        System.out.println("Finding user by email: " + email);
        List<User> users = findAll();
        System.out.println("Total users found: " + users.size());
        
        for (User user : users) {
            System.out.println("Comparing with: " + user.getEmail());
            // Trim both emails and do case-insensitive comparison
            if (email.trim().equalsIgnoreCase(user.getEmail().trim())) {
                System.out.println("User found!");
                return Optional.of(user);
            }
        }
        
        System.out.println("User not found with email: " + email);
        return Optional.empty();
    }

    public User save(User user) {
        List<User> users = findAll();

        // Assign ID if it's a new user
        if (user.getId() == null) {
            long maxId = users.stream()
                    .mapToLong(User::getId)
                    .max()
                    .orElse(0);
            user.setId(maxId + 1);
            users.add(user);
        } else {
            // Update existing user
            for (int i = 0; i < users.size(); i++) {
                if (users.get(i).getId().equals(user.getId())) {
                    users.set(i, user);
                    break;
                }
            }
        }

        saveAll(users);
        return user;
    }

    private void saveAll(List<User> users) {
        try {
            File file = new File(FILE_PATH);
            file.getParentFile().mkdirs();  // Create directories if they don't exist
            objectMapper.writeValue(file, users);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public void delete(Long id) {
        List<User> users = findAll();
        users.removeIf(user -> user.getId().equals(id));
        saveAll(users);
    }
}