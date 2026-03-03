package com.noteapp.servlet;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.gson.Gson;
import com.noteapp.dao.UserDAO;
import com.noteapp.model.User;

@WebServlet("/api/signup")
public class SignupServlet extends HttpServlet {
    private UserDAO userDAO = new UserDAO();
    private Gson gson = new Gson();

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        
        System.out.println("===== SIGNUP SERVLET CALLED =====");
        
        response.setContentType("application/json");
        PrintWriter out = response.getWriter();
        Map<String, Object> result = new HashMap<>();

        try {
            String username = request.getParameter("username");
            String email = request.getParameter("email");
            String password = request.getParameter("password");

            System.out.println("Received: username=" + username + ", email=" + email);

            // Validation
            if (username == null || email == null || password == null ||
                username.trim().isEmpty() || email.trim().isEmpty() || password.trim().isEmpty()) {
                
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                result.put("error", "All fields are required");
                out.print(gson.toJson(result));
                return;
            }

            if (password.length() < 6) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                result.put("error", "Password must be at least 6 characters");
                out.print(gson.toJson(result));
                return;
            }

            // Create user
            User user = new User();
            user.setUsername(username);
            user.setEmail(email);
            user.setPassword(password);

            if (userDAO.createUser(user)) {
                response.setStatus(HttpServletResponse.SC_CREATED);
                result.put("success", true);
                result.put("message", "User created successfully");
                System.out.println("User created successfully: " + email);
            } else {
                response.setStatus(HttpServletResponse.SC_CONFLICT);
                result.put("error", "User already exists");
                System.out.println("User already exists: " + email);
            }
        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            result.put("error", "Server error: " + e.getMessage());
        }
        
        out.print(gson.toJson(result));
        out.flush();
    }
}