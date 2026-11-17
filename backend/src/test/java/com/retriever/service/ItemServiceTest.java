package com.retriever.service;

import com.retriever.dto.ItemRequest;
import com.retriever.dto.ItemResponse;
import com.retriever.entity.*;
import com.retriever.mapper.ItemMapper;
import com.retriever.repository.*;
import com.retriever.service.impl.ItemServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class ItemServiceTest {

    @Mock private ItemRepository itemRepository;
    @Mock private LostItemRepository lostItemRepository;
    @Mock private FoundItemRepository foundItemRepository;
    @Mock private UserRepository userRepository;
    @Mock private CategoryRepository categoryRepository;
    @Mock private ItemMapper itemMapper;
    @Mock private MatchService matchService;

    @InjectMocks
    private ItemServiceImpl itemService;

    private User reporter;
    private Category category;

    @BeforeEach
    void setUp() {
        reporter = Student.builder().id(1L).email("u@example.com").build();
        category = new Category();
        category.setId(2L);
        category.setName("Electronics");
        when(userRepository.findById(1L)).thenReturn(Optional.of(reporter));
        when(categoryRepository.findById(2L)).thenReturn(Optional.of(category));
    }

    @Test
    void reportLostItem_success() {
        ItemRequest req = new ItemRequest();
        req.setTitle("Lost Phone");
        req.setDescription("Black phone");
        req.setLocationFound("Campus");
        req.setCategoryId(2L);
        req.setDateFound(LocalDateTime.now());

        LostItem saved = new LostItem();
        saved.setId(10L);
        when(lostItemRepository.save(any(LostItem.class))).thenReturn(saved);
        ItemResponse expected = new ItemResponse();
        expected.setId(10L);
        when(itemMapper.toResponse(saved)).thenReturn(expected);

        ItemResponse res = itemService.reportLostItem(req, 1L);

        assertThat(res.getId()).isEqualTo(10L);
    }

    @Test
    void getItemById_notFound_throws() {
        when(itemRepository.findById(99L)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> itemService.getItemById(99L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Item not found");
    }
}
