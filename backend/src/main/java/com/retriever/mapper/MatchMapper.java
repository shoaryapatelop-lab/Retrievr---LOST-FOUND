package com.retriever.mapper;

import com.retriever.dto.MatchResponse;
import com.retriever.entity.Item;
import com.retriever.entity.ItemMatch;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class MatchMapper {
    public MatchResponse toResponse(ItemMatch match) {
        if (match == null) return null;
        Item lost = match.getLostItem();
        Item found = match.getFoundItem();
        return MatchResponse.builder()
                .id(match.getId())
                .lostItemId(lost != null ? lost.getId() : null)
                .lostItemTitle(lost != null ? lost.getTitle() : null)
                .foundItemId(found != null ? found.getId() : null)
                .foundItemTitle(found != null ? found.getTitle() : null)
                .matchScore(match.getMatchScore())
                .nameScore(match.getNameScore())
                .categoryScore(match.getCategoryScore())
                .colorScore(match.getColorScore())
                .brandScore(match.getBrandScore())
                .locationScore(match.getLocationScore())
                .dateScore(match.getDateScore())
                .descriptionScore(match.getDescriptionScore())
                .build();
    }

    public List<MatchResponse> toResponseList(List<ItemMatch> matches) {
        return matches == null ? List.of() : matches.stream().map(this::toResponse).collect(Collectors.toList());
    }
}
