package com.retriever.service;

import com.retriever.entity.User;
import com.retriever.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

/**
 * Resolves the authenticated {@link User} from the security context.
 *
 * <p>The JWT subject (and therefore {@link Authentication#getName()}) is the user's
 * email, so controllers must look the user up by email rather than parsing the name
 * as a numeric id.
 */
@Service
@RequiredArgsConstructor
public class CurrentUserService {

    private final UserRepository userRepository;

    public User get(Authentication authentication) {
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }

    public Long id(Authentication authentication) {
        return get(authentication).getId();
    }
}