const API_BASE = '/note-app';
const urlParams = new URLSearchParams(window.location.search);
const noteId = urlParams.get('id');

document.addEventListener('DOMContentLoaded', function() {
    console.log('Editor.js loaded', noteId ? 'Editing note: ' + noteId : 'Creating new note');
    
    const titleInput = document.getElementById('noteTitle');
    const contentTextarea = document.getElementById('noteContent');
    const saveBtn = document.getElementById('saveBtn');
    const backBtn = document.getElementById('backBtn');
    const saveStatus = document.getElementById('saveStatus');
    
    // Load note if editing
    if (noteId) {
        loadNote();
    } else {
        // New note - clear fields
        titleInput.value = '';
        contentTextarea.value = '';
        updateSaveStatus('ready', 'Ready to save');
    }
    
    // Manual save button click
    saveBtn.addEventListener('click', function() {
        saveNote();
    });
    
    // Back button
    backBtn.addEventListener('click', function() {
        window.location.href = API_BASE + '/dashboard.html';
    });
    
    // Optional: Ctrl+S to save
    document.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            saveNote();
        }
    });
});

async function loadNote() {
    const titleInput = document.getElementById('noteTitle');
    const contentTextarea = document.getElementById('noteContent');
    
    try {
        const response = await fetch(API_BASE + '/api/notes/' + noteId, {
            credentials: 'include'
        });
        
        if (response.status === 401) {
            window.location.href = API_BASE + '/index.html';
            return;
        }
        
        if (!response.ok) {
            throw new Error('Failed to load note');
        }
        
        const note = await response.json();
        titleInput.value = note.title || '';
        contentTextarea.value = note.content || '';
        updateSaveStatus('ready', 'Loaded');
        
    } catch (err) {
        console.error('Error loading note:', err);
        updateSaveStatus('error', 'Failed to load note');
    }
}

async function saveNote() {
    const title = document.getElementById('noteTitle').value.trim() || 'Untitled';
    const content = document.getElementById('noteContent').value;
    
    // Disable save button during save
    const saveBtn = document.getElementById('saveBtn');
    const originalText = saveBtn.textContent;
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving...';
    updateSaveStatus('saving', 'Saving...');
    
    try {
        let response;
        const url = API_BASE + (noteId ? '/api/notes/' + noteId : '/api/notes');
        
        if (noteId) {
            // Update existing note
            response = await fetch(url, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, content }),
                credentials: 'include'
            });
        } else {
            // Create new note
            response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, content }),
                credentials: 'include'
            });
        }
        
        if (response.ok) {
            const savedNote = await response.json();
            
            // If this was a new note, update URL with new ID
            if (!noteId && savedNote.id) {
                // Update URL without reloading page
                const newUrl = window.location.pathname + '?id=' + savedNote.id;
                window.history.pushState({}, '', newUrl);
                // Update noteId variable
                noteId = savedNote.id;
            }
            
            updateSaveStatus('success', 'Saved successfully!');
            
            // Reset save button after 2 seconds
            setTimeout(() => {
                updateSaveStatus('ready', 'All changes saved');
            }, 2000);
            
        } else {
            const error = await response.json();
            updateSaveStatus('error', 'Save failed: ' + (error.error || 'Unknown error'));
        }
    } catch (err) {
        console.error('Save error:', err);
        updateSaveStatus('error', 'Save failed: ' + err.message);
    } finally {
        // Re-enable save button
        const saveBtn = document.getElementById('saveBtn');
        saveBtn.disabled = false;
        saveBtn.textContent = 'Save Note';
    }
}

function updateSaveStatus(type, message) {
    const statusEl = document.getElementById('saveStatus');
    if (!statusEl) return;
    
    statusEl.className = 'save-status ' + type;
    
    if (type === 'saving') {
        statusEl.innerHTML = '<div class="spinner"></div> ' + message;
    } else if (type === 'success') {
        statusEl.innerHTML = '✓ ' + message;
    } else if (type === 'error') {
        statusEl.innerHTML = '✗ ' + message;
    } else {
        statusEl.innerHTML = '💾 ' + message;
    }
}