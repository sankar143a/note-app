const API_BASE = '/note-app';
const urlParams = new URLSearchParams(window.location.search);
let noteId = urlParams.get('id');
let quill;

document.addEventListener('DOMContentLoaded', function() {
    console.log('Rich Editor loaded', noteId ? 'Editing note: ' + noteId : 'Creating new note');
    
    // Initialize Quill editor
    quill = new Quill('#editor', {
        theme: 'snow',
        placeholder: 'Write your note here...',
        modules: {
            toolbar: '#toolbar'
        }
    });
    
    const titleInput = document.getElementById('noteTitle');
    const saveBtn = document.getElementById('saveBtn');
    const backBtn = document.getElementById('backBtn');
    const tagContainer = document.getElementById('tagContainer');
    
    // Load note if editing
    if (noteId) {
        loadNote();
    }
    
    // Manual save button click
    saveBtn.addEventListener('click', saveNote);
    
    // Back button
    backBtn.addEventListener('click', function() {
        window.location.href = API_BASE + '/dashboard.html';
    });
    
    // Ctrl+S to save
    document.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            saveNote();
        }
    });
});

async function loadNote() {
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
        document.getElementById('noteTitle').value = note.title || '';
        
        // Set rich text content
        if (note.content) {
            quill.root.innerHTML = note.content;
        }
        
        updateSaveStatus('ready', 'Loaded');
        
    } catch (err) {
        console.error('Error loading note:', err);
        updateSaveStatus('error', 'Failed to load note');
    }
}

async function saveNote() {
    const title = document.getElementById('noteTitle').value.trim() || 'Untitled';
    const content = quill.root.innerHTML; // Get rich text HTML
    
    const saveBtn = document.getElementById('saveBtn');
    const originalText = saveBtn.textContent;
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving...';
    updateSaveStatus('saving', 'Saving...');
    
    try {
        let response;
        const url = API_BASE + (noteId ? '/api/notes/' + noteId : '/api/notes');
        
        if (noteId) {
            response = await fetch(url, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, content }),
                credentials: 'include'
            });
        } else {
            response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, content }),
                credentials: 'include'
            });
        }
        
        if (response.ok) {
            const savedNote = await response.json();
            
            if (!noteId && savedNote.id) {
                const newUrl = window.location.pathname + '?id=' + savedNote.id;
                window.history.pushState({}, '', newUrl);
                noteId = savedNote.id;
            }
            
            updateSaveStatus('success', 'Saved successfully!');
            
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
        saveBtn.disabled = false;
        saveBtn.textContent = originalText;
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