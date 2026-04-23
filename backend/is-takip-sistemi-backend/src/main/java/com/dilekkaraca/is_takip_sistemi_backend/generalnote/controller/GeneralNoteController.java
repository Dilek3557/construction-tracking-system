package com.dilekkaraca.is_takip_sistemi_backend.generalnote.controller;

import com.dilekkaraca.is_takip_sistemi_backend.generalnote.entity.GeneralNote;
import com.dilekkaraca.is_takip_sistemi_backend.generalnote.service.GeneralNoteService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/general-notes")
@RequiredArgsConstructor
public class GeneralNoteController {

    private final GeneralNoteService generalNoteService;

    @PostMapping
    public GeneralNote addNote(
            @RequestParam Long userId,
            @RequestParam String message
    ) {
        return generalNoteService.addNote(userId, message);
    }

    @GetMapping
    public List<GeneralNote> getAllNotes() {
        return generalNoteService.getAllNotes();
    }
}