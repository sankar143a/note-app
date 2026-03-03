// IMPORTANT: Set the correct base URL (same as signup.js)
const API_BASE = '/note-app';

document.addEventListener('DOMContentLoaded', function() {
    console.log('Login.js loaded with API_BASE:', API_BASE);
    
    const loginForm = document.getElementById('loginForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            
            console.log('Login attempt for:', email);
            
            if (!email || !password) {
                alert('Please fill in all fields');
                return;
            }
            
            const submitBtn = loginForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Signing in...';
            submitBtn.disabled = true;
            
            try {
                // CORRECT URL with context path
                const url = API_BASE + '/api/login';
                console.log('Sending request to:', url);
                
                const response = await fetch(url, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: new URLSearchParams({
                        email: email,
                        password: password
                    }),
                    credentials: 'include'
                });
                
                console.log('Response status:', response.status);
                
                if (response.ok) {
                    // Login successful
                    console.log('Login successful!');
                    window.location.href = API_BASE + '/dashboard.html';
                } else {
                    // Login failed
                    const data = await response.json();
                    alert('Login failed: ' + (data.error || 'Invalid credentials'));
                }
            } catch (err) {
                console.error('Login error:', err);
                alert('Network error: ' + err.message);
            } finally {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }
});