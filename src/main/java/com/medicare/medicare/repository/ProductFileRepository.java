// ProductFileRepository.java
package com.medicare.medicare.repository;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.medicare.medicare.model.Product;
import org.springframework.stereotype.Repository;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Repository
public class ProductFileRepository {
    private static final String FILE_PATH = "src/main/resources/data/products.json";
    private final ObjectMapper objectMapper = new ObjectMapper();

    public List<Product> findAll() {
        try {
            File file = new File(FILE_PATH);
            if (!file.exists()) {
                return new ArrayList<>();
            }
            return objectMapper.readValue(file, new TypeReference<List<Product>>() {});
        } catch (IOException e) {
            e.printStackTrace();
            return new ArrayList<>();
        }
    }

    public Optional<Product> findById(Long id) {
        return findAll().stream()
                .filter(product -> product.getId().equals(id))
                .findFirst();
    }

    public Product save(Product product) {
        List<Product> products = findAll();

        // Assign ID if it's a new product
        if (product.getId() == null) {
            long maxId = products.stream()
                    .mapToLong(Product::getId)
                    .max()
                    .orElse(0);
            product.setId(maxId + 1);
            products.add(product);
        } else {
            // Update existing product
            for (int i = 0; i < products.size(); i++) {
                if (products.get(i).getId().equals(product.getId())) {
                    products.set(i, product);
                    break;
                }
            }
        }

        saveAll(products);
        return product;
    }

    public void delete(Long id) {
        List<Product> products = findAll();
        products.removeIf(product -> product.getId().equals(id));
        saveAll(products);
    }

    private void saveAll(List<Product> products) {
        try {
            File file = new File(FILE_PATH);
            file.getParentFile().mkdirs();  // Create directories if they don't exist
            objectMapper.writeValue(file, products);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}