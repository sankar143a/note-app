package com.noteapp.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

import org.mindrot.jbcrypt.BCrypt;

import com.noteapp.model.User;
import com.noteapp.util.DBUtil;

public class UserDAO {

    public User getUserByEmail(String email) {
        String sql = "SELECT * FROM users WHERE email = ?";
        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;
        
        System.out.println("🔍 [DEBUG] Checking if user exists: " + email);
        
        try {
            conn = DBUtil.getConnection();
            System.out.println("🔍 [DEBUG] Database connection successful");
            
            stmt = conn.prepareStatement(sql);
            stmt.setString(1, email);
            System.out.println("🔍 [DEBUG] Executing query: " + sql);
            
            rs = stmt.executeQuery();
            
            if (rs.next()) {
                User user = new User();
                user.setId(rs.getInt("id"));
                user.setUsername(rs.getString("username"));
                user.setEmail(rs.getString("email"));
                user.setPassword(rs.getString("password"));
                System.out.println("🔍 [DEBUG] ✅ User FOUND in database: " + user.getEmail());
                return user;
            } else {
                System.out.println("🔍 [DEBUG] ❌ User NOT found in database: " + email);
            }
        } catch (SQLException e) {
            System.out.println("🔍 [DEBUG] SQL Error: " + e.getMessage());
            e.printStackTrace();
        } finally {
            DBUtil.close(conn, stmt, rs);
        }
        return null;
    }

    public boolean createUser(User user) {
        System.out.println("🔍 [DEBUG] Attempting to create user: " + user.getEmail());
        
        // Check if user already exists
        User existingUser = getUserByEmail(user.getEmail());
        if (existingUser != null) {
            System.out.println("🔍 [DEBUG] ❌ User creation FAILED - already exists: " + user.getEmail());
            return false;
        }
        
        String sql = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";
        Connection conn = null;
        PreparedStatement stmt = null;
        
        try {
            conn = DBUtil.getConnection();
            System.out.println("🔍 [DEBUG] Database connection for INSERT successful");
            
            stmt = conn.prepareStatement(sql);
            stmt.setString(1, user.getUsername());
            stmt.setString(2, user.getEmail());
            
            // Hash the password
            String hashedPassword = BCrypt.hashpw(user.getPassword(), BCrypt.gensalt());
            stmt.setString(3, hashedPassword);
            System.out.println("🔍 [DEBUG] Password hashed successfully");
            
            int result = stmt.executeUpdate();
            System.out.println("🔍 [DEBUG] INSERT result: " + result + " rows affected");
            
            if (result > 0) {
                System.out.println("🔍 [DEBUG] ✅ User created successfully: " + user.getEmail());
                return true;
            } else {
                System.out.println("🔍 [DEBUG] ❌ User creation failed - no rows affected");
                return false;
            }
            
        } catch (SQLException e) {
            System.out.println("🔍 [DEBUG] SQL Error during INSERT: " + e.getMessage());
            e.printStackTrace();
            return false;
        } finally {
            DBUtil.close(conn, stmt, null);
        }
    }

public boolean validateUser(String email, String password) {
    System.out.println("Validating user: " + email);
    User user = getUserByEmail(email);
    if (user != null) {
        System.out.println("Found user with hashed password: " + user.getPassword());
        boolean matches = BCrypt.checkpw(password, user.getPassword());
        System.out.println("Password matches: " + matches);
        return matches;
    }
    System.out.println("User not found");
    return false;
}
}