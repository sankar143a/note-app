const API_BASE = '/note-app';
let allNotes = [];
let currentDeleteId = null;

document.addEventListener('DOMContentLoaded', function() {
    console.log('Dashboard loaded');
    loadNotes();
    
    // Search input
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', filterNotes);
    }
    
    // Sort select
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', filterNotes);
    }
    
    // New Note button
    const newNoteBtn = document.getElementById('newNoteBtn');
    if (newNoteBtn) {
        newNoteBtn.addEventListener('click', function() {
            window.location.href = API_BASE + '/editor.html';
        });
    }
    
    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
    
    // Delete modal buttons
    const cancelDelete = document.getElementById('cancelDelete');
    if (cancelDelete) {
        cancelDelete.addEventListener('click', hideDeleteModal);
    }
    
    const confirmDeleteBtn = document.getElementById('confirmDelete');
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', confirmDelete);
    }
});

async function loadNotes() {
    const grid = document.getElementById('noteGrid');
    if (!grid) return;
    
    grid.innerHTML = '<div class="spinner"></div> Loading your notes...';
    
    try {
        const response = await fetch(API_BASE + '/api/notes', {
            credentials: 'include'
        });
        
        if (response.status === 401) {
            window.location.href = API_BASE + '/index.html';
            return;
        }
        
        if (!response.ok) {
            throw new Error('Failed to load notes');
        }
        
        allNotes = await response.json();
        extractTags(allNotes);
        displayNotes(allNotes);
        
    } catch (err) {
        console.error('Error loading notes:', err);
        grid.innerHTML = '<p class="error">Error loading notes. Please try again.</p>';
    }
}

function extractTags(notes) {
    const tagSet = new Set();
    notes.forEach(note => {
        if (note.tags && Array.isArray(note.tags)) {
            note.tags.forEach(tag => tagSet.add(tag));
        }
    });
    
    const tagsFilter = document.getElementById('tagsFilter');
    if (!tagsFilter) return;
    
    if (tagSet.size > 0) {
        let tagsHtml = '<span>Filter by tag:</span>';
        tagSet.forEach(tag => {
            tagsHtml += `<button class="tag-btn" onclick="filterByTag('${tag}')">#${tag}</button>`;
        });
        tagsHtml += `<button class="tag-btn clear" onclick="clearTagFilter()">Clear</button>`;
        tagsFilter.innerHTML = tagsHtml;
    } else {
        tagsFilter.innerHTML = '';
    }
}

function filterNotes() {
    const searchInput = document.getElementById('searchInput');
    const sortSelect = document.getElementById('sortSelect');
    
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    const sortBy = sortSelect ? sortSelect.value : 'newest';
    
    let filteredNotes = [...allNotes];
    
    // Apply search filter
    if (searchTerm) {
        filteredNotes = filteredNotes.filter(note => 
            (note.title && note.title.toLowerCase().includes(searchTerm)) ||
            (note.content && removeHtmlTags(note.content).toLowerCase().includes(searchTerm))
        );
    }
    
    // Apply sorting
    filteredNotes.sort((a, b) => {
        switch(sortBy) {
            case 'newest':
                return new Date(b.updatedAt) - new Date(a.updatedAt);
            case 'oldest':
                return new Date(a.updatedAt) - new Date(b.updatedAt);
            case 'title':
                return (a.title || '').localeCompare(b.title || '');
            default:
                return 0;
        }
    });
    
    displayNotes(filteredNotes);
}

function filterByTag(tag) {
    const filtered = allNotes.filter(note => 
        note.tags && note.tags.includes(tag)
    );
    displayNotes(filtered);
    
    // Highlight active tag
    document.querySelectorAll('.tag-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent === '#' + tag) {
            btn.classList.add('active');
        }
    });
}

function clearTagFilter() {
    displayNotes(allNotes);
    document.querySelectorAll('.tag-btn').forEach(btn => {
        btn.classList.remove('active');
    });
}

function displayNotes(notes) {
    const grid = document.getElementById('noteGrid');
    if (!grid) return;
    
    if (!notes || notes.length === 0) {
        grid.innerHTML = '<p class="empty-state">No notes found. Create your first note!</p>';
        return;
    }
    
    grid.innerHTML = notes.map(note => `
        <div class="note-card" onclick="openNote(${note.id})">
            <h3 class="note-title">${escapeHtml(note.title) || 'Untitled'}</h3>
            <div class="note-preview">${removeHtmlTags(note.content || '').substring(0, 100)}...</div>
            <div class="note-meta">
                <span>${formatDate(note.updatedAt)}</span>
                <button class="delete-btn" onclick="event.stopPropagation(); showDeleteModal(${note.id}, '${escapeHtml(note.title)}')">🗑️</button>
            </div>
            ${note.tags && note.tags.length > 0 ? 
                `<div class="note-tags">${note.tags.map(tag => `<span class="note-tag">#${escapeHtml(tag)}</span>`).join('')}</div>` 
                : ''}
        </div>
    `).join('');
}

// HTML ట్యాగ్స్ తీసేసి సాదా టెక్స్ట్ ఇవ్వడానికి
function removeHtmlTags(html) {
    if (!html) return '';
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
}

// HTML ఎస్కేప్ చేయడానికి (XSS ప్రొటెక్షన్)
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString();
}

function openNote(id) {
    window.location.href = API_BASE + '/editor.html?id=' + id;
}

function showDeleteModal(id, title) {
    currentDeleteId = id;
    const deleteTitle = document.getElementById('deleteNoteTitle');
    if (deleteTitle) {
        deleteTitle.textContent = `"${title}"`;
    }
    const modal = document.getElementById('deleteModal');
    if (modal) {
        modal.classList.add('active');
    }
}

function hideDeleteModal() {
    const modal = document.getElementById('deleteModal');
    if (modal) {
        modal.classList.remove('active');
    }
    currentDeleteId = null;
}

async function confirmDelete() {
    if (!currentDeleteId) return;
    
    try {
        const response = await fetch(API_BASE + '/api/notes/' + currentDeleteId, {
            method: 'DELETE',
            credentials: 'include'
        });
        
        if (response.ok) {
            await loadNotes();
            showToast('Note deleted', 'success');
        } else {
            showToast('Failed to delete note', 'error');
        }
    } catch (err) {
        showToast('Error: ' + err.message, 'error');
    }
    
    hideDeleteModal();
}

async function logout() {
    try {
        await fetch(API_BASE + '/api/logout', { 
            method: 'POST',
            credentials: 'include' 
        });
    } catch (err) {
        console.error('Logout error:', err);
    }
    window.location.href = API_BASE + '/index.html';
}

function showToast(message, type) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}