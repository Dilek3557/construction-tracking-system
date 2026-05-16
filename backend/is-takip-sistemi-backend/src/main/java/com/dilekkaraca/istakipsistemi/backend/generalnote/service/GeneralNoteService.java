package com.dilekkaraca.istakipsistemi.backend.generalnote.service;

import com.dilekkaraca.istakipsistemi.backend.exception.UserNotFoundException;
import com.dilekkaraca.istakipsistemi.backend.generalnote.dto.GeneralNoteResponse;
import com.dilekkaraca.istakipsistemi.backend.generalnote.entity.GeneralNote;
import com.dilekkaraca.istakipsistemi.backend.generalnote.repository.GeneralNoteRepository;
import com.dilekkaraca.istakipsistemi.backend.user.entity.User;
import com.dilekkaraca.istakipsistemi.backend.user.repository.UserRepository;
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
    public GeneralNoteResponse addNote(Long userId, String message) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));

        GeneralNote note = GeneralNote.builder()
                .author(user)
                .message(message)
                .build();

        GeneralNote saved = generalNoteRepository.save(note);

        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<GeneralNoteResponse> getAllNotes() {
        return generalNoteRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    private GeneralNoteResponse mapToResponse(GeneralNote note) {
        return GeneralNoteResponse.builder()
                .id(note.getId())
                .authorUserId(note.getAuthor().getId())
                .authorName(note.getAuthor().getDisplayName())
                .message(note.getMessage())
                .createdAt(note.getCreatedAt())
                .build();
    }
}