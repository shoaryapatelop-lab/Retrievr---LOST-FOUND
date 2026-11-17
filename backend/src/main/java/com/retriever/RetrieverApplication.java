package com.retriever;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

/**
 * Entry point for the Retriever Spring Boot application.
 */
@SpringBootApplication
@EnableAsync
public class RetrieverApplication {

    public static void main(String[] args) {
        SpringApplication.run(RetrieverApplication.class, args);
    }
}
