package com.dilekkaraca.is_takip_sistemi_backend.generalnote.service;

import com.dilekkaraca.is_takip_sistemi_backend.generalnote.entity.GeneralNote;
import com.dilekkaraca.is_takip_sistemi_backend.generalnote.repository.GeneralNoteRepository;
import com.dilekkaraca.is_takip_sistemi_backend.user.entity.User;
import com.dilekkaraca.is_takip_sistemi_backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class GeneralNoteService {

    private final GeneralNoteRepository generalNoteRepository;
    private final UserRepository userRepository;

    @Transactional
    public GeneralNote addNote(Long userId, String message) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı. Id: " + userId));

        GeneralNote note = GeneralNote.builder()
                .author(user)
                .message(message)
                .build();

        return generalNoteRepository.save(note);
    }

    public List<GeneralNote> getAllNotes() {
        return generalNoteRepository.findAllByOrderByCreatedAtDesc();
    }
}