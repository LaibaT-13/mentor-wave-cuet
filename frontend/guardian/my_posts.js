document.addEventListener('DOMContentLoaded', function() {
    const POSTS_KEY = 'guardian_my_posts_v1';
    const samplePosts = [
        { id: 1, title: 'Mathematics Tutor Needed', class: 'Class 10', location: 'Nasirabad, CTG', salary: '৳8,000', status: 'Active', created: '2 days ago', interested: 5, daysCount: 3 },
        { id: 2, title: 'English Tutor for Class 8', class: 'Class 8', location: 'Khatunganj', salary: '৳6,000', status: 'Active', created: '1 week ago', interested: 2, daysCount: 2 }
    ];

    const container = document.getElementById('postsContainer');
    const emptyState = document.getElementById('emptyState');

    function loadPosts() {
        const raw = localStorage.getItem(POSTS_KEY);
        if (!raw) return samplePosts.slice();
        try { return JSON.parse(raw); } catch(e) { return samplePosts.slice(); }
    }

    function savePosts(posts) {
        localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
    }

    function render() {
        const posts = loadPosts();
        container.innerHTML = '';
        if (!posts || posts.length === 0) {
            emptyState.style.display = 'block';
            return;
        }
        emptyState.style.display = 'none';

        posts.forEach(p => {
            const card = document.createElement('div');
            card.className = 'post-card';

            const title = document.createElement('h3');
            title.textContent = p.title;

            const meta = document.createElement('div');
            meta.className = 'post-meta';
            const daysText = (p.daysCount && p.daysCount > 0) ? `<span>📅 ${p.daysCount} days/week</span>` : ((p.days && p.days.length) ? `<span>📅 ${p.days.length} days/week</span>` : '');
            meta.innerHTML = `<span>📚 ${p.class}</span>${daysText}<span>📍 ${p.location}</span><span>💰 ${p.salary}</span><span>${p.status === 'Active' ? '🟢 Active' : '⚪ Archived'}</span>`;

            const footer = document.createElement('div');
            footer.className = 'post-actions';

            const interestedBtn = document.createElement('button');
            interestedBtn.className = 'btn btn-outline view-interested-btn';
            // show live count from postInterests if available
            const interestCount = (function(){ try{ const map = JSON.parse(localStorage.getItem('postInterests')||'{}'); return (map[p.id]||[]).length; }catch(e){ return p.interested||0; } })();
            interestedBtn.textContent = `Interested (${interestCount})`;

            const toggleBtn = document.createElement('button');
            toggleBtn.className = 'btn btn-primary';
            toggleBtn.textContent = p.status === 'Active' ? 'Archive' : 'Activate';
            toggleBtn.addEventListener('click', () => {
                toggleStatus(p.id);
            });

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'btn';
            deleteBtn.style.border = '1px solid #b17843';
            deleteBtn.style.background = 'transparent';
            deleteBtn.textContent = 'Delete';
            deleteBtn.addEventListener('click', ()=> { deletePost(p.id); });

            footer.appendChild(interestedBtn);
            footer.appendChild(toggleBtn);
            footer.appendChild(deleteBtn);

            card.appendChild(title);
            card.appendChild(meta);
            card.appendChild(footer);

            container.appendChild(card);
        });
    }

    function toggleStatus(id) {
        const posts = loadPosts();
        const idx = posts.findIndex(x => x.id === id);
        if (idx === -1) return;
        posts[idx].status = posts[idx].status === 'Active' ? 'Archived' : 'Active';
        savePosts(posts);
        render();
    }

    function deletePost(id) {
        let posts = loadPosts();
        posts = posts.filter(x => x.id !== id);
        savePosts(posts);
        render();
    }

    render();
});
