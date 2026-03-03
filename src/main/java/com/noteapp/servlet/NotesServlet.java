package com.noteapp.servlet;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.PrintWriter;
import java.time.LocalDateTime;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.noteapp.dao.NoteDAO;
import com.noteapp.model.Note;
import com.noteapp.util.LocalDateTimeAdapter;

@WebServlet("/api/notes")
public class NotesServlet extends HttpServlet {
    private NoteDAO noteDAO = new NoteDAO();
    private Gson gson = new GsonBuilder()
            .registerTypeAdapter(LocalDateTime.class, new LocalDateTimeAdapter())
            .create();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("userId") == null) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }
        
        response.setContentType("application/json");
        PrintWriter out = response.getWriter();
        
        try {
            int userId = (int) session.getAttribute("userId");
            List<Note> notes = noteDAO.getNotesByUserId(userId);
            String json = gson.toJson(notes);
            out.print(json);
        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.print("{\"error\":\"Failed to load notes\"}");
        }
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("userId") == null) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }
        
        response.setContentType("application/json");
        PrintWriter out = response.getWriter();
        
        try {
            // Read request body
            BufferedReader reader = request.getReader();
            Note note = gson.fromJson(reader, Note.class);
            
            // Set user ID from session
            int userId = (int) session.getAttribute("userId");
            note.setUserId(userId);
            
            // Set default title if empty
            if (note.getTitle() == null || note.getTitle().trim().isEmpty()) {
                note.setTitle("Untitled");
            }
            
            // Save to database
            int newId = noteDAO.createNote(note);
            
            if (newId != -1) {
                note.setId(newId);
                response.setStatus(HttpServletResponse.SC_CREATED);
                out.print(gson.toJson(note));
            } else {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                out.print("{\"error\":\"Failed to create note\"}");
            }
        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.print("{\"error\":\"" + e.getMessage() + "\"}");
        }
    }
}