package com.medicare.medicare.repository;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.medicare.medicare.model.Order;
import org.springframework.stereotype.Repository;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Repository
public class OrderFileRepository {
    private static final String FILE_PATH = "src/main/resources/data/orders.json";
    private final ObjectMapper objectMapper;

    public OrderFileRepository() {
        this.objectMapper = new ObjectMapper();
        this.objectMapper.registerModule(new JavaTimeModule());
    }

    public List<Order> findAll() {
        try {
            File file = new File(FILE_PATH);
            if (!file.exists()) {
                return new ArrayList<>();
            }
            return objectMapper.readValue(file, new TypeReference<List<Order>>() {});
        } catch (IOException e) {
            e.printStackTrace();
            return new ArrayList<>();
        }
    }

    public List<Order> findByUserId(Long userId) {
        return findAll().stream()
                .filter(order -> order.getUserId().equals(userId))
                .toList();
    }

    public Optional<Order> findById(Long id) {
        return findAll().stream()
                .filter(order -> order.getId().equals(id))
                .findFirst();
    }

    public Order save(Order order) {
        List<Order> orders = findAll();

        // Assign ID if it's a new order
        if (order.getId() == null) {
            long maxId = orders.stream()
                    .mapToLong(Order::getId)
                    .max()
                    .orElse(0);
            order.setId(maxId + 1);
            orders.add(order);
        } else {
            // Update existing order
            for (int i = 0; i < orders.size(); i++) {
                if (orders.get(i).getId().equals(order.getId())) {
                    orders.set(i, order);
                    break;
                }
            }
        }

        saveAll(orders);
        return order;
    }

    private void saveAll(List<Order> orders) {
        try {
            File file = new File(FILE_PATH);
            file.getParentFile().mkdirs();  // Create directories if they don't exist
            objectMapper.writeValue(file, orders);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}