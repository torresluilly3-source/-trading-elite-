// ===== SISTEMA DE FORO REAL =====
const ForumSystem = (function() {
    // Configuración
    const config = {
        categories: [
            { id: 'general', name: 'General', icon: 'fas fa-comments', color: '#00ffff' },
            { id: 'strategies', name: 'Estrategias', icon: 'fas fa-chess', color: '#ff0000' },
            { id: 'analysis', name: 'Análisis', icon: 'fas fa-chart-line', color: '#ff00ff' },
            { id: 'questions', name: 'Preguntas', icon: 'fas fa-question-circle', color: '#00ff00' },
            { id: 'success', name: 'Casos de Éxito', icon: 'fas fa-trophy', color: '#ffff00' }
        ],
        postsPerPage: 10,
        maxPosts: 1000
    };
    
    // Estado
    let state = {
        posts: [],
        currentCategory: 'all',
        currentPage: 1,
        totalPosts: 0,
        isLoading: false,
        userPosts: []
    };
    
    // DOM Elements
    let elements = {};
    
    // ===== FUNCIONES PRIVADAS =====
    function init() {
        console.log('💬 Inicializando sistema de foro REAL...');
        
        // Cargar posts desde localStorage
        loadPosts();
        
        // Inicializar DOM
        initDOM();
        
        // Renderizar foro
        renderForum();
        
        console.log('✅ Sistema de foro REAL listo');
    }
    
    function loadPosts() {
        try {
            const savedPosts = localStorage.getItem('trading_elite_forum_posts');
            if (savedPosts) {
                state.posts = JSON.parse(savedPosts);
            } else {
                // Inicializar con array vacío
                state.posts = [];
                savePosts();
            }
            
            state.totalPosts = state.posts.length;
            console.log(`📝 Posts cargados: ${state.totalPosts}`);
        } catch (error) {
            console.error('Error cargando posts:', error);
            state.posts = [];
            state.totalPosts = 0;
        }
    }
    
    function savePosts() {
        try {
            localStorage.setItem('trading_elite_forum_posts', JSON.stringify(state.posts));
            console.log('💾 Posts guardados en localStorage');
        } catch (error) {
            console.error('Error guardando posts:', error);
        }
    }
    
    function initDOM() {
        const container = document.getElementById('forum-container');
        if (!container) {
            console.error('❌ Contenedor del foro no encontrado');
            return;
        }
        
        // Crear estructura del foro
        container.innerHTML = `
            <div class="forum-header">
                <div class="forum-stats">
                    <div class="stat-item">
                        <i class="fas fa-comments"></i>
                        <span>Posts: <strong id="forum-total-posts">0</strong></span>
                    </div>
                    <div class="stat-item">
                        <i class="fas fa-users"></i>
                        <span>Autores: <strong id="forum-total-authors">0</strong></span>
                    </div>
                    <div class="stat-item">
                        <i class="fas fa-fire"></i>
                        <span>Actividad: <strong id="forum-activity">Baja</strong></span>
                    </div>
                </div>
                
                <div class="forum-actions">
                    <button class="btn btn-primary" id="new-post-btn">
                        <i class="fas fa-plus"></i> Nuevo Post
                    </button>
                </div>
            </div>
            
            <div class="forum-categories">
                <div class="categories-list" id="categories-list">
                    <!-- Categorías se cargarán aquí -->
                </div>
            </div>
            
            <div class="forum-content">
                <div class="posts-container" id="posts-container">
                    <div class="empty-state" id="forum-empty-state">
                        <i class="fas fa-comments"></i>
                        <h3>¡Sé el primero en publicar!</h3>
                        <p>Aún no hay posts en el foro. Sé el primero en compartir tu experiencia, preguntas o estrategias.</p>
                        <button class="btn btn-primary" id="first-post-btn">
                            <i class="fas fa-pen"></i> Crear primer post
                        </button>
                    </div>
                </div>
                
                <div class="forum-sidebar">
                    <div class="sidebar-section">
                        <h4><i class="fas fa-chart-line"></i> Actividad Reciente</h4>
                        <div class="recent-activity" id="recent-activity">
                            <div class="activity-item">
                                <i class="fas fa-info-circle"></i>
                                <span>Aún no hay actividad</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="sidebar-section">
                        <h4><i class="fas fa-users"></i> Top Autores</h4>
                        <div class="top-authors" id="top-authors">
                            <div class="author-item">
                                <i class="fas fa-user"></i>
                                <span>Esperando autores...</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="sidebar-section">
                        <h4><i class="fas fa-lightbulb"></i> Reglas del Foro</h4>
                        <ul class="forum-rules">
                            <li><i class="fas fa-check"></i> Respeto mutuo entre traders</li>
                            <li><i class="fas fa-check"></i> No spam o autopromoción</li>
                            <li><i class="fas fa-check"></i> Comparte conocimiento útil</li>
                            <li><i class="fas fa-check"></i> Mantén discusiones constructivas</li>
                            <li><i class="fas fa-check"></i> Reporta contenido inapropiado</li>
                        </ul>
                    </div>
                </div>
            </div>
            
            <!-- Modal para nuevo post -->
            <div class="modal forum-modal" id="new-post-modal">
                <div class="modal-header">
                    <h3><i class="fas fa-pen"></i> Nuevo Post</h3>
                    <button class="modal-close"><i class="fas fa-times"></i></button>
                </div>
                <div class="modal-content">
                    <form id="new-post-form">
                        <div class="form-group">
                            <label class="form-label">Título</label>
                            <input type="text" class="form-input" id="post-title" 
                                   placeholder="Ej: Mi estrategia para EUR/USD" required maxlength="100">
                            <div class="form-error" id="post-title-error"></div>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Categoría</label>
                            <div class="category-options" id="category-options">
                                <!-- Opciones de categoría se cargarán aquí -->
                            </div>
                            <div class="form-error" id="post-category-error"></div>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Contenido</label>
                            <textarea class="form-input" id="post-content" 
                                      placeholder="Comparte tu experiencia, pregunta o análisis..." 
                                      rows="6" required></textarea>
                            <div class="form-error" id="post-content-error"></div>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Tags (opcional)</label>
                            <input type="text" class="form-input" id="post-tags" 
                                   placeholder="Ej: EURUSD, scalping, riesgo">
                            <small style="color: var(--text-muted);">Separa con comas</small>
                        </div>
                        
                        <div class="form-actions">
                            <button type="button" class="btn btn-outline modal-close">Cancelar</button>
                            <button type="submit" class="btn btn-primary" id="submit-post-btn">
                                <i class="fas fa-paper-plane"></i> Publicar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        // Cachear elementos
        elements = {
            container: container,
            postsContainer: document.getElementById('posts-container'),
            emptyState: document.getElementById('forum-empty-state'),
            categoriesList: document.getElementById('categories-list'),
            newPostBtn: document.getElementById('new-post-btn'),
            firstPostBtn: document.getElementById('first-post-btn'),
            newPostModal: document.getElementById('new-post-modal'),
            newPostForm: document.getElementById('new-post-form'),
            categoryOptions: document.getElementById('category-options'),
            recentActivity: document.getElementById('recent-activity'),
            topAuthors: document.getElementById('top-authors'),
            forumStats: {
                totalPosts: document.getElementById('forum-total-posts'),
                totalAuthors: document.getElementById('forum-total-authors'),
                activity: document.getElementById('forum-activity')
            }
        };
        
        // Agregar event listeners
        attachEventListeners();
        
        // Inicializar categorías
        renderCategories();
        
        // Inicializar opciones de categoría en el modal
        renderCategoryOptions();
    }
    
    function attachEventListeners() {
        // Botón nuevo post
        elements.newPostBtn?.addEventListener('click', openNewPostModal);
        elements.firstPostBtn?.addEventListener('click', openNewPostModal);
        
        // Formulario nuevo post
        elements.newPostForm?.addEventListener('submit', handleNewPost);
        
        // Cerrar modal
        elements.newPostModal?.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', closeNewPostModal);
        });
        
        // Overlay
        document.getElementById('modal-overlay')?.addEventListener('click', closeNewPostModal);
    }
    
    function renderForum() {
        updateStats();
        renderPosts();
        updateSidebar();
        
        // Mostrar/ocultar empty state
        if (elements.emptyState && elements.postsContainer) {
            if (state.posts.length === 0) {
                elements.emptyState.style.display = 'block';
            } else {
                elements.emptyState.style.display = 'none';
            }
        }
    }
    
    function renderCategories() {
        if (!elements.categoriesList) return;
        
        const categoriesHTML = `
            <div class="category-item ${state.currentCategory === 'all' ? 'active' : ''}" 
                 data-category="all">
                <i class="fas fa-layer-group"></i>
                <span>Todas</span>
                <span class="category-count">${state.totalPosts}</span>
            </div>
            ${config.categories.map(category => {
                const count = state.posts.filter(p => p.category === category.id).length;
                return `
                    <div class="category-item ${state.currentCategory === category.id ? 'active' : ''}" 
                         data-category="${category.id}">
                        <i class="${category.icon}" style="color: ${category.color};"></i>
                        <span>${category.name}</span>
                        <span class="category-count">${count}</span>
                    </div>
                `;
            }).join('')}
        `;
        
        elements.categoriesList.innerHTML = categoriesHTML;
        
        // Event listeners para categorías
        elements.categoriesList.querySelectorAll('.category-item').forEach(item => {
            item.addEventListener('click', function() {
                const category = this.dataset.category;
                state.currentCategory = category;
                state.currentPage = 1;
                
                // Actualizar UI
                elements.categoriesList.querySelectorAll('.category-item').forEach(i => {
                    i.classList.remove('active');
                });
                this.classList.add('active');
                
                // Renderizar posts
                renderPosts();
            });
        });
    }
    
    function renderCategoryOptions() {
        if (!elements.categoryOptions) return;
        
        const optionsHTML = config.categories.map(category => `
            <div class="category-option" data-category="${category.id}">
                <div class="category-option-icon" style="background: ${category.color}20; border-color: ${category.color};">
                    <i class="${category.icon}" style="color: ${category.color};"></i>
                </div>
                <div class="category-option-info">
                    <div class="category-option-name">${category.name}</div>
                    <div class="category-option-description">
                        ${getCategoryDescription(category.id)}
                    </div>
                </div>
                <input type="radio" name="post-category" value="${category.id}" 
                       ${category.id === 'general' ? 'checked' : ''}>
            </div>
        `).join('');
        
        elements.categoryOptions.innerHTML = optionsHTML;
        
        // Event listeners para opciones
        elements.categoryOptions.querySelectorAll('.category-option').forEach(option => {
            option.addEventListener('click', function() {
                elements.categoryOptions.querySelectorAll('.category-option').forEach(o => {
                    o.classList.remove('selected');
                });
                this.classList.add('selected');
                this.querySelector('input[type="radio"]').checked = true;
            });
            
            // Seleccionar por defecto "general"
            if (option.dataset.category === 'general') {
                option.classList.add('selected');
            }
        });
    }
    
    function getCategoryDescription(categoryId) {
        const descriptions = {
            'general': 'Discusiones generales sobre trading',
            'strategies': 'Comparte y discute estrategias',
            'analysis': 'Análisis técnico y fundamental',
            'questions': 'Preguntas y respuestas',
            'success': 'Casos de éxito y resultados'
        };
        return descriptions[categoryId] || 'Discusión sobre trading';
    }
    
    function renderPosts() {
        if (!elements.postsContainer) return;
        
        // Filtrar posts por categoría
        let filteredPosts = state.posts;
        if (state.currentCategory !== 'all') {
            filteredPosts = state.posts.filter(post => post.category === state.currentCategory);
        }
        
        // Ordenar por fecha (más recientes primero)
        filteredPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        // Paginación
        const startIndex = (state.currentPage - 1) * config.postsPerPage;
        const endIndex = startIndex + config.postsPerPage;
        const pagePosts = filteredPosts.slice(startIndex, endIndex);
        
        if (pagePosts.length === 0) {
            elements.postsContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <h3>No hay posts en esta categoría</h3>
                    <p>Sé el primero en publicar en ${config.categories.find(c => c.id === state.currentCategory)?.name || 'esta categoría'}.</p>
                    <button class="btn btn-primary" id="category-first-post-btn">
                        <i class="fas fa-pen"></i> Crear post
                    </button>
                </div>
            `;
            
            // Event listener para el botón
            setTimeout(() => {
                document.getElementById('category-first-post-btn')?.addEventListener('click', openNewPostModal);
            }, 100);
            
            return;
        }
        
        // Renderizar posts
        const postsHTML = pagePosts.map(post => `
            <div class="forum-post" data-post-id="${post.id}">
                <div class="post-header">
                    <div class="post-author">
                        <div class="author-avatar" style="background: ${post.authorColor || '#00ffff'};">
                            ${post.authorName?.charAt(0) || 'U'}
                        </div>
                        <div class="author-info">
                            <div class="author-name">${post.authorName || 'Usuario'}</div>
                            <div class="post-date">
                                <i class="far fa-clock"></i> ${formatDate(post.createdAt)}
                                ${post.editedAt ? ` · <i class="fas fa-edit"></i> Editado` : ''}
                            </div>
                        </div>
                    </div>
                    <div class="post-category">
                        <span class="category-badge" style="background: ${config.categories.find(c => c.id === post.category)?.color || '#00ffff'}20; color: ${config.categories.find(c => c.id === post.category)?.color || '#00ffff'};">
                            <i class="${config.categories.find(c => c.id === post.category)?.icon || 'fas fa-comment'}"></i>
                            ${config.categories.find(c => c.id === post.category)?.name || 'General'}
                        </span>
                    </div>
                </div>
                
                <div class="post-content">
                    <h4 class="post-title">${post.title}</h4>
                    <div class="post-body">${formatPostContent(post.content)}</div>
                    
                    ${post.tags && post.tags.length > 0 ? `
                        <div class="post-tags">
                            ${post.tags.map(tag => `
                                <span class="tag">#${tag.trim()}</span>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
                
                <div class="post-footer">
                    <div class="post-stats">
                        <button class="post-action like-btn" data-post-id="${post.id}">
                            <i class="far fa-thumbs-up"></i>
                            <span>${post.likes || 0}</span>
                        </button>
                        <button class="post-action comment-btn" data-post-id="${post.id}">
                            <i class="far fa-comment"></i>
                            <span>${post.comments?.length || 0}</span>
                        </button>
                        <button class="post-action share-btn" data-post-id="${post.id}">
                            <i class="fas fa-share"></i>
                        </button>
                    </div>
                    
                    <div class="post-actions">
                        ${post.authorId === getCurrentUser()?.id ? `
                            <button class="post-action edit-btn" data-post-id="${post.id}">
                                <i class="fas fa-edit"></i> Editar
                            </button>
                            <button class="post-action delete-btn" data-post-id="${post.id}">
                                <i class="fas fa-trash"></i> Eliminar
                            </button>
                        ` : ''}
                    </div>
                </div>
                
                ${post.comments && post.comments.length > 0 ? `
                    <div class="post-comments">
                        <div class="comments-header">
                            <i class="fas fa-comments"></i>
                            <span>Comentarios (${post.comments.length})</span>
                        </div>
                        ${post.comments.slice(0, 2).map(comment => `
                            <div class="comment">
                                <div class="comment-author">
                                    <div class="author-avatar-small" style="background: ${comment.authorColor || '#ff0000'};">
                                        ${comment.authorName?.charAt(0) || 'U'}
                                    </div>
                                    <div class="comment-info">
                                        <div class="comment-author-name">${comment.authorName || 'Usuario'}</div>
                                        <div class="comment-date">${formatDate(comment.createdAt)}</div>
                                    </div>
                                </div>
                                <div class="comment-content">${comment.content}</div>
                            </div>
                        `).join('')}
                        ${post.comments.length > 2 ? `
                            <button class="view-all-comments" data-post-id="${post.id}">
                                Ver los ${post.comments.length - 2} comentarios restantes
                            </button>
                        ` : ''}
                    </div>
                ` : ''}
                
                <div class="add-comment">
                    <div class="comment-input-container">
                        <div class="current-user-avatar" style="background: ${getCurrentUser()?.avatarColor || '#00ffff'};">
                            ${getCurrentUser()?.name?.charAt(0) || 'U'}
                        </div>
                        <input type="text" class="comment-input" data-post-id="${post.id}" 
                               placeholder="Escribe un comentario...">
                        <button class="btn btn-outline comment-submit" data-post-id="${post.id}">
                            <i class="fas fa-paper-plane"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
        
        // Agregar paginación si hay más posts
        let paginationHTML = '';
        const totalPages = Math.ceil(filteredPosts.length / config.postsPerPage);
        
        if (totalPages > 1) {
            paginationHTML = `
                <div class="forum-pagination">
                    <button class="pagination-btn ${state.currentPage === 1 ? 'disabled' : ''}" 
                            id="prev-page" ${state.currentPage === 1 ? 'disabled' : ''}>
                        <i class="fas fa-chevron-left"></i> Anterior
                    </button>
                    
                    <div class="page-numbers">
                        ${Array.from({length: Math.min(5, totalPages)}, (_, i) => {
                            let pageNum;
                            if (totalPages <= 5) {
                                pageNum = i + 1;
                            } else if (state.currentPage <= 3) {
                                pageNum = i + 1;
                            } else if (state.currentPage >= totalPages - 2) {
                                pageNum = totalPages - 4 + i;
                            } else {
                                pageNum = state.currentPage - 2 + i;
                            }
                            
                            return `
                                <button class="page-number ${state.currentPage === pageNum ? 'active' : ''}" 
                                        data-page="${pageNum}">
                                    ${pageNum}
                                </button>
                            `;
                        }).join('')}
                        
                        ${totalPages > 5 ? `
                            <span class="page-dots">...</span>
                            <button class="page-number" data-page="${totalPages}">
                                ${totalPages}
                            </button>
                        ` : ''}
                    </div>
                    
                    <button class="pagination-btn ${state.currentPage === totalPages ? 'disabled' : ''}" 
                            id="next-page" ${state.currentPage === totalPages ? 'disabled' : ''}>
                        Siguiente <i class="fas fa-chevron-right"></i>
                    </button>
                </div>
            `;
        }
        
        elements.postsContainer.innerHTML = postsHTML + paginationHTML;
        
        // Agregar event listeners a los posts
        attachPostEventListeners();
        
        // Agregar event listeners de paginación
        attachPaginationEventListeners();
    }
    
    function attachPostEventListeners() {
        // Botones de like
        document.querySelectorAll('.like-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const postId = parseInt(this.dataset.postId);
                likePost(postId);
            });
        });
        
        // Botones de comentario
        document.querySelectorAll('.comment-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const postId = parseInt(this.dataset.postId);
                const commentInput = document.querySelector(`.comment-input[data-post-id="${postId}"]`);
                if (commentInput) commentInput.focus();
            });
        });
        
        // Botones de editar/eliminar (solo para autores)
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const postId = parseInt(this.dataset.postId);
                editPost(postId);
            });
        });
        
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const postId = parseInt(this.dataset.postId);
                deletePost(postId);
            });
        });
        
        // Enviar comentarios
        document.querySelectorAll('.comment-submit').forEach(btn => {
            btn.addEventListener('click', function() {
                const postId = parseInt(this.dataset.postId);
                submitComment(postId);
            });
        });
        
        // Enter en inputs de comentarios
        document.querySelectorAll('.comment-input').forEach(input => {
            input.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    const postId = parseInt(this.dataset.postId);
                    submitComment(postId);
                }
            });
        });
    }
    
    function attachPaginationEventListeners() {
        // Página anterior
        document.getElementById('prev-page')?.addEventListener('click', function() {
            if (state.currentPage > 1) {
                state.currentPage--;
                renderPosts();
            }
        });
        
        // Página siguiente
        document.getElementById('next-page')?.addEventListener('click', function() {
            const filteredPosts = state.currentCategory === 'all' 
                ? state.posts 
                : state.posts.filter(post => post.category === state.currentCategory);
            const totalPages = Math.ceil(filteredPosts.length / config.postsPerPage);
            
            if (state.currentPage < totalPages) {
                state.currentPage++;
                renderPosts();
            }
        });
        
        // Números de página
        document.querySelectorAll('.page-number').forEach(btn => {
            btn.addEventListener('click', function() {
                const page = parseInt(this.dataset.page);
                state.currentPage = page;
                renderPosts();
            });
        });
    }
    
    function updateStats() {
        if (!elements.forumStats.totalPosts) return;
        
        // Calcular estadísticas
        const uniqueAuthors = [...new Set(state.posts.map(p => p.authorId))].length;
        const recentPosts = state.posts.filter(p => {
            const postDate = new Date(p.createdAt);
            const now = new Date();
            const diffHours = (now - postDate) / (1000 * 60 * 60);
            return diffHours < 24; // Posts de las últimas 24 horas
        });
        
        // Determinar nivel de actividad
        let activityLevel = 'Baja';
        if (recentPosts.length >= 10) activityLevel = 'Alta';
        else if (recentPosts.length >= 3) activityLevel = 'Media';
        
        // Actualizar UI
        elements.forumStats.totalPosts.textContent = state.totalPosts;
        elements.forumStats.totalAuthors.textContent = uniqueAuthors;
        elements.forumStats.activity.textContent = activityLevel;
    }
    
    function updateSidebar() {
        updateRecentActivity();
        updateTopAuthors();
    }
    
    function updateRecentActivity() {
        if (!elements.recentActivity) return;
        
        // Obtener posts recientes (últimos 5)
        const recentPosts = [...state.posts]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5);
        
        if (recentPosts.length === 0) {
            elements.recentActivity.innerHTML = `
                <div class="activity-item">
                    <i class="fas fa-info-circle"></i>
                    <span>Aún no hay actividad</span>
                </div>
            `;
            return;
        }
        
        const activityHTML = recentPosts.map(post => `
            <div class="activity-item">
                <div class="activity-icon">
                    <i class="${config.categories.find(c => c.id === post.category)?.icon || 'fas fa-comment'}" 
                       style="color: ${config.categories.find(c => c.id === post.category)?.color || '#00ffff'};"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-title">${post.title}</div>
                    <div class="activity-meta">
                        <span class="activity-author">${post.authorName || 'Usuario'}</span>
                        <span class="activity-time">${formatRelativeTime(post.createdAt)}</span>
                    </div>
                </div>
            </div>
        `).join('');
        
        elements.recentActivity.innerHTML = activityHTML;
    }
    
    function updateTopAuthors() {
        if (!elements.topAuthors) return;
        
        // Calcular autores con más posts
        const authorStats = {};
        state.posts.forEach(post => {
            if (!authorStats[post.authorId]) {
                authorStats[post.authorId] = {
                    id: post.authorId,
                    name: post.authorName,
                    color: post.authorColor,
                    postCount: 0
                };
            }
            authorStats[post.authorId].postCount++;
        });
        
        const topAuthors = Object.values(authorStats)
            .sort((a, b) => b.postCount - a.postCount)
            .slice(0, 5);
        
        if (topAuthors.length === 0) {
            elements.topAuthors.innerHTML = `
                <div class="author-item">
                    <i class="fas fa-user"></i>
                    <span>Esperando autores...</span>
                </div>
            `;
            return;
        }
        
        const authorsHTML = topAuthors.map(author => `
            <div class="author-item">
                <div class="author-avatar-small" style="background: ${author.color || '#00ffff'};">
                    ${author.name?.charAt(0) || 'U'}
                </div>
                <div class="author-info">
                    <div class="author-name">${author.name || 'Usuario'}</div>
                    <div class="author-stats">${author.postCount} posts</div>
                </div>
            </div>
        `).join('');
        
        elements.topAuthors.innerHTML = authorsHTML;
    }
    
    function openNewPostModal() {
        const currentUser = getCurrentUser();
        if (!currentUser) {
            window.showMessage('Debes iniciar sesión para crear posts', 'error');
            if (typeof AuthSystem !== 'undefined') {
                AuthSystem.openModal('login');
            }
            return;
        }
        
        // Mostrar modal
        const overlay = document.getElementById('modal-overlay');
        const modal = elements.newPostModal;
        
        if (overlay) overlay.classList.add('active');
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            // Auto-focus en título
            setTimeout(() => {
                document.getElementById('post-title')?.focus();
            }, 100);
        }
    }
    
    function closeNewPostModal() {
        const overlay = document.getElementById('modal-overlay');
        const modal = elements.newPostModal;
        
        if (overlay) overlay.classList.remove('active');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
            
            // Reset form
            if (elements.newPostForm) {
                elements.newPostForm.reset();
                clearPostErrors();
                
                // Reset categoría a "general"
                const generalOption = elements.categoryOptions?.querySelector('[data-category="general"]');
                if (generalOption) {
                    elements.categoryOptions?.querySelectorAll('.category-option').forEach(o => {
                        o.classList.remove('selected');
                    });
                    generalOption.classList.add('selected');
                    generalOption.querySelector('input[type="radio"]').checked = true;
                }
            }
        }
    }
    
    function clearPostErrors() {
        document.querySelectorAll('#new-post-form .form-error').forEach(error => {
            error.textContent = '';
        });
        
        document.querySelectorAll('#new-post-form .form-input').forEach(input => {
            input.classList.remove('error');
        });
    }
    
    async function handleNewPost(e) {
        e.preventDefault();
        
        const currentUser = getCurrentUser();
        if (!currentUser) {
            window.showMessage('Debes iniciar sesión para crear posts', 'error');
            return;
        }
        
        // Obtener valores del formulario
        const title = document.getElementById('post-title')?.value.trim();
        const category = document.querySelector('input[name="post-category"]:checked')?.value;
        const content = document.getElementById('post-content')?.value.trim();
        const tagsInput = document.getElementById('post-tags')?.value.trim();
        
        // Validaciones
        let isValid = true;
        clearPostErrors();
        
        if (!title || title.length < 5) {
            showPostError('post-title', 'El título debe tener al menos 5 caracteres');
            isValid = false;
        }
        
        if (!category) {
            showPostError('post-category', 'Selecciona una categoría');
            isValid = false;
        }
        
        if (!content || content.length < 10) {
            showPostError('post-content', 'El contenido debe tener al menos 10 caracteres');
            isValid = false;
        }
        
        if (!isValid) return;
        
        // Procesar tags
        const tags = tagsInput 
            ? tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
            : [];
        
        // Crear nuevo post
        const newPost = {
            id: Date.now(),
            title: title,
            content: content,
            category: category,
            tags: tags,
            authorId: currentUser.id,
            authorName: currentUser.name,
            authorColor: currentUser.avatarColor,
            createdAt: new Date().toISOString(),
            editedAt: null,
            likes: 0,
            likedBy: [],
            comments: [],
            views: 0
        };
        
        // Agregar al estado
        state.posts.unshift(newPost);
        state.totalPosts = state.posts.length;
        
        // Guardar en localStorage
        savePosts();
        
        // Cerrar modal
        closeNewPostModal();
        
        // Actualizar UI
        renderForum();
        
        // Mostrar mensaje de éxito
        window.showMessage('¡Post publicado exitosamente!', 'success');
        
        // Actualizar estadísticas globales
        if (typeof initializeRealStats === 'function') {
            initializeRealStats();
        }
        
        console.log(`📝 Nuevo post creado: "${title}" por ${currentUser.name}`);
    }
    
    function showPostError(inputId, message) {
        const errorEl = document.getElementById(`${inputId}-error`);
        if (errorEl) {
            errorEl.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
        }
        
        const input = document.getElementById(inputId);
        if (input) input.classList.add('error');
    }
    
    function likePost(postId) {
        const currentUser = getCurrentUser();
        if (!currentUser) {
            window.showMessage('Debes iniciar sesión para dar like', 'error');
            return;
        }
        
        const postIndex = state.posts.findIndex(p => p.id === postId);
        if (postIndex === -1) return;
        
        const post = state.posts[postIndex];
        
        // Verificar si el usuario ya dio like
        const userLiked = post.likedBy?.includes(currentUser.id) || false;
        
        if (userLiked) {
            // Quitar like
            post.likes = Math.max(0, (post.likes || 0) - 1);
            post.likedBy = post.likedBy?.filter(id => id !== currentUser.id) || [];
        } else {
            // Dar like
            post.likes = (post.likes || 0) + 1;
            post.likedBy = [...(post.likedBy || []), currentUser.id];
        }
        
        // Actualizar estado
        state.posts[postIndex] = post;
        savePosts();
        
        // Actualizar UI
        renderPosts();
    }
    
    function submitComment(postId) {
        const currentUser = getCurrentUser();
        if (!currentUser) {
            window.showMessage('Debes iniciar sesión para comentar', 'error');
            return;
        }
        
        const commentInput = document.querySelector(`.comment-input[data-post-id="${postId}"]`);
        if (!commentInput) return;
        
        const content = commentInput.value.trim();
        if (!content || content.length < 1) {
            window.showMessage('El comentario no puede estar vacío', 'error');
            return;
        }
        
        const postIndex = state.posts.findIndex(p => p.id === postId);
        if (postIndex === -1) return;
        
        const post = state.posts[postIndex];
        
        // Crear nuevo comentario
        const newComment = {
            id: Date.now(),
            content: content,
            authorId: currentUser.id,
            authorName: currentUser.name,
            authorColor: currentUser.avatarColor,
            createdAt: new Date().toISOString(),
            postId: postId
        };
        
        // Agregar comentario al post
        if (!post.comments) post.comments = [];
        post.comments.push(newComment);
        
        // Actualizar estado
        state.posts[postIndex] = post;
        savePosts();
        
        // Limpiar input
        commentInput.value = '';
        
        // Actualizar UI
        renderPosts();
        
        // Mostrar mensaje
        window.showMessage('Comentario agregado', 'success');
    }
    
    function editPost(postId) {
        const post = state.posts.find(p => p.id === postId);
        if (!post) return;
        
        const currentUser = getCurrentUser();
        if (!currentUser || post.authorId !== currentUser.id) {
            window.showMessage('No tienes permiso para editar este post', 'error');
            return;
        }
        
        // En una implementación completa, aquí abrirías un modal de edición
        window.showMessage('Funcionalidad de edición en desarrollo', 'info');
    }
    
    function deletePost(postId) {
        const post = state.posts.find(p => p.id === postId);
        if (!post) return;
        
        const currentUser = getCurrentUser();
        if (!currentUser || post.authorId !== currentUser.id) {
            window.showMessage('No tienes permiso para eliminar este post', 'error');
            return;
        }
        
        if (!confirm('¿Estás seguro de que quieres eliminar este post?')) {
            return;
        }
        
        // Marcar como eliminado (soft delete)
        const postIndex = state.posts.findIndex(p => p.id === postId);
        if (postIndex !== -1) {
            state.posts[postIndex].deleted = true;
            state.posts[postIndex].deletedAt = new Date().toISOString();
            savePosts();
            
            // Actualizar UI
            renderForum();
            
            window.showMessage('Post eliminado', 'info');
        }
    }
    
    // ===== FUNCIONES DE UTILIDAD =====
    function formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        
        if (diffMins < 1) return 'Ahora mismo';
        if (diffMins < 60) return `Hace ${diffMins} min${diffMins !== 1 ? 's' : ''}`;
        if (diffHours < 24) return `Hace ${diffHours} hora${diffHours !== 1 ? 's' : ''}`;
        if (diffDays === 1) return 'Ayer';
        if (diffDays < 7) return `Hace ${diffDays} días`;
        
        return date.toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short',
            year: diffDays > 365 ? 'numeric' : undefined
        });
    }
    
    function formatRelativeTime(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / (1000 * 60));
        
        if (diffMins < 1) return 'Ahora';
        if (diffMins < 60) return `${diffMins}m`;
        
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        if (diffHours < 24) return `${diffHours}h`;
        
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        if (diffDays < 7) return `${diffDays}d`;
        
        const diffWeeks = Math.floor(diffDays / 7);
        if (diffWeeks < 4) return `${diffWeeks}sem`;
        
        return date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
    }
    
    function formatPostContent(content) {
        // Convertir URLs en enlaces
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        let formatted = content.replace(urlRegex, url => 
            `<a href="${url}" target="_blank" rel="noopener noreferrer" style="color: var(--neon-green);">${url}</a>`
        );
        
        // Convertir saltos de línea en <br>
        formatted = formatted.replace(/\n/g, '<br>');
        
        return formatted;
    }
    
    function getCurrentUser() {
        if (typeof getCurrentUser === 'function') {
            return window.getCurrentUser();
        }
        
        try {
            return JSON.parse(localStorage.getItem('current_user'));
        } catch (e) {
            return null;
        }
    }
    
    // ===== FUNCIONES PÚBLICAS =====
    function getPosts() {
        return [...state.posts];
    }
    
    function getPostCount() {
        return state.totalPosts;
    }
    
    function addPost(title, content, category = 'general', tags = []) {
        const currentUser = getCurrentUser();
        if (!currentUser) return null;
        
        const newPost = {
            id: Date.now(),
            title: title,
            content: content,
            category: category,
            tags: tags,
            authorId: currentUser.id,
            authorName: currentUser.name,
            authorColor: currentUser.avatarColor,
            createdAt: new Date().toISOString(),
            likes: 0,
            comments: [],
            views: 0
        };
        
        state.posts.unshift(newPost);
        state.totalPosts = state.posts.length;
        savePosts();
        
        // Actualizar UI si está visible
        if (document.getElementById('forum-container')) {
            renderForum();
        }
        
        return newPost;
    }
    
    function resetForum() {
        if (confirm('¿Estás seguro de que quieres resetear el foro? Se perderán todos los posts.')) {
            state.posts = [];
            state.totalPosts = 0;
            savePosts();
            renderForum();
            window.showMessage('Foro reseteado', 'info');
        }
    }
    
    // ===== INICIALIZACIÓN =====
    // Inicializar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        setTimeout(init, 100);
    }
    
    // Retornar API pública
    return {
        init,
        getPosts,
        getPostCount,
        addPost,
        resetForum
    };
})();

// Hacerlo global
window.ForumSystem = ForumSystem;