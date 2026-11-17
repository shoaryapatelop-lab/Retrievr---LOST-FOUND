package com.retriever.service;

import com.retriever.dto.MatchResponse;
import com.retriever.entity.Item;

import java.util.List;

public interface MatchService {
    List<MatchResponse> findMatches(Item newItem);
    List<MatchResponse> refreshMatches(Long itemId);
}