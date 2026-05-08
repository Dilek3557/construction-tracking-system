package com.dilekkaraca.istakipsistemi.backend.generalnote.controller;

import com.dilekkaraca.istakipsistemi.backend.generalnote.dto.GeneralNoteCreateRequest;
import com.dilekkaraca.istakipsistemi.backend.generalnote.dto.GeneralNoteResponse;
import com.dilekkaraca.istakipsistemi.backend.generalnote.service.GeneralNoteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/general-notes")
@RequiredArgsConstructor
public class GeneralNoteController {

    private final GeneralNoteService generalNoteService;

    @PostMapping
    public GeneralNoteResponse addNote(
            @Valid @RequestBody GeneralNoteCreateRequest request
    ) {
        return generalNoteService.addNote(
                request.getUserId(),
                request.getMessage()
        );
    }

    @GetMapping
    public List<GeneralNoteResponse> getAllNotes() {
        return generalNoteService.getAllNotes();
    }

}