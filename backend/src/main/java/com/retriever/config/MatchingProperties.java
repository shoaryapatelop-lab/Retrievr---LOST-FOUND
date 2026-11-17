package com.retriever.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "app.matching")
public class MatchingProperties {
    private Weights weights = new Weights();
    private double threshold = 30.0;
    private int maxCandidates = 100;

    public Weights getWeights() { return weights; }
    public void setWeights(Weights weights) { this.weights = (weights == null ? new Weights() : weights); }
    public double getThreshold() { return threshold; }
    public void setThreshold(double threshold) { this.threshold = threshold; }
    public int getMaxCandidates() { return maxCandidates; }
    public void setMaxCandidates(int maxCandidates) { this.maxCandidates = maxCandidates; }

    public static class Weights {
        private double name = 25;
        private double category = 20;
        private double color = 10;
        private double brand = 10;
        private double description = 15;
        private double location = 10;
        private double date = 10;

        public double getName() { return name; }
        public void setName(double name) { this.name = name; }
        public double getCategory() { return category; }
        public void setCategory(double category) { this.category = category; }
        public double getColor() { return color; }
        public void setColor(double color) { this.color = color; }
        public double getBrand() { return brand; }
        public void setBrand(double brand) { this.brand = brand; }
        public double getDescription() { return description; }
        public void setDescription(double description) { this.description = description; }
        public double getLocation() { return location; }
        public void setLocation(double location) { this.location = location; }
        public double getDate() { return date; }
        public void setDate(double date) { this.date = date; }

        public double total() { return name + category + color + brand + description + location + date; }
        public double normalizedName() { return total() == 0 ? 0 : name / total(); }
        public double normalizedCategory() { return total() == 0 ? 0 : category / total(); }
        public double normalizedColor() { return total() == 0 ? 0 : color / total(); }
        public double normalizedBrand() { return total() == 0 ? 0 : brand / total(); }
        public double normalizedDescription() { return total() == 0 ? 0 : description / total(); }
        public double normalizedLocation() { return total() == 0 ? 0 : location / total(); }
        public double normalizedDate() { return total() == 0 ? 0 : date / total(); }
    }
}