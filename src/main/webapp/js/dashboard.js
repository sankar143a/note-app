const API_BASE = '/note-app';

document.addEventListener('DOMContentLoaded', function() {
    console.log('Dashboard.js loaded');
    loadNotes();
    
    // New Note button
    document.getElementById('newNoteBtn').addEventListener('click', function() {
        window.location.href = API_BASE + '/editor.html';
    });
    
    // Logout button
    document.getElementById('logoutBtn').addEventListener('click', async function() {
        await fetch(API_BASE + '/api/logout', { 
            method: 'POST',
            credentials: 'include'
        });
        window.location.href = API_BASE + '/index.html';
    });
});

async function loadNotes() {
    const grid = document.getElementById('noteGrid');
    grid.innerHTML = '<div class="spinner"></div> Loading your notes...';
    
    try {
        const response = await fetch(API_BASE + '/api/notes', {
            credentials: 'include'
        });
        
        if (response.status === 401) {
            // Not authenticated - redirect to login
            window.location.href = API_BASE + '/index.html';
            return;
        }
        
        if (!response.ok) {
            throw new Error('Failed to load notes');
        }
        
        const notes = await response.json();
        displayNotes(notes);
        
    } catch (err) {
        console.error('Error loading notes:', err);
        grid.innerHTML = '<p class="error">Error loading notes. Please try again.</p>';
    }
}

function displayNotes(notes) {
    const grid = document.getElementById('noteGrid');
    
    if (!notes || notes.length === 0) {
        grid.innerHTML = '<p class="empty-state">No notes yet. Create your first note!</p>';
        return;
    }
    
    grid.innerHTML = notes.map(note => `
        <div class="note-card" onclick="openNote(${note.id})">
            <h3 class="note-title">${escapeHtml(note.title) || 'Untitled'}</h3>
            <p class="note-preview">${escapeHtml(note.content?.substring(0, 100)) || 'No content'}...</p>
            <div class="note-meta">
                <span>${new Date(note.updatedAt).toLocaleString()}</span>
                <button class="delete-btn" onclick="event.stopPropagation(); deleteNote(${note.id})">🗑️</button>
            </div>
        </div>
    `).join('');
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function openNote(id) {
    window.location.href = API_BASE + '/editor.html?id=' + id;
}

async function deleteNote(id) {
    if (!confirm('Delete this note?')) return;
    
    try {
        const response = await fetch(API_BASE + '/api/notes/' + id, {
            method: 'DELETE',
            credentials: 'include'
        });
        
        if (response.ok) {
            // Refresh notes list
            loadNotes();
        } else {
            alert('Failed to delete note');
        }
    } catch (err) {
        alert('Error: ' + err.message);
    }
}