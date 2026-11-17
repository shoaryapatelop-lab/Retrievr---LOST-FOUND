package com.retriever.strategy;

import com.retriever.entity.Item;

public interface MatchingStrategy {
    double score(Item source, Item candidate);
    String name();
}