package com.medicare.medicare.service;

import com.medicare.medicare.model.User;
import com.medicare.medicare.repository.UserFileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.util.List;

@Service
public class UserService {

    private final UserFileRepository userRepository;

    @Autowired
    public UserService(UserFileRepository userRepository) {
        this.userRepository = userRepository;
    }
    
    @PostConstruct
    public void init() {
        // Create admin user if it doesn't exist
        if (findByEmail("admin@gmail.com") == null) {
            User admin = new User();
            admin.setUsername("Admin");
            admin.setEmail("admin@gmail.com");
            admin.setPassword("admin123");
            admin.setPhone("1234567890");
            admin.setAddress("Admin Office");
            admin.setRole("ADMIN");
            register(admin);
        }
    }

    public User findByEmail(String email) {
        return userRepository.findByEmail(email).orElse(null);
    }

    public User register(User user) {
        // In a real application, you would hash the password before storing
        return userRepository.save(user);
    }

    public User authenticate(String email, String password) {
        User user = findByEmail(email);
        
        // Debug logging to see what's happening
        System.out.println("Attempting to authenticate: " + email);
        if (user != null) {
            System.out.println("User found, comparing passwords");
            System.out.println("Stored password: " + user.getPassword());
            System.out.println("Provided password: " + password);
            
            // Check if passwords match
            boolean passwordMatches = user.getPassword().equals(password);
            System.out.println("Passwords match: " + passwordMatches);
            
            if (passwordMatches) {
                return user;
            }
        }
        
        return null;
    }
    
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // Find user by ID
    public User findById(Long id) {
        return userRepository.findById(id).orElse(null);
    }

    // Update an existing user
    public User update(User user) {
        // If the password field is empty, keep the existing password
        if (user.getPassword() == null || user.getPassword().isEmpty()) {
            User existingUser = findById(user.getId());
            if (existingUser != null) {
                user.setPassword(existingUser.getPassword());
            }
        }
        return userRepository.save(user);
    }

    // Delete a user
    public void deleteUser(Long id) {
        userRepository.delete(id);
    }
}