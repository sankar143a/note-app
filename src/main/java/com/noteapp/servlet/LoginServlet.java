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
import javax.servlet.http.HttpSession;

import com.google.gson.Gson;
import com.noteapp.dao.UserDAO;

@WebServlet("/api/login")
public class LoginServlet extends HttpServlet {
    private UserDAO userDAO = new UserDAO();
    private Gson gson = new Gson();

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        
        System.out.println("===== LOGIN SERVLET CALLED =====");
        
        response.setContentType("application/json");
        PrintWriter out = response.getWriter();
        Map<String, Object> result = new HashMap<>();

        try {
            String email = request.getParameter("email");
            String password = request.getParameter("password");

            System.out.println("Login attempt for: " + email);

            if (email == null || password == null || email.trim().isEmpty() || password.trim().isEmpty()) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                result.put("error", "Email and password required");
                out.print(gson.toJson(result));
                return;
            }

            if (userDAO.validateUser(email, password)) {
                HttpSession session = request.getSession();
                session.setAttribute("userEmail", email);
                session.setAttribute("userId", userDAO.getUserByEmail(email).getId());
                
                response.setStatus(HttpServletResponse.SC_OK);
                result.put("success", true);
                result.put("message", "Login successful");
                System.out.println("Login successful for: " + email);
            } else {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                result.put("error", "Invalid credentials");
                System.out.println("Login failed for: " + email);
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