// MedicalStoreApplication.java
package com.medicare.medicare;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(
        exclude = {
                org.springframework.boot.autoconfigure.orm.jpa.HibernateJpaAutoConfiguration.class,
                org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration.class
        }
)
public class MedicareStoreApplication {
    public static void main(String[] args) {
        SpringApplication.run(MedicareStoreApplication.class, args);
    }
}

