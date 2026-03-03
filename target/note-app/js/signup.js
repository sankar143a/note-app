// IMPORTANT: Set the correct base URL
const API_BASE = '/note-app';

document.addEventListener('DOMContentLoaded', function() {
    console.log('Signup.js loaded with API_BASE:', API_BASE);
    
    const signupForm = document.getElementById('signupForm');
    
    if (signupForm) {
        signupForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value.trim();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            
            console.log('Form data:', { username, email });
            
            // Validation
            if (!username || !email || !password) {
                alert('Please fill in all fields');
                return;
            }
            
            if (password.length < 6) {
                alert('Password must be at least 6 characters');
                return;
            }
            
            const submitBtn = signupForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Creating account...';
            submitBtn.disabled = true;
            
            try {
                // CORRECT URL with context path
                const url = API_BASE + '/api/signup';
                console.log('Sending request to:', url);
                
                const response = await fetch(url, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: new URLSearchParams({
                        username: username,
                        email: email,
                        password: password
                    })
                });
                
                console.log('Response status:', response.status);
                
                if (response.status === 201) {
                    alert('Account created successfully! Please login.');
                    window.location.href = API_BASE + '/index.html';
                } else {
                    const data = await response.json();
                    alert('Error: ' + (data.error || 'Signup failed'));
                }
            } catch (err) {
                console.error('Fetch error:', err);
                alert('Network error: ' + err.message);
            } finally {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }
});