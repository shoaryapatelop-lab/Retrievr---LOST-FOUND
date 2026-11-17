package com.retriever.service;

import com.retriever.dto.ClaimRequest;
import com.retriever.dto.ClaimResponse;
import com.retriever.entity.*;
import com.retriever.entity.Student;
import com.retriever.mapper.ClaimMapper;
import com.retriever.repository.ClaimRepository;
import com.retriever.repository.ItemRepository;
import com.retriever.repository.UserRepository;
import com.retriever.service.impl.ClaimServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class ClaimServiceTest {

    @Mock private ClaimRepository claimRepository;
    @Mock private ItemRepository itemRepository;
    @Mock private UserRepository userRepository;
    @Mock private NotificationService notificationService;
    @Mock private ClaimMapper claimMapper;

    @InjectMocks
    private ClaimServiceImpl claimService;

    private User reporter;
    private User claimer;
    private Item item;
    private Claim pendingClaim;

    @BeforeEach
    void setUp() {
        reporter = Student.builder().id(1L).email("reporter@example.com").build();
        claimer = Student.builder().id(2L).email("claimer@example.com").build();
        item = new FoundItem();
        item.setId(10L);
        item.setTitle("Phone");
        item.setStatus(ItemStatus.AVAILABLE);
        item.setReporter(reporter);

        pendingClaim = new Claim();
        pendingClaim.setId(5L);
        pendingClaim.setItem(item);
        pendingClaim.setClaimer(claimer);
        pendingClaim.setStatus(ClaimStatus.PENDING);

        when(userRepository.findById(1L)).thenReturn(Optional.of(reporter));
        when(userRepository.findById(2L)).thenReturn(Optional.of(claimer));
        when(itemRepository.findById(10L)).thenReturn(Optional.of(item));
        when(claimMapper.toResponse(any(Claim.class))).thenAnswer(inv -> {
            Claim c = inv.getArgument(0);
            ClaimResponse r = new ClaimResponse();
            r.setId(c.getId());
            r.setStatus(c.getStatus());
            return r;
        });
    }

    @Test
    void submitClaim_success() {
        when(claimRepository.findByClaimerId(2L)).thenReturn(List.of());
        when(claimRepository.save(any(Claim.class))).thenAnswer(inv -> {
            Claim c = inv.getArgument(0);
            c.setId(5L);
            return c;
        });

        ClaimRequest req = new ClaimRequest();
        req.setItemId(10L);
        req.setMessage("Mine");

        ClaimResponse res = claimService.submitClaim(req, 2L);

        assertThat(res.getId()).isEqualTo(5L);
        assertThat(res.getStatus()).isEqualTo(ClaimStatus.PENDING);
        verify(notificationService, times(2)).createNotification(any(User.class), any(NotificationType.class), anyString(), anyString(), anyString(), any());
    }

    @Test
    void submitClaim_ownItem_throws() {
        when(itemRepository.findById(10L)).thenReturn(Optional.of(item));
        ClaimRequest req = new ClaimRequest();
        req.setItemId(10L);
        assertThatThrownBy(() -> claimService.submitClaim(req, 1L))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("cannot claim your own item");
    }

    @Test
    void submitClaim_duplicatePending_throws() {
        when(claimRepository.findByClaimerId(2L)).thenReturn(List.of(pendingClaim));
        ClaimRequest req = new ClaimRequest();
        req.setItemId(10L);
        assertThatThrownBy(() -> claimService.submitClaim(req, 2L))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("already have a pending claim");
    }

    @Test
    void submitClaim_returnedItem_throws() {
        item.setStatus(ItemStatus.RETURNED);
        when(itemRepository.findById(10L)).thenReturn(Optional.of(item));
        ClaimRequest req = new ClaimRequest();
        req.setItemId(10L);
        assertThatThrownBy(() -> claimService.submitClaim(req, 2L))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("already been returned");
    }

    @Test
    void submitClaim_missingItemId_throws() {
        ClaimRequest req = new ClaimRequest();
        assertThatThrownBy(() -> claimService.submitClaim(req, 2L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Item ID is required");
    }

    @Test
    void approveClaim_success() {
        when(claimRepository.findById(5L)).thenReturn(Optional.of(pendingClaim));
        when(claimRepository.findByItemId(10L)).thenReturn(List.of(pendingClaim));
        when(claimRepository.save(any(Claim.class))).thenAnswer(inv -> inv.getArgument(0));
        when(itemRepository.save(any(Item.class))).thenAnswer(inv -> inv.getArgument(0));

        ClaimResponse res = claimService.approveClaim(5L);

        assertThat(res.getStatus()).isEqualTo(ClaimStatus.APPROVED);
        verify(itemRepository).save(any(Item.class));
    }

    @Test
    void approveClaim_nonPending_throws() {
        pendingClaim.setStatus(ClaimStatus.APPROVED);
        when(claimRepository.findById(5L)).thenReturn(Optional.of(pendingClaim));
        assertThatThrownBy(() -> claimService.approveClaim(5L))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Only pending claims can be approved");
    }

    @Test
    void rejectClaim_success() {
        when(claimRepository.findById(5L)).thenReturn(Optional.of(pendingClaim));
        when(claimRepository.findByItemId(10L)).thenReturn(List.of(pendingClaim));
        when(claimRepository.save(any(Claim.class))).thenAnswer(inv -> inv.getArgument(0));
        when(itemRepository.save(any(Item.class))).thenAnswer(inv -> inv.getArgument(0));

        ClaimResponse res = claimService.rejectClaim(5L);

        assertThat(res.getStatus()).isEqualTo(ClaimStatus.REJECTED);
    }

    @Test
    void rejectClaim_nonPending_throws() {
        pendingClaim.setStatus(ClaimStatus.REJECTED);
        when(claimRepository.findById(5L)).thenReturn(Optional.of(pendingClaim));
        assertThatThrownBy(() -> claimService.rejectClaim(5L))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Only pending claims can be rejected");
    }
}
