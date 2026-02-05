// ===== SISTEMA DE CALENDARIO REAL =====
const CalendarSystem = (function() {
    // Configuración
    const config = {
        eventTypes: [
            { id: 'session', name: 'Sesión en Vivo', icon: 'fas fa-video', color: '#ff0000' },
            { id: 'workshop', name: 'Workshop', icon: 'fas fa-chalkboard-teacher', color: '#00ffff' },
            { id: 'webinar', name: 'Webinar', icon: 'fas fa-globe', color: '#ff00ff' },
            { id: 'qna', name: 'Q&A', icon: 'fas fa-question-circle', color: '#00ff00' },
            { id: 'special', name: 'Especial', icon: 'fas fa-star', color: '#ffff00' }
        ],
        timeSlots: [
            '09:00', '10:00', '11:00', '12:00', 
            '13:00', '14:00', '15:00', '16:00', 
            '17:00', '18:00', '19:00', '20:00'
        ]
    };
    
    // Estado
    let state = {
        events: [],
        currentDate: new Date(),
        currentView: 'month',
        selectedEvent: null,
        isLoading: false
    };
    
    // DOM Elements
    let elements = {};
    
    // ===== FUNCIONES PRIVADAS =====
    function init() {
        console.log('📅 Inicializando sistema de calendario REAL...');
        
        // Cargar eventos desde localStorage
        loadEvents();
        
        // Inicializar DOM
        initDOM();
        
        // Renderizar calendario
        renderCalendar();
        
        console.log('✅ Sistema de calendario REAL listo');
    }
    
    function loadEvents() {
        try {
            const savedEvents = localStorage.getItem('trading_elite_calendar_events');
            if (savedEvents) {
                state.events = JSON.parse(savedEvents);
            } else {
                // Inicializar con array vacío
                state.events = [];
                saveEvents();
            }
            
            console.log(`📅 Eventos cargados: ${state.events.length}`);
        } catch (error) {
            console.error('Error cargando eventos:', error);
            state.events = [];
        }
    }
    
    function saveEvents() {
        try {
            localStorage.setItem('trading_elite_calendar_events', JSON.stringify(state.events));
            console.log('💾 Eventos guardados en localStorage');
        } catch (error) {
            console.error('Error guardando eventos:', error);
        }
    }
    
    function initDOM() {
        const container = document.getElementById('calendar-container');
        if (!container) {
            console.error('❌ Contenedor del calendario no encontrado');
            return;
        }
        
        // Crear estructura del calendario
        container.innerHTML = `
            <div class="calendar-header">
                <div class="calendar-nav">
                    <button class="btn btn-outline" id="prev-period">
                        <i class="fas fa-chevron-left"></i>
                    </button>
                    
                    <div class="current-period" id="current-period">
                        <h3 id="period-title">Cargando...</h3>
                        <div class="period-stats">
                            <span id="event-count">0 eventos</span>
                            <span class="separator">•</span>
                            <span id="upcoming-count">0 próximos</span>
                        </div>
                    </div>
                    
                    <button class="btn btn-outline" id="next-period">
                        <i class="fas fa-chevron-right"></i>
                    </button>
                </div>
                
                <div class="calendar-actions">
                    <div class="view-switcher">
                        <button class="view-btn ${state.currentView === 'month' ? 'active' : ''}" data-view="month">
                            <i class="fas fa-calendar-alt"></i> Mes
                        </button>
                        <button class="view-btn ${state.currentView === 'week' ? 'active' : ''}" data-view="week">
                            <i class="fas fa-calendar-week"></i> Semana
                        </button>
                        <button class="view-btn ${state.currentView === 'day' ? 'active' : ''}" data-view="day">
                            <i class="fas fa-calendar-day"></i> Día
                        </button>
                        <button class="view-btn ${state.currentView === 'list' ? 'active' : ''}" data-view="list">
                            <i class="fas fa-list"></i> Lista
                        </button>
                    </div>
                    
                    <button class="btn btn-primary" id="new-event-btn">
                        <i class="fas fa-plus"></i> Nuevo Evento
                    </button>
                </div>
            </div>
            
            <div class="calendar-main">
                <div class="calendar-sidebar">
                    <div class="sidebar-section">
                        <h4><i class="fas fa-filter"></i> Filtros</h4>
                        <div class="event-filters" id="event-filters">
                            ${config.eventTypes.map(type => `
                                <div class="filter-item" data-type="${type.id}">
                                    <div class="filter-color" style="background: ${type.color};"></div>
                                    <i class="${type.icon}"></i>
                                    <span>${type.name}</span>
                                    <span class="filter-count" data-type="${type.id}">0</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="sidebar-section">
                        <h4><i class="fas fa-calendar-check"></i> Hoy</h4>
                        <div class="today-events" id="today-events">
                            <div class="empty-state">
                                <i class="fas fa-calendar"></i>
                                <p>No hay eventos hoy</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="sidebar-section">
                        <h4><i class="fas fa-bell"></i> Próximos</h4>
                        <div class="upcoming-events" id="upcoming-events">
                            <div class="empty-state">
                                <i class="fas fa-clock"></i>
                                <p>No hay eventos próximos</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="calendar-view">
                    <div class="view-container">
                        <div class="month-view hidden" id="month-view">
                            <!-- Vista mensual se generará dinámicamente -->
                        </div>
                        
                        <div class="week-view hidden" id="week-view">
                            <!-- Vista semanal se generará dinámicamente -->
                        </div>
                        
                        <div class="day-view hidden" id="day-view">
                            <!-- Vista diaria se generará dinámicamente -->
                        </div>
                        
                        <div class="list-view ${state.currentView === 'list' ? '' : 'hidden'}" id="list-view">
                            <div class="list-header">
                                <div class="list-col">Fecha</div>
                                <div class="list-col">Hora</div>
                                <div class="list-col">Evento</div>
                                <div class="list-col">Tipo</div>
                                <div class="list-col">Instructor</div>
                                <div class="list-col">Acciones</div>
                            </div>
                            <div class="list-body" id="list-body">
                                <!-- Lista de eventos se generará dinámicamente -->
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Modal para nuevo evento -->
            <div class="modal calendar-modal" id="new-event-modal">
                <div class="modal-header">
                    <h3><i class="fas fa-calendar-plus"></i> Nuevo Evento</h3>
                    <button class="modal-close"><i class="fas fa-times"></i></button>
                </div>
                <div class="modal-content">
                    <form id="new-event-form">
                        <div class="form-group">
                            <label class="form-label">Título del Evento</label>
                            <input type="text" class="form-input" id="event-title" 
                                   placeholder="Ej: Sesión de Acción del Precio" required>
                            <div class="form-error" id="event-title-error"></div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">Tipo</label>
                                <div class="event-type-options" id="event-type-options">
                                    ${config.eventTypes.map(type => `
                                        <div class="type-option" data-type="${type.id}">
                                            <div class="type-icon" style="background: ${type.color}20; border-color: ${type.color};">
                                                <i class="${type.icon}" style="color: ${type.color};"></i>
                                            </div>
                                            <div class="type-name">${type.name}</div>
                                            <input type="radio" name="event-type" value="${type.id}" 
                                                   ${type.id === 'session' ? 'checked' : ''}>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">Instructor</label>
                                <input type="text" class="form-input" id="event-instructor" 
                                       placeholder="Nombre del instructor" required>
                                <div class="form-error" id="event-instructor-error"></div>
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">Fecha</label>
                                <input type="date" class="form-input" id="event-date" required>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">Hora Inicio</label>
                                <select class="form-input" id="event-start-time" required>
                                    <option value="">Seleccionar hora</option>
                                    ${config.timeSlots.map(time => `
                                        <option value="${time}">${time}</option>
                                    `).join('')}
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">Duración (minutos)</label>
                                <select class="form-input" id="event-duration" required>
                                    <option value="30">30 min</option>
                                    <option value="60" selected>60 min</option>
                                    <option value="90">90 min</option>
                                    <option value="120">120 min</option>
                                    <option value="180">180 min</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Descripción</label>
                            <textarea class="form-input" id="event-description" 
                                      placeholder="Descripción detallada del evento..." 
                                      rows="4"></textarea>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Plataforma/Enlace</label>
                            <input type="url" class="form-input" id="event-link" 
                                   placeholder="https://meet.google.com/..." pattern="https?://.+">
                            <small style="color: var(--text-muted);">Enlace para unirse al evento</small>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Nivel</label>
                            <div class="level-options">
                                <label class="level-option">
                                    <input type="radio" name="event-level" value="beginner" checked>
                                    <span class="level-badge beginner">Principiante</span>
                                </label>
                                <label class="level-option">
                                    <input type="radio" name="event-level" value="intermediate">
                                    <span class="level-badge intermediate">Intermedio</span>
                                </label>
                                <label class="level-option">
                                    <input type="radio" name="event-level" value="advanced">
                                    <span class="level-badge advanced">Avanzado</span>
                                </label>
                                <label class="level-option">
                                    <input type="radio" name="event-level" value="all">
                                    <span class="level-badge all">Todos</span>
                                </label>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Asistentes Máximos</label>
                            <input type="number" class="form-input" id="event-max-attendees" 
                                   min="1" max="1000" value="50">
                            <small style="color: var(--text-muted);">0 para ilimitado</small>
                        </div>
                        
                        <div class="form-actions">
                            <button type="button" class="btn btn-outline modal-close">Cancelar</button>
                            <button type="submit" class="btn btn-primary" id="submit-event-btn">
                                <i class="fas fa-calendar-check"></i> Crear Evento
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            
            <!-- Modal para detalles del evento -->
            <div class="modal event-modal" id="event-detail-modal">
                <div class="modal-header">
                    <h3 id="event-detail-title"></h3>
                    <button class="modal-close"><i class="fas fa-times"></i></button>
                </div>
                <div class="modal-content" id="event-detail-content">
                    <!-- Detalles del evento se cargarán dinámicamente -->
                </div>
                <div class="modal-footer" id="event-detail-actions">
                    <!-- Acciones del evento se cargarán dinámicamente -->
                </div>
            </div>
        `;
        
        // Cachear elementos
        elements = {
            container: container,
            currentPeriod: document.getElementById('current-period'),
            periodTitle: document.getElementById('period-title'),
            eventCount: document.getElementById('event-count'),
            upcomingCount: document.getElementById('upcoming-count'),
            prevPeriodBtn: document.getElementById('prev-period'),
            nextPeriodBtn: document.getElementById('next-period'),
            newEventBtn: document.getElementById('new-event-btn'),
            viewBtns: document.querySelectorAll('.view-btn'),
            monthView: document.getElementById('month-view'),
            weekView: document.getElementById('week-view'),
            dayView: document.getElementById('day-view'),
            listView: document.getElementById('list-view'),
            listBody: document.getElementById('list-body'),
            todayEvents: document.getElementById('today-events'),
            upcomingEvents: document.getElementById('upcoming-events'),
            eventFilters: document.getElementById('event-filters'),
            newEventModal: document.getElementById('new-event-modal'),
            newEventForm: document.getElementById('new-event-form'),
            eventDetailModal: document.getElementById('event-detail-modal'),
            eventTypeOptions: document.getElementById('event-type-options')
        };
        
        // Agregar event listeners
        attachEventListeners();
        
        // Inicializar fecha del formulario con hoy
        const today = new Date().toISOString().split('T')[0];
        const eventDateInput = document.getElementById('event-date');
        if (eventDateInput) {
            eventDateInput.setAttribute('min', today);
            eventDateInput.value = today;
        }
        
        // Seleccionar hora actual o próxima
        const now = new Date();
        const currentHour = now.getHours().toString().padStart(2, '0') + ':00';
        const startTimeSelect = document.getElementById('event-start-time');
        if (startTimeSelect) {
            const availableTimes = config.timeSlots.filter(time => time >= currentHour);
            if (availableTimes.length > 0) {
                startTimeSelect.value = availableTimes[0];
            }
        }
    }
    
    function attachEventListeners() {
        // Navegación del calendario
        if (elements.prevPeriodBtn) elements.prevPeriodBtn.addEventListener('click', navigatePrevious);
        if (elements.nextPeriodBtn) elements.nextPeriodBtn.addEventListener('click', navigateNext);
        
        // Cambio de vista
        if (elements.viewBtns) {
            elements.viewBtns.forEach(btn => {
                btn.addEventListener('click', function() {
                    const view = this.dataset.view;
                    switchView(view);
                });
            });
        }
        
        // Nuevo evento
        if (elements.newEventBtn) elements.newEventBtn.addEventListener('click', openNewEventModal);
        
        // Formulario nuevo evento
        if (elements.newEventForm) elements.newEventForm.addEventListener('submit', handleNewEvent);
        
        // Opciones de tipo de evento
        if (elements.eventTypeOptions) {
            elements.eventTypeOptions.querySelectorAll('.type-option').forEach(option => {
                option.addEventListener('click', function() {
                    elements.eventTypeOptions.querySelectorAll('.type-option').forEach(o => {
                        o.classList.remove('selected');
                    });
                    this.classList.add('selected');
                    const radio = this.querySelector('input[type="radio"]');
                    if (radio) radio.checked = true;
                });
                
                // Seleccionar por defecto "session"
                if (option.dataset.type === 'session') {
                    option.classList.add('selected');
                }
            });
        }
        
        // Cerrar modales
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', function() {
                const modal = this.closest('.modal');
                closeModal(modal);
            });
        });
        
        // Overlay
        const overlay = document.getElementById('modal-overlay');
        if (overlay) {
            overlay.addEventListener('click', function() {
                if (elements.newEventModal) closeModal(elements.newEventModal);
                if (elements.eventDetailModal) closeModal(elements.eventDetailModal);
            });
        }
        
        // Filtros de eventos
        if (elements.eventFilters) {
            elements.eventFilters.querySelectorAll('.filter-item').forEach(filter => {
                filter.addEventListener('click', function() {
                    const type = this.dataset.type;
                    toggleEventFilter(type);
                });
            });
        }
    }
    
    function renderCalendar() {
        updatePeriodTitle();
        updateStats();
        updateSidebar();
        
        switch (state.currentView) {
            case 'month':
                renderMonthView();
                break;
            case 'week':
                renderWeekView();
                break;
            case 'day':
                renderDayView();
                break;
            case 'list':
                renderListView();
                break;
        }
        
        updateFilterCounts();
    }
    
    function updatePeriodTitle() {
        if (!elements.periodTitle) return;
        
        const date = state.currentDate;
        
        switch (state.currentView) {
            case 'month':
                const monthName = date.toLocaleDateString('es-ES', { month: 'long' });
                const year = date.getFullYear();
                elements.periodTitle.textContent = `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${year}`;
                break;
                
            case 'week':
                const weekStart = getWeekStart(date);
                const weekEnd = new Date(weekStart);
                weekEnd.setDate(weekStart.getDate() + 6);
                
                const startStr = weekStart.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
                const endStr = weekEnd.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
                const yearStr = weekStart.getFullYear() !== weekEnd.getFullYear() 
                    ? ` ${weekStart.getFullYear()}` 
                    : '';
                
                elements.periodTitle.textContent = `${startStr} - ${endStr}${yearStr}`;
                break;
                
            case 'day':
                const dayStr = date.toLocaleDateString('es-ES', { 
                    weekday: 'long', 
                    day: 'numeric', 
                    month: 'long',
                    year: 'numeric'
                });
                elements.periodTitle.textContent = dayStr.charAt(0).toUpperCase() + dayStr.slice(1);
                break;
                
            case 'list':
                elements.periodTitle.textContent = 'Todos los Eventos';
                break;
        }
    }
    
    function updateStats() {
        if (!elements.eventCount || !elements.upcomingCount) return;
        
        const today = new Date().toISOString().split('T')[0];
        const todayEvents = state.events.filter(event => 
            event.date === today && !event.cancelled
        ).length;
        
        // Eventos próximos (próximos 7 días)
        const upcomingEvents = state.events.filter(event => {
            if (event.cancelled) return false;
            
            const eventDate = new Date(event.date);
            const todayDate = new Date();
            const diffTime = eventDate - todayDate;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            return diffDays >= 0 && diffDays <= 7;
        }).length;
        
        elements.eventCount.textContent = `${state.events.length} evento${state.events.length !== 1 ? 's' : ''}`;
        elements.upcomingCount.textContent = `${upcomingEvents} próximo${upcomingEvents !== 1 ? 's' : ''}`;
    }
    
    function updateSidebar() {
        updateTodayEvents();
        updateUpcomingEvents();
    }
    
    function updateTodayEvents() {
        if (!elements.todayEvents) return;
        
        const today = new Date().toISOString().split('T')[0];
        const todayEvents = state.events.filter(event => 
            event.date === today && !event.cancelled
        ).sort((a, b) => a.startTime.localeCompare(b.startTime));
        
        if (todayEvents.length === 0) {
            elements.todayEvents.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-calendar"></i>
                    <p>No hay eventos hoy</p>
                </div>
            `;
            return;
        }
        
        const eventsHTML = todayEvents.map(event => `
            <div class="sidebar-event" data-event-id="${event.id}">
                <div class="event-time">
                    <i class="far fa-clock"></i>
                    ${formatTime(event.startTime)}
                </div>
                <div class="event-info">
                    <div class="event-title">${event.title}</div>
                    <div class="event-meta">
                        <span class="event-type" style="color: ${getEventTypeColor(event.type)};">
                            <i class="${getEventTypeIcon(event.type)}"></i>
                            ${getEventTypeName(event.type)}
                        </span>
                    </div>
                </div>
            </div>
        `).join('');
        
        elements.todayEvents.innerHTML = eventsHTML;
        
        // Agregar event listeners a los eventos
        elements.todayEvents.querySelectorAll('.sidebar-event').forEach(eventEl => {
            eventEl.addEventListener('click', function() {
                const eventId = parseInt(this.dataset.eventId);
                showEventDetails(eventId);
            });
        });
    }
    
    function updateUpcomingEvents() {
        if (!elements.upcomingEvents) return;
        
        const today = new Date();
        const upcomingEvents = state.events
            .filter(event => {
                if (event.cancelled) return false;
                
                const eventDate = new Date(event.date);
                return eventDate >= today;
            })
            .sort((a, b) => {
                const dateA = new Date(a.date + 'T' + a.startTime);
                const dateB = new Date(b.date + 'T' + b.startTime);
                return dateA - dateB;
            })
            .slice(0, 5); // Mostrar solo los próximos 5
        
        if (upcomingEvents.length === 0) {
            elements.upcomingEvents.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-clock"></i>
                    <p>No hay eventos próximos</p>
                </div>
            `;
            return;
        }
        
        const eventsHTML = upcomingEvents.map(event => `
            <div class="sidebar-event" data-event-id="${event.id}">
                <div class="event-date">
                    ${formatEventDate(event.date)}
                </div>
                <div class="event-info">
                    <div class="event-title">${event.title}</div>
                    <div class="event-meta">
                        <span class="event-time">${formatTime(event.startTime)}</span>
                        <span class="separator">•</span>
                        <span class="event-type" style="color: ${getEventTypeColor(event.type)};">
                            ${getEventTypeName(event.type)}
                        </span>
                    </div>
                </div>
            </div>
        `).join('');
        
        elements.upcomingEvents.innerHTML = eventsHTML;
        
        // Agregar event listeners
        elements.upcomingEvents.querySelectorAll('.sidebar-event').forEach(eventEl => {
            eventEl.addEventListener('click', function() {
                const eventId = parseInt(this.dataset.eventId);
                showEventDetails(eventId);
            });
        });
    }
    
    function updateFilterCounts() {
        if (!elements.eventFilters) return;
        
        config.eventTypes.forEach(type => {
            const count = state.events.filter(event => 
                event.type === type.id && !event.cancelled
            ).length;
            
            const countEl = elements.eventFilters.querySelector(`.filter-count[data-type="${type.id}"]`);
            if (countEl) {
                countEl.textContent = count;
            }
        });
    }
    
    function renderMonthView() {
        if (!elements.monthView) return;
        
        const date = state.currentDate;
        const year = date.getFullYear();
        const month = date.getMonth();
        
        // Obtener primer día del mes
        const firstDay = new Date(year, month, 1);
        // Obtener último día del mes
        const lastDay = new Date(year, month + 1, 0);
        // Días en el mes
        const daysInMonth = lastDay.getDate();
        // Día de la semana del primer día (0 = Domingo, 1 = Lunes, etc.)
        const firstDayIndex = firstDay.getDay();
        // Ajustar para que la semana empiece en Lunes (1)
        const adjustedFirstDayIndex = firstDayIndex === 0 ? 6 : firstDayIndex - 1;
        
        // Nombres de los días
        const dayNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
        
        // Crear estructura del mes
        let calendarHTML = `
            <div class="month-header">
                ${dayNames.map(day => `<div class="day-name">${day}</div>`).join('')}
            </div>
            <div class="month-grid">
        `;
        
        // Días vacíos al inicio
        for (let i = 0; i < adjustedFirstDayIndex; i++) {
            calendarHTML += `<div class="day-cell empty"></div>`;
        }
        
        // Días del mes
        for (let day = 1; day <= daysInMonth; day++) {
            const currentDate = new Date(year, month, day);
            const dateStr = currentDate.toISOString().split('T')[0];
            const isToday = isSameDay(currentDate, new Date());
            const dayEvents = state.events.filter(event => 
                event.date === dateStr && !event.cancelled
            );
            
            calendarHTML += `
                <div class="day-cell ${isToday ? 'today' : ''}" data-date="${dateStr}">
                    <div class="day-number">${day}</div>
                    <div class="day-events">
                        ${dayEvents.slice(0, 3).map(event => `
                            <div class="day-event" 
                                 style="background: ${getEventTypeColor(event.type)}20; border-left-color: ${getEventTypeColor(event.type)};"
                                 data-event-id="${event.id}">
                                <i class="${getEventTypeIcon(event.type)}"></i>
                                <span class="event-time">${formatTime(event.startTime)}</span>
                            </div>
                        `).join('')}
                        ${dayEvents.length > 3 ? `
                            <div class="more-events">+${dayEvents.length - 3} más</div>
                        ` : ''}
                    </div>
                </div>
            `;
        }
        
        calendarHTML += `</div>`;
        
        // Mostrar vista mensual y ocultar otras
        elements.monthView.innerHTML = calendarHTML;
        elements.monthView.classList.remove('hidden');
        if (elements.weekView) elements.weekView.classList.add('hidden');
        if (elements.dayView) elements.dayView.classList.add('hidden');
        if (elements.listView) elements.listView.classList.add('hidden');
        
        // Agregar event listeners a los días
        elements.monthView.querySelectorAll('.day-cell:not(.empty)').forEach(dayCell => {
            dayCell.addEventListener('click', function() {
                const dateStr = this.dataset.date;
                const [year, month, day] = dateStr.split('-').map(Number);
                state.currentDate = new Date(year, month - 1, day);
                switchView('day');
            });
        });
        
        // Agregar event listeners a los eventos
        elements.monthView.querySelectorAll('.day-event').forEach(eventEl => {
            eventEl.addEventListener('click', function(e) {
                e.stopPropagation();
                const eventId = parseInt(this.dataset.eventId);
                showEventDetails(eventId);
            });
        });
    }
    
    function renderWeekView() {
        if (!elements.weekView) return;
        
        const weekStart = getWeekStart(state.currentDate);
        const dayNames = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
        
        let calendarHTML = `
            <div class="week-header">
                <div class="time-column"></div>
                ${Array.from({length: 7}, (_, i) => {
                    const currentDay = new Date(weekStart);
                    currentDay.setDate(weekStart.getDate() + i);
                    const dateStr = currentDay.toISOString().split('T')[0];
                    const isToday = isSameDay(currentDay, new Date());
                    
                    return `
                        <div class="day-header ${isToday ? 'today' : ''}" data-date="${dateStr}">
                            <div class="day-name">${dayNames[i]}</div>
                            <div class="day-date">${currentDay.getDate()}</div>
                        </div>
                    `;
                }).join('')}
            </div>
            <div class="week-grid">
                <div class="time-slots">
                    ${config.timeSlots.map(time => `
                        <div class="time-slot">${time}</div>
                    `).join('')}
                </div>
                ${Array.from({length: 7}, (_, dayIndex) => {
                    const currentDay = new Date(weekStart);
                    currentDay.setDate(weekStart.getDate() + dayIndex);
                    const dateStr = currentDay.toISOString().split('T')[0];
                    const dayEvents = state.events.filter(event => 
                        event.date === dateStr && !event.cancelled
                    );
                    
                    return `
                        <div class="day-column" data-date="${dateStr}">
                            ${config.timeSlots.map(time => {
                                const hourEvents = dayEvents.filter(event => 
                                    event.startTime === time
                                );
                                
                                return `
                                    <div class="time-cell" data-time="${time}">
                                        ${hourEvents.map(event => `
                                            <div class="week-event" 
                                                 style="background: ${getEventTypeColor(event.type)};"
                                                 data-event-id="${event.id}">
                                                <div class="event-title">${event.title}</div>
                                                <div class="event-time">${time} - ${calculateEndTime(time, event.duration)}</div>
                                            </div>
                                        `).join('')}
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    `;
                }).join('')}
            </div>
        `;
        
        elements.weekView.innerHTML = calendarHTML;
        if (elements.monthView) elements.monthView.classList.add('hidden');
        elements.weekView.classList.remove('hidden');
        if (elements.dayView) elements.dayView.classList.add('hidden');
        if (elements.listView) elements.listView.classList.add('hidden');
        
        // Agregar event listeners
        elements.weekView.querySelectorAll('.week-event').forEach(eventEl => {
            eventEl.addEventListener('click', function() {
                const eventId = parseInt(this.dataset.eventId);
                showEventDetails(eventId);
            });
        });
    }
    
    function renderDayView() {
        if (!elements.dayView) return;
        
        const date = state.currentDate;
        const dateStr = date.toISOString().split('T')[0];
        const isToday = isSameDay(date, new Date());
        const dayEvents = state.events.filter(event => 
            event.date === dateStr && !event.cancelled
        ).sort((a, b) => a.startTime.localeCompare(b.startTime));
        
        const dayName = date.toLocaleDateString('es-ES', { weekday: 'long' });
        const dayNumber = date.getDate();
        const monthName = date.toLocaleDateString('es-ES', { month: 'long' });
        const year = date.getFullYear();
        
        let calendarHTML = `
            <div class="day-header ${isToday ? 'today' : ''}">
                <div class="day-info">
                    <div class="day-name">${dayName.charAt(0).toUpperCase() + dayName.slice(1)}</div>
                    <div class="day-date">${dayNumber} de ${monthName} ${year}</div>
                </div>
                <div class="day-stats">
                    <span class="events-count">${dayEvents.length} evento${dayEvents.length !== 1 ? 's' : ''}</span>
                </div>
            </div>
            <div class="day-timeline">
                ${config.timeSlots.map(time => {
                    const hourEvents = dayEvents.filter(event => event.startTime === time);
                    const nextHour = parseInt(time.split(':')[0]) + 1;
                    const nextTime = `${nextHour.toString().padStart(2, '0')}:00`;
                    
                    return `
                        <div class="hour-slot">
                            <div class="hour-time">${time}</div>
                            <div class="hour-events">
                                ${hourEvents.map(event => `
                                    <div class="day-event" data-event-id="${event.id}">
                                        <div class="event-header" style="background: ${getEventTypeColor(event.type)};">
                                            <div class="event-time">${time} - ${calculateEndTime(time, event.duration)}</div>
                                            <div class="event-type">
                                                <i class="${getEventTypeIcon(event.type)}"></i>
                                                ${getEventTypeName(event.type)}
                                            </div>
                                        </div>
                                        <div class="event-content">
                                            <h4 class="event-title">${event.title}</h4>
                                            ${event.description ? `
                                                <p class="event-description">${event.description}</p>
                                            ` : ''}
                                            <div class="event-meta">
                                                <span class="event-instructor">
                                                    <i class="fas fa-user"></i> ${event.instructor}
                                                </span>
                                                <span class="event-level ${event.level}">
                                                    <i class="fas fa-chart-line"></i> 
                                                    ${getLevelName(event.level)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
        
        elements.dayView.innerHTML = calendarHTML;
        if (elements.monthView) elements.monthView.classList.add('hidden');
        if (elements.weekView) elements.weekView.classList.add('hidden');
        elements.dayView.classList.remove('hidden');
        if (elements.listView) elements.listView.classList.add('hidden');
        
        // Agregar event listeners
        elements.dayView.querySelectorAll('.day-event').forEach(eventEl => {
            eventEl.addEventListener('click', function() {
                const eventId = parseInt(this.dataset.eventId);
                showEventDetails(eventId);
            });
        });
    }
    
    function renderListView() {
        if (!elements.listBody) return;
        
        // Filtrar eventos no cancelados y ordenar por fecha
        const sortedEvents = state.events
            .filter(event => !event.cancelled)
            .sort((a, b) => {
                const dateA = new Date(a.date + 'T' + a.startTime);
                const dateB = new Date(b.date + 'T' + b.startTime);
                return dateA - dateB;
            });
        
        if (sortedEvents.length === 0) {
            elements.listBody.innerHTML = `
                <div class="empty-list">
                    <i class="fas fa-calendar-times"></i>
                    <h3>No hay eventos programados</h3>
                    <p>Crea el primer evento para empezar a programar sesiones.</p>
                    <button class="btn btn-primary" id="first-event-btn">
                        <i class="fas fa-plus"></i> Crear primer evento
                    </button>
                </div>
            `;
            
            // Event listener para el botón
            setTimeout(() => {
                const firstEventBtn = document.getElementById('first-event-btn');
                if (firstEventBtn) firstEventBtn.addEventListener('click', openNewEventModal);
            }, 100);
            
            return;
        }
        
        const eventsHTML = sortedEvents.map(event => `
            <div class="list-row" data-event-id="${event.id}">
                <div class="list-col">
                    ${formatEventDate(event.date)}
                </div>
                <div class="list-col">
                    ${formatTime(event.startTime)} - ${calculateEndTime(event.startTime, event.duration)}
                </div>
                <div class="list-col">
                    <div class="event-title">${event.title}</div>
                    ${event.description ? `
                        <div class="event-description">${event.description.substring(0, 50)}...</div>
                    ` : ''}
                </div>
                <div class="list-col">
                    <span class="event-type-badge" style="background: ${getEventTypeColor(event.type)}20; color: ${getEventTypeColor(event.type)};">
                        <i class="${getEventTypeIcon(event.type)}"></i>
                        ${getEventTypeName(event.type)}
                    </span>
                </div>
                <div class="list-col">
                    <div class="event-instructor">
                        <i class="fas fa-user"></i> ${event.instructor}
                    </div>
                </div>
                <div class="list-col">
                    <div class="event-actions">
                        <button class="btn-icon view-event" data-event-id="${event.id}" title="Ver detalles">
                            <i class="fas fa-eye"></i>
                        </button>
                        ${event.createdBy === getCurrentUser()?.id ? `
                            <button class="btn-icon edit-event" data-event-id="${event.id}" title="Editar">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-icon delete-event" data-event-id="${event.id}" title="Eliminar">
                                <i class="fas fa-trash"></i>
                            </button>
                        ` : ''}
                        ${event.link ? `
                            <a href="${event.link}" target="_blank" class="btn-icon join-event" title="Unirse">
                                <i class="fas fa-video"></i>
                            </a>
                        ` : ''}
                    </div>
                </div>
            </div>
        `).join('');
        
        elements.listBody.innerHTML = eventsHTML;
        
        // Agregar event listeners
        attachListEventListeners();
    }
    
    function attachListEventListeners() {
        // Botones de ver detalles
        document.querySelectorAll('.view-event').forEach(btn => {
            btn.addEventListener('click', function() {
                const eventId = parseInt(this.dataset.eventId);
                showEventDetails(eventId);
            });
        });
        
        // Botones de editar
        document.querySelectorAll('.edit-event').forEach(btn => {
            btn.addEventListener('click', function() {
                const eventId = parseInt(this.dataset.eventId);
                editEvent(eventId);
            });
        });
        
        // Botones de eliminar
        document.querySelectorAll('.delete-event').forEach(btn => {
            btn.addEventListener('click', function() {
                const eventId = parseInt(this.dataset.eventId);
                deleteEvent(eventId);
            });
        });
        
        // Filas completas
        document.querySelectorAll('.list-row').forEach(row => {
            row.addEventListener('click', function(e) {
                if (!e.target.closest('.event-actions')) {
                    const eventId = parseInt(this.dataset.eventId);
                    showEventDetails(eventId);
                }
            });
        });
    }
    
    function navigatePrevious() {
        switch (state.currentView) {
            case 'month':
                state.currentDate.setMonth(state.currentDate.getMonth() - 1);
                break;
            case 'week':
                state.currentDate.setDate(state.currentDate.getDate() - 7);
                break;
            case 'day':
                state.currentDate.setDate(state.currentDate.getDate() - 1);
                break;
        }
        renderCalendar();
    }
    
    function navigateNext() {
        switch (state.currentView) {
            case 'month':
                state.currentDate.setMonth(state.currentDate.getMonth() + 1);
                break;
            case 'week':
                state.currentDate.setDate(state.currentDate.getDate() + 7);
                break;
            case 'day':
                state.currentDate.setDate(state.currentDate.getDate() + 1);
                break;
        }
        renderCalendar();
    }
    
    function switchView(view) {
        state.currentView = view;
        
        // Actualizar botones activos
        if (elements.viewBtns) {
            elements.viewBtns.forEach(btn => {
                btn.classList.toggle('active', btn.dataset.view === view);
            });
        }
        
        // Renderizar vista
        renderCalendar();
    }
    
    function toggleEventFilter(type) {
        // En una implementación completa, aquí filtrarías los eventos
        console.log(`Filtrando por tipo: ${type}`);
        // Por ahora solo mostramos mensaje
        if (typeof window.showMessage === 'function') {
            window.showMessage(`Filtro aplicado: ${getEventTypeName(type)}`, 'info');
        }
    }
    
    function openNewEventModal() {
        const currentUser = getCurrentUser();
        if (!currentUser) {
            if (typeof window.showMessage === 'function') {
                window.showMessage('Debes iniciar sesión para crear eventos', 'error');
            }
            if (typeof AuthSystem !== 'undefined') {
                AuthSystem.openModal('login');
            }
            return;
        }
        
        // Mostrar modal
        const overlay = document.getElementById('modal-overlay');
        const modal = elements.newEventModal;
        
        if (overlay) overlay.classList.add('active');
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            // Auto-focus en título
            setTimeout(() => {
                const eventTitle = document.getElementById('event-title');
                if (eventTitle) eventTitle.focus();
            }, 100);
        }
    }
    
    function closeModal(modal) {
        const overlay = document.getElementById('modal-overlay');
        
        if (overlay) overlay.classList.remove('active');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
            
            // Reset form si es el modal de nuevo evento
            if (modal.id === 'new-event-modal' && elements.newEventForm) {
                elements.newEventForm.reset();
                
                // Reset fecha a hoy
                const today = new Date().toISOString().split('T')[0];
                const eventDateInput = document.getElementById('event-date');
                if (eventDateInput) eventDateInput.value = today;
                
                // Reset tipo a "session"
                const sessionOption = elements.eventTypeOptions?.querySelector('[data-type="session"]');
                if (sessionOption) {
                    elements.eventTypeOptions?.querySelectorAll('.type-option').forEach(o => {
                        o.classList.remove('selected');
                    });
                    sessionOption.classList.add('selected');
                    const radio = sessionOption.querySelector('input[type="radio"]');
                    if (radio) radio.checked = true;
                }
            }
        }
    }
    
    async function handleNewEvent(e) {
        e.preventDefault();
        
        const currentUser = getCurrentUser();
        if (!currentUser) {
            if (typeof window.showMessage === 'function') {
                window.showMessage('Debes iniciar sesión para crear eventos', 'error');
            }
            return;
        }
        
        // Obtener valores del formulario
        const title = document.getElementById('event-title') ? document.getElementById('event-title').value.trim() : '';
        const typeRadio = document.querySelector('input[name="event-type"]:checked');
        const type = typeRadio ? typeRadio.value : 'session';
        const instructor = document.getElementById('event-instructor') ? document.getElementById('event-instructor').value.trim() : '';
        const date = document.getElementById('event-date') ? document.getElementById('event-date').value : '';
        const startTime = document.getElementById('event-start-time') ? document.getElementById('event-start-time').value : '';
        const duration = document.getElementById('event-duration') ? parseInt(document.getElementById('event-duration').value) : 60;
        const description = document.getElementById('event-description') ? document.getElementById('event-description').value.trim() : '';
        const link = document.getElementById('event-link') ? document.getElementById('event-link').value.trim() : '';
        const levelRadio = document.querySelector('input[name="event-level"]:checked');
        const level = levelRadio ? levelRadio.value : 'beginner';
        const maxAttendees = document.getElementById('event-max-attendees') ? parseInt(document.getElementById('event-max-attendees').value) || 0 : 50;
        
        // Validaciones
        let isValid = true;
        
        if (!title || title.length < 5) {
            if (typeof window.showMessage === 'function') {
                window.showMessage('El título debe tener al menos 5 caracteres', 'error');
            }
            isValid = false;
        }
        
        if (!instructor || instructor.length < 2) {
            if (typeof window.showMessage === 'function') {
                window.showMessage('El instructor es requerido', 'error');
            }
            isValid = false;
        }
        
        if (!date) {
            if (typeof window.showMessage === 'function') {
                window.showMessage('La fecha es requerida', 'error');
            }
            isValid = false;
        }
        
        if (!startTime) {
            if (typeof window.showMessage === 'function') {
                window.showMessage('La hora de inicio es requerida', 'error');
            }
            isValid = false;
        }
        
        if (!isValid) return;
        
        // Crear nuevo evento
        const newEvent = {
            id: Date.now(),
            title: title,
            type: type,
            instructor: instructor,
            date: date,
            startTime: startTime,
            duration: duration,
            description: description,
            link: link,
            level: level,
            maxAttendees: maxAttendees,
            attendees: [],
            createdBy: currentUser.id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            cancelled: false
        };
        
        // Agregar al estado
        state.events.push(newEvent);
        
        // Guardar en localStorage
        saveEvents();
        
        // Cerrar modal
        if (elements.newEventModal) closeModal(elements.newEventModal);
        
        // Actualizar UI
        renderCalendar();
        
        // Mostrar mensaje de éxito
        if (typeof window.showMessage === 'function') {
            window.showMessage('¡Evento creado exitosamente!', 'success');
        }
        
        console.log(`📅 Nuevo evento creado: "${title}" el ${date} a las ${startTime}`);
    }
    
    function showEventDetails(eventId) {
        const event = state.events.find(e => e.id === eventId);
        if (!event) return;
        
        state.selectedEvent = event;
        
        // Actualizar modal de detalles
        const modal = elements.eventDetailModal;
        const title = modal ? modal.querySelector('#event-detail-title') : null;
        const content = modal ? modal.querySelector('#event-detail-content') : null;
        const actions = modal ? modal.querySelector('#event-detail-actions') : null;
        
        if (title) {
            title.innerHTML = `
                <i class="${getEventTypeIcon(event.type)}" style="color: ${getEventTypeColor(event.type)};"></i>
                ${event.title}
            `;
        }
        
        if (content) {
            content.innerHTML = `
                <div class="event-detail-info">
                    <div class="detail-row">
                        <div class="detail-label"><i class="far fa-calendar"></i> Fecha</div>
                        <div class="detail-value">${formatEventDateLong(event.date)}</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label"><i class="far fa-clock"></i> Hora</div>
                        <div class="detail-value">${formatTime(event.startTime)} - ${calculateEndTime(event.startTime, event.duration)} (${event.duration} min)</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label"><i class="fas fa-user"></i> Instructor</div>
                        <div class="detail-value">${event.instructor}</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label"><i class="fas fa-chart-line"></i> Nivel</div>
                        <div class="detail-value">
                            <span class="level-badge ${event.level}">${getLevelName(event.level)}</span>
                        </div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label"><i class="fas fa-users"></i> Asistentes</div>
                        <div class="detail-value">
                            ${event.attendees.length} ${event.maxAttendees > 0 ? `/ ${event.maxAttendees}` : ''}
                        </div>
                    </div>
                    ${event.link ? `
                        <div class="detail-row">
                            <div class="detail-label"><i class="fas fa-link"></i> Enlace</div>
                            <div class="detail-value">
                                <a href="${event.link}" target="_blank" class="event-link">
                                    <i class="fas fa-external-link-alt"></i> Unirse al evento
                                </a>
                            </div>
                        </div>
                    ` : ''}
                </div>
                
                ${event.description ? `
                    <div class="event-description-section">
                        <h4><i class="fas fa-align-left"></i> Descripción</h4>
                        <div class="event-description">${event.description}</div>
                    </div>
                ` : ''}
                
                <div class="event-stats">
                    <div class="stat-item">
                        <i class="fas fa-calendar-plus"></i>
                        <div class="stat-label">Creado</div>
                        <div class="stat-value">${formatRelativeTime(event.createdAt)}</div>
                    </div>
                    <div class="stat-item">
                        <i class="fas fa-sync-alt"></i>
                        <div class="stat-label">Actualizado</div>
                        <div class="stat-value">${formatRelativeTime(event.updatedAt)}</div>
                    </div>
                </div>
            `;
        }
        
        if (actions) {
            const currentUser = getCurrentUser();
            const isCreator = currentUser && event.createdBy === currentUser.id;
            
            actions.innerHTML = `
                <div class="modal-actions">
                    ${event.link ? `
                        <a href="${event.link}" target="_blank" class="btn btn-primary">
                            <i class="fas fa-video"></i> Unirse
                        </a>
                    ` : ''}
                    
                    ${isCreator ? `
                        <button class="btn btn-outline" id="edit-event-btn" data-event-id="${event.id}">
                            <i class="fas fa-edit"></i> Editar
                        </button>
                        <button class="btn btn-outline" id="delete-event-btn" data-event-id="${event.id}">
                            <i class="fas fa-trash"></i> Eliminar
                        </button>
                    ` : ''}
                    
                    <button class="btn btn-secondary modal-close">
                        <i class="fas fa-times"></i> Cerrar
                    </button>
                </div>
            `;
            
            // Agregar event listeners a los botones
            setTimeout(() => {
                const editBtn = document.getElementById('edit-event-btn');
                if (editBtn) {
                    editBtn.addEventListener('click', function() {
                        if (modal) closeModal(modal);
                        editEvent(event.id);
                    });
                }
                
                const deleteBtn = document.getElementById('delete-event-btn');
                if (deleteBtn) {
                    deleteBtn.addEventListener('click', function() {
                        if (modal) closeModal(modal);
                        deleteEvent(event.id);
                    });
                }
            }, 100);
        }
        
        // Mostrar modal
        const overlay = document.getElementById('modal-overlay');
        if (overlay) overlay.classList.add('active');
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }
    
    function editEvent(eventId) {
        const event = state.events.find(e => e.id === eventId);
        if (!event) return;
        
        // En una implementación completa, aquí abrirías el modal de edición
        // Por ahora solo mostramos mensaje
        if (typeof window.showMessage === 'function') {
            window.showMessage('Funcionalidad de edición en desarrollo', 'info');
        }
    }
    
    function deleteEvent(eventId) {
        const event = state.events.find(e => e.id === eventId);
        if (!event) return;
        
        const currentUser = getCurrentUser();
        if (!currentUser || event.createdBy !== currentUser.id) {
            if (typeof window.showMessage === 'function') {
                window.showMessage('No tienes permiso para eliminar este evento', 'error');
            }
            return;
        }
        
        if (!confirm('¿Estás seguro de que quieres eliminar este evento?')) {
            return;
        }
        
        // Marcar como cancelado (soft delete)
        const eventIndex = state.events.findIndex(e => e.id === eventId);
        if (eventIndex !== -1) {
            state.events[eventIndex].cancelled = true;
            state.events[eventIndex].cancelledAt = new Date().toISOString();
            saveEvents();
            
            // Actualizar UI
            renderCalendar();
            
            if (typeof window.showMessage === 'function') {
                window.showMessage('Evento eliminado', 'info');
            }
        }
    }
    
    // ===== FUNCIONES DE UTILIDAD =====
    function getWeekStart(date) {
        const day = date.getDay();
        const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Ajustar para que semana empiece en Lunes
        const newDate = new Date(date);
        newDate.setDate(diff);
        return newDate;
    }
    
    function isSameDay(date1, date2) {
        return date1.getFullYear() === date2.getFullYear() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getDate() === date2.getDate();
    }
    
    function formatTime(time) {
        return time;
    }
    
    function calculateEndTime(startTime, duration) {
        const [hours, minutes] = startTime.split(':').map(Number);
        const totalMinutes = hours * 60 + minutes + duration;
        const endHours = Math.floor(totalMinutes / 60);
        const endMinutes = totalMinutes % 60;
        return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
    }
    
    function formatEventDate(dateStr) {
        const date = new Date(dateStr);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        
        if (isSameDay(date, today)) return 'Hoy';
        if (isSameDay(date, tomorrow)) return 'Mañana';
        
        return date.toLocaleDateString('es-ES', { 
            weekday: 'short', 
            day: 'numeric',
            month: 'short'
        });
    }
    
    function formatEventDateLong(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleDateString('es-ES', { 
            weekday: 'long', 
            day: 'numeric', 
            month: 'long',
            year: 'numeric'
        });
    }
    
    function formatRelativeTime(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / (1000 * 60));
        
        if (diffMins < 1) return 'Ahora mismo';
        if (diffMins < 60) return `Hace ${diffMins} min`;
        
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        if (diffHours < 24) return `Hace ${diffHours} h`;
        
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        if (diffDays === 1) return 'Ayer';
        if (diffDays < 7) return `Hace ${diffDays} días`;
        
        const diffWeeks = Math.floor(diffDays / 7);
        if (diffWeeks < 4) return `Hace ${diffWeeks} sem`;
        
        return date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
    }
    
    function getEventTypeColor(typeId) {
        const type = config.eventTypes.find(t => t.id === typeId);
        return type?.color || '#00ffff';
    }
    
    function getEventTypeIcon(typeId) {
        const type = config.eventTypes.find(t => t.id === typeId);
        return type?.icon || 'fas fa-calendar';
    }
    
    function getEventTypeName(typeId) {
        const type = config.eventTypes.find(t => t.id === typeId);
        return type?.name || 'Evento';
    }
    
    function getLevelName(level) {
        const levels = {
            'beginner': 'Principiante',
            'intermediate': 'Intermedio',
            'advanced': 'Avanzado',
            'all': 'Todos los niveles'
        };
        return levels[level] || 'Todos';
    }
    
    function getCurrentUser() {
        if (typeof window.getCurrentUser === 'function') {
            return window.getCurrentUser();
        }
        
        try {
            return JSON.parse(localStorage.getItem('current_user'));
        } catch (e) {
            return null;
        }
    }
    
    // ===== FUNCIONES PÚBLICAS =====
    function getEvents() {
        return [...state.events];
    }
    
    function getEventCount() {
        return state.events.length;
    }
    
    function addEvent(eventData) {
        const currentUser = getCurrentUser();
        if (!currentUser) return null;
        
        const newEvent = {
            id: Date.now(),
            ...eventData,
            createdBy: currentUser.id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            cancelled: false,
            attendees: []
        };
        
        state.events.push(newEvent);
        saveEvents();
        
        // Actualizar UI si está visible
        if (document.getElementById('calendar-container')) {
            renderCalendar();
        }
        
        return newEvent;
    }
    
    function resetCalendar() {
        if (confirm('¿Estás seguro de que quieres resetear el calendario? Se perderán todos los eventos.')) {
            state.events = [];
            saveEvents();
            renderCalendar();
            if (typeof window.showMessage === 'function') {
                window.showMessage('Calendario reseteado', 'info');
            }
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
        getEvents,
        getEventCount,
        addEvent,
        resetCalendar
    };
})();

// Hacerlo global
window.CalendarSystem = CalendarSystem;