// Global state variables
let currentLoggedInUser = '';
let isLoggedIn = false;

// DOM Elements Cache
let userMenu, userMenuButton, userMenuText, logoutDropdown, logoutButton;
let loginSection, appContentSection, mainContent, mainNavigation;

// --- Sample Data (Se mantienen los datos de ejemplo) ---
const sampleKpis = { beneficiosActivos: 22, acuerdosVigentes: 18, marcasAsignadas: 10, alertasCriticas: 2, tareasPendientes: 5 };
const sampleMarcas = [
    { id: 1, nombre: "SuperTienda Online", cuit: "30-11223344-5", estado: "Activa", estadoColor: "green" },
    { id: 2, nombre: "GastroBar Delicias", cuit: "30-55667788-9", estado: "Pendiente", estadoColor: "yellow" },
    { id: 3, nombre: "TecnoSoluciones SRL", cuit: "30-99001122-3", estado: "Activa", estadoColor: "green" },
    { id: 4, nombre: "Moda Urbana", cuit: "30-12341234-0", estado: "Inactiva", estadoColor: "red" },
];
const sampleBeneficios = [
    { id: 101, nombre: "30% Off Almuerzos", marca: "GastroBar Delicias", tipo: "Descuento %", estado: "Activo" },
    { id: 102, nombre: "Envío Gratis > $5K", marca: "SuperTienda Online", tipo: "Condicional", estado: "Activo" },
    { id: 103, nombre: "2x1 CineMartes", marca: "Cines Metropolis", tipo: "2x1", estado: "Programado" },
    { id: 104, nombre: "Liquidación Invierno", marca: "Moda Urbana", tipo: "Descuento %", estado: "Inactivo" },
];
const sampleAlertas = [
    { texto: "Acuerdo 'Promo Verano Flash' vence mañana.", tipo: "critical", icon: "🚨" }, // Usando emojis para un look más moderno
    { texto: "'GastroBar Delicias' aún no cargó beneficios.", tipo: "warning", icon: "🔔" },
    { texto: "Revisar nuevas solicitudes de marca.", tipo: "info", icon: "💡" }
];
const sampleSugerenciasIA = [
    { texto: "Para 'SuperTienda Online', ofrecer envío gratis en compras > $5000." },
    { texto: "'TecnoSoluciones SRL': considerar promo en accesorios." }
];
const sampleUsuarios = [
    { id: 1, nombre: "Ana Gomez", email: "agomez@example.com", rol: "Agente Comercial" },
    { id: 2, nombre: "Carlos Ruiz", email: "cruiz@example.com", rol: "Agente Comercial" },
    { id: 3, nombre: "Laura Sistema", email: "lsistema@example.com", rol: "Administrador" }
];
const samplePerfiles = [
    { id: 'agente', nombre: "Agente Comercial", descripcion: "Gestión de cartera de marcas y beneficios." },
    { id: 'admin', nombre: "Administrador", descripcion: "Acceso total y configuración del sistema." }
];


// --- Template Injection Function ---
function injectTemplate(templateId, targetElement) {
    const template = document.getElementById(templateId);
    if (template && targetElement) {
        const clone = template.content.cloneNode(true);
        targetElement.innerHTML = '';
        targetElement.appendChild(clone);
        return true;
    }
    console.error(`Template with id '${templateId}' or target element '${targetElement}' not found.`);
    if (targetElement) {
        targetElement.innerHTML = `<div class="p-6 text-center text-[var(--color-text-secondary)]"><p class="text-2xl mb-2">🚧</p><p>Error: No se pudo cargar la plantilla <code class="bg-gray-200 dark:bg-gray-700 p-1 rounded text-sm">${templateId}</code>.</p></div>`;
    }
    return false;
}

// --- Helper Functions ---
function createAlertListItem(alerta) {
    const li = document.createElement('li');
    let bgColor = 'bg-sky-500/10'; // Tailwind: bg-sky-500 con opacidad
    let textColor = 'text-sky-300'; // Tailwind: text-sky-300
    let borderColor = 'border-sky-500'; // Tailwind: border-sky-500

    if (alerta.tipo === 'critical') {
        bgColor = 'bg-rose-500/10'; textColor = 'text-rose-300'; borderColor = 'border-rose-500';
    } else if (alerta.tipo === 'warning') {
        bgColor = 'bg-amber-500/10'; textColor = 'text-amber-300'; borderColor = 'border-amber-500';
    }
    li.className = `p-2.5 rounded-md border-l-4 ${borderColor} ${bgColor} text-sm flex items-start`;
    const iconSpan = document.createElement('span'); iconSpan.className = 'mr-2 text-lg'; iconSpan.textContent = alerta.icon || '💡';
    const textSpan = document.createElement('span'); textSpan.className = textColor; textSpan.textContent = alerta.texto;
    li.appendChild(iconSpan); li.appendChild(textSpan);
    return li;
}

// --- Data Population Functions (adaptadas para la nueva estética) ---
function populateDashboardKpis(kpis) {
    if (document.getElementById('kpi-beneficios-activos')) document.getElementById('kpi-beneficios-activos').textContent = kpis.beneficiosActivos;
    if (document.getElementById('kpi-acuerdos-vigentes')) document.getElementById('kpi-acuerdos-vigentes').textContent = kpis.acuerdosVigentes;
    if (document.getElementById('kpi-marcas-asignadas')) document.getElementById('kpi-marcas-asignadas').textContent = kpis.marcasAsignadas;
    if (document.getElementById('kpi-alertas-criticas')) document.getElementById('kpi-alertas-criticas').textContent = "99"; // Test value
    if (document.getElementById('kpi-tareas-pendientes')) document.getElementById('kpi-tareas-pendientes').textContent = "77"; // Test value
}
function populateMarcasRecientes(marcas) {
    const tbody = document.getElementById('marcas-recientes-tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    marcas.slice(0, 4).forEach(marca => { // Mostrar hasta 4 para densidad
        const tr = document.createElement('tr');
        tr.innerHTML = `<td class="compact-table text-[var(--color-text-primary)]">${marca.nombre}</td><td class="compact-table text-right"><span class="px-2 py-0.5 text-xxs font-semibold rounded-full bg-${marca.estadoColor}-500/20 text-${marca.estadoColor}-400">${marca.estado}</span></td>`;
        tbody.appendChild(tr);
    });
}
function populateTablaGestionMarcas(marcas) {
    const tbody = document.getElementById('tabla-marcas-body');
    if (!tbody) return;
    tbody.innerHTML = '';
    marcas.forEach(marca => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="compact-table">${marca.nombre}</td>
            <td class="compact-table">${marca.cuit}</td>
            <td class="compact-table"><span class="px-2 py-0.5 text-xxs font-semibold rounded-full bg-${marca.estadoColor}-500/20 text-${marca.estadoColor}-400">${marca.estado}</span></td>
            <td class="compact-table text-center">
                <button class="text-[var(--color-accent-primary)] hover:text-[var(--color-accent-primary-hover)] text-xs">Ver</button>
                <button class="text-[var(--color-accent-primary)] hover:text-[var(--color-accent-primary-hover)] text-xs ml-2" onclick="window.location.hash='#alta-marca?id=${marca.id}'">Editar</button>
            </td>`;
        tbody.appendChild(tr);
    });
}
function populateTablaGestionBeneficios(beneficios) {
    const tbody = document.getElementById('tabla-beneficios-body');
    if (!tbody) return;
    tbody.innerHTML = '';
    beneficios.forEach(beneficio => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="compact-table">${beneficio.nombre}</td>
            <td class="compact-table text-[var(--color-text-secondary)]">${beneficio.marca}</td>
            <td class="compact-table text-[var(--color-text-secondary)]">${beneficio.tipo}</td>
            <td class="compact-table"><span class="px-2 py-0.5 text-xxs font-semibold rounded-full ${beneficio.estado === 'Activo' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}">${beneficio.estado}</span></td>
            <td class="compact-table text-center">
                <button class="text-[var(--color-accent-primary)] hover:text-[var(--color-accent-primary-hover)] text-xs" onclick="window.location.hash='#gestion-beneficio?id=${beneficio.id}'">Editar</button>
            </td>`;
        tbody.appendChild(tr);
    });
}
function populateBeneficiosPorVencer(beneficios) {
    const ul = document.getElementById('beneficios-vencer-list');
    if (!ul) return;
    ul.innerHTML = '';
    beneficios.slice(0,3).forEach(b => { const li = document.createElement('li'); li.innerHTML = `<span class="font-semibold">${b.beneficio}</span> (${b.marca}) - vence ${b.vence}`; ul.appendChild(li); });
}
function populateAlertasImportantes(alertas) {
    const ul = document.getElementById('alertas-importantes-list');
    if (!ul) return;
    ul.innerHTML = '';
    alertas.slice(0,3).forEach(alerta => ul.appendChild(createAlertListItem(alerta)));
}
function populateSugerenciasIA(sugerencias) {
    const ul = document.getElementById('sugerencias-ia-list');
    if (!ul) return;
    ul.innerHTML = '';
    sugerencias.slice(0,2).forEach(sug => { const li = document.createElement('li'); li.textContent = sug.texto; ul.appendChild(li); });
}
function populateTablaUsuarios(usuarios) {
    const tbody = document.getElementById('tabla-usuarios-body');
    if (!tbody) return;
    tbody.innerHTML = '';
    usuarios.forEach(usuario => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td class="compact-table">${usuario.nombre}</td><td class="compact-table">${usuario.email}</td><td class="compact-table">${usuario.rol}</td><td class="compact-table text-center"><button class="text-[var(--color-accent-primary)] hover:text-[var(--color-accent-primary-hover)] text-xs">Editar</button></td>`;
        tbody.appendChild(tr);
    });
}
function populateTablaPerfiles(perfiles) {
    const tbody = document.getElementById('tabla-perfiles-body');
    if (!tbody) return;
    tbody.innerHTML = '';
    perfiles.forEach(perfil => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td class="compact-table">${perfil.nombre}</td><td class="compact-table">${perfil.descripcion}</td><td class="compact-table text-center"><button class="text-[var(--color-accent-primary)] hover:text-[var(--color-accent-primary-hover)] text-xs">Permisos</button></td>`;
        tbody.appendChild(tr);
    });
}

// --- UI State Update Functions ---
function updateNavbarUI() {
    const dropdownUserEmail = document.getElementById('dropdown-user-email');
    if (isLoggedIn) {
        if (userMenuText) {
            let displayUser = "Usuario";
            if (currentLoggedInUser) {
                const atIndex = currentLoggedInUser.indexOf('@');
                displayUser = atIndex !== -1 ? currentLoggedInUser.substring(0, atIndex) : currentLoggedInUser;
                if(dropdownUserEmail) dropdownUserEmail.textContent = currentLoggedInUser;
            }
            userMenuText.textContent = displayUser;
        }
        if (userMenu) userMenu.classList.remove('hidden');
        if (mainNavigation) mainNavigation.classList.remove('hidden');
    } else {
        if (userMenuText) userMenuText.textContent = 'Usuario';
        if (userMenu) userMenu.classList.add('hidden');
        if (logoutDropdown) logoutDropdown.classList.add('hidden');
        if (mainNavigation) mainNavigation.classList.add('hidden');
    }
}

function handleLoginSuccess() {
    isLoggedIn = true;
    updateNavbarUI();
    window.location.hash = '#dashboard';
}

function handleLogout() {
    isLoggedIn = false;
    currentLoggedInUser = '';
    updateNavbarUI();
    window.location.hash = '#login';
}

// --- Event Listeners Setup ---
function attachLoginFormListener() {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const emailInput = document.getElementById('email-address');
            currentLoggedInUser = emailInput.value || "agente@mi365.com"; 
            handleLoginSuccess();
        });
    }
}

function attachUserMenuListeners() {
    const userMenuButtonEl = document.getElementById('user-menu-button');
    const logoutDropdownEl = document.getElementById('logout-dropdown');
    const logoutButtonEl = document.getElementById('logout-button');

    if (userMenuButtonEl && logoutDropdownEl) {
        userMenuButtonEl.addEventListener('click', (event) => {
            event.stopPropagation();
            if (isLoggedIn) logoutDropdownEl.classList.toggle('hidden');
        });
    }
    if (logoutButtonEl) {
        logoutButtonEl.addEventListener('click', function(event) {
            event.preventDefault(); event.stopPropagation();
            handleLogout();
        });
    }
}

function setupAltaMarcaFormListeners() {
    const form = document.getElementById('alta-marca-form');
    if (!form) return;
    const submitButton = form.querySelector('#alta-marca-submit-button');
    const successMessageDiv = form.querySelector('#form-success-message');
    form.addEventListener('submit', function(event) {
        event.preventDefault();
        if (successMessageDiv) {
            successMessageDiv.textContent = 'Marca guardada exitosamente (simulado).';
            successMessageDiv.classList.remove('hidden');
        }
        if (submitButton) {
            submitButton.textContent = 'Guardando...';
            submitButton.disabled = true;
        }
        setTimeout(() => { 
            if (window.location.hash.startsWith('#alta-marca')) window.location.hash = '#gestion-marcas'; 
        }, 1500);
    });
}

function setupCambiarContrasenaFormListeners() {
    const form = document.getElementById('cambiar-contrasena-form');
    if(form) {
        form.addEventListener('submit', function(event) {
            event.preventDefault();
            alert('Funcionalidad "Cambiar Contraseña" (simulada).');
            form.reset();
        });
    }
}

async function handleGenerarDescripcionIA() {
    const nombreBeneficioInput = document.getElementById('gb-nombre-beneficio');
    const tipoBeneficioSelect = document.getElementById('gb-tipo-beneficio');
    const valorBeneficioInput = document.getElementById('gb-valor-beneficio');
    const descripcionBeneficioTextarea = document.getElementById('gb-descripcion-beneficio');
    const sugerenciasContainer = document.getElementById('ia-sugerencias-container');
    const spinner = document.getElementById('spinner-descripcion-ia');
    const errorMessageDiv = document.getElementById('ia-error-message');

    if (!nombreBeneficioInput || !tipoBeneficioSelect || !valorBeneficioInput || !descripcionBeneficioTextarea || !spinner || !errorMessageDiv || !sugerenciasContainer) {
        console.error("Faltan elementos del DOM para la generación IA.");
        if(errorMessageDiv) { errorMessageDiv.textContent = "Error: Faltan elementos en la página."; errorMessageDiv.classList.remove('hidden'); }
        return;
    }

    const nombre = nombreBeneficioInput.value;
    const tipo = tipoBeneficioSelect.value;
    const valor = valorBeneficioInput.value;
    const marcaAsociadaSelect = document.getElementById('gb-marca-asociada');
    const marca = marcaAsociadaSelect && marcaAsociadaSelect.value ? marcaAsociadaSelect.options[marcaAsociadaSelect.selectedIndex].text : "una marca asociada";

    if (!nombre.trim()) {
        if(errorMessageDiv) { errorMessageDiv.textContent = "Por favor, ingrese el nombre del beneficio."; errorMessageDiv.classList.remove('hidden'); }
        setTimeout(() => { if(errorMessageDiv) errorMessageDiv.classList.add('hidden'); }, 3000);
        return;
    }

    spinner.classList.remove('hidden');
    if(errorMessageDiv) errorMessageDiv.classList.add('hidden');
    descripcionBeneficioTextarea.disabled = true;
    sugerenciasContainer.innerHTML = ''; 

    const prompt = `Eres un experto en marketing de Clarín 365 en Argentina. Para la marca "${marca}", genera tres (3) opciones de descripción atractivas y concisas (máximo 2 frases cortas cada una) para el siguiente beneficio. Numera cada sugerencia del 1 al 3:
Nombre del beneficio: "${nombre}"
Tipo de beneficio: "${tipo}"
Valor/detalle: "${valor}"
Las descripciones deben ser persuasivas, claras para el usuario final y adecuadas para el mercado argentino.`;

    try {
        let chatHistory = [{ role: "user", parts: [{ text: prompt }] }];
        const payload = { contents: chatHistory };
        const apiKey = ""; // Clave API añadida manualmente
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
        
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Error de la API: ${response.status} ${response.statusText}. Detalles: ${JSON.stringify(errorData)}`);
        }
        const result = await response.json();
        if (result.candidates && result.candidates.length > 0 && result.candidates[0].content && result.candidates[0].content.parts && result.candidates[0].content.parts.length > 0) {
            const text = result.candidates[0].content.parts[0].text;
            const suggestions = text.split(/\n\d+\.\s*|\n-\s*/).map(s => s.replace(/^\d+\.\s*/, '').trim()).filter(s => s.length > 5); 
            
            if (suggestions.length > 0) {
                descripcionBeneficioTextarea.value = suggestions[0]; 
                suggestions.forEach((sug, index) => {
                    const p = document.createElement('p');
                    p.className = 'text-xs text-[var(--color-text-secondary)] bg-slate-100 dark:bg-slate-700 p-2 mt-1 rounded-md cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-600 border border-[var(--color-border)]';
                    p.textContent = `${sug}`; 
                    p.onclick = () => { 
                        descripcionBeneficioTextarea.value = sug; 
                        sugerenciasContainer.querySelectorAll('p').forEach(el => el.classList.remove('bg-indigo-100', 'dark:bg-indigo-700', 'border-indigo-400', 'dark:border-indigo-500'));
                        p.classList.add('bg-indigo-100', 'dark:bg-indigo-700', 'border-indigo-400', 'dark:border-indigo-500');
                    };
                    sugerenciasContainer.appendChild(p);
                });
            } else {
                 descripcionBeneficioTextarea.value = text.trim(); 
            }

        } else {
            throw new Error("No se pudo obtener una descripción de la IA. Formato de respuesta inesperado.");
        }
    } catch (error) {
        console.error("Error al generar descripción con IA:", error);
        if(errorMessageDiv) { errorMessageDiv.textContent = `Error al generar: ${error.message}. Intenta de nuevo.`; errorMessageDiv.classList.remove('hidden');}
    } finally {
        spinner.classList.add('hidden');
        descripcionBeneficioTextarea.disabled = false;
    }
}

// --- Content Loading and Routing ---
function loadContent(page) {
    if (!mainContent || !loginSection || !appContentSection) return;

    const protectedPages = ['dashboard', 'alta-marca', 'gestion-beneficio', 'configuracion', 'gestion-marcas', 'gestion-beneficios'];
    if (!isLoggedIn && protectedPages.includes(page)) {
        window.location.hash = '#login'; return;
    }
    if (isLoggedIn && page === 'login') {
        window.location.hash = '#dashboard'; return;
    }

    if (page === 'login') {
        loginSection.classList.remove('hidden');
        appContentSection.classList.add('hidden');
        if (mainNavigation) mainNavigation.classList.add('hidden');
    } else {
        loginSection.classList.add('hidden');
        appContentSection.classList.remove('hidden');
        if (mainNavigation && isLoggedIn) mainNavigation.classList.remove('hidden');
    }

    let templateId = '';
    let targetElementForInjection = (page === 'login') ? loginSection : appContentSection;

    switch (page) {
        case 'dashboard': templateId = 'dashboard-template'; break;
        case 'alta-marca': templateId = 'alta-marca-template'; break;
        case 'gestion-beneficio': templateId = 'gestion-beneficio-template'; break;
        case 'configuracion': templateId = 'configuracion-template'; break;
        case 'gestion-marcas': templateId = 'gestion-marcas-template'; break;
        case 'gestion-beneficios': templateId = 'gestion-beneficios-template'; break;
        case 'login': templateId = 'login-template'; break;
        default:
            window.location.hash = isLoggedIn ? '#dashboard' : '#login'; return;
    }

    if (templateId && targetElementForInjection && injectTemplate(templateId, targetElementForInjection)) {
        if (page === 'login') {
            attachLoginFormListener();
        } else if (page === 'dashboard') {
            populateDashboardKpis(sampleKpis);
            populateMarcasRecientes(sampleMarcas); 
            populateBeneficiosPorVencer(sampleBeneficios); 
            populateAlertasImportantes(sampleAlertas);
            populateSugerenciasIA(sampleSugerenciasIA);
            const btnRegistrarMarca = appContentSection.querySelector('#btn-registrar-nueva-marca');
            if (btnRegistrarMarca) btnRegistrarMarca.onclick = () => window.location.hash = '#alta-marca';
            const btnGestionarBeneficio = appContentSection.querySelector('#btn-gestionar-beneficio');
            if(btnGestionarBeneficio) btnGestionarBeneficio.onclick = () => window.location.hash = '#gestion-beneficio'; 
            const perfChartCtx = document.getElementById('performanceChart')?.getContext('2d');
            if (perfChartCtx && typeof Chart !== 'undefined') {
                 new Chart(perfChartCtx, { type: 'line', data: { labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'], datasets: [{ label: 'Rendimiento General', data: [12, 19, 3, 5, 2, 3], borderColor: 'var(--color-accent-blue-detail)', backgroundColor: 'rgba(37, 99, 235, 0.1)', tension: 0.1, fill: true }] }, options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true } } } });
            }
        } else if (page === 'alta-marca') {
            setupAltaMarcaFormListeners();
        } else if (page === 'gestion-beneficio') {
            const btnGenerarDescIA = document.getElementById('btn-generar-descripcion-ia');
            if (btnGenerarDescIA) {
                btnGenerarDescIA.addEventListener('click', handleGenerarDescripcionIA);
            }
            const urlParams = new URLSearchParams(window.location.hash.split('?')[1]);
            const beneficioId = urlParams.get('id');
            const titleElement = document.getElementById('gestion-beneficio-title');
            const form = document.getElementById('gestion-beneficio-form');
            const marcaSelect = document.getElementById('gb-marca-asociada');

            if (beneficioId) { 
                if(titleElement) titleElement.textContent = `Editar Beneficio ID: ${beneficioId}`;
                const beneficioExistente = sampleBeneficios.find(b => b.id == beneficioId);
                if(beneficioExistente && form) {
                    form.elements['gb-nombre-beneficio'].value = beneficioExistente.nombre;
                    form.elements['gb-tipo-beneficio'].value = beneficioExistente.tipo; 
                    if(marcaSelect) {
                        const opt = Array.from(marcaSelect.options).find(o => o.textContent === beneficioExistente.marca);
                        if(opt) opt.selected = true;
                    }
                }
            } else { 
                 if(titleElement) titleElement.textContent = "Crear Nuevo Beneficio";
                 if(form) form.reset(); 
                 if(marcaSelect) marcaSelect.value = ""; 
                 const sugerenciasContainer = document.getElementById('ia-sugerencias-container');
                 if(sugerenciasContainer) sugerenciasContainer.innerHTML = ''; 
            }
        } else if (page === 'configuracion') {
            populateTablaUsuarios(sampleUsuarios);
            populateTablaPerfiles(samplePerfiles);
            setupCambiarContrasenaFormListeners();
        } else if (page === 'gestion-marcas') {
            populateTablaGestionMarcas(sampleMarcas);
        } else if (page === 'gestion-beneficios') {
            populateTablaGestionBeneficios(sampleBeneficios);
        }
    }
    
    // Update active class on nav links using the CSS class '.active'
    document.querySelectorAll('#main-navigation .main-header-link').forEach(link => {
        link.classList.remove('active'); 
        if (link.getAttribute('href') === `#${page}`) {
            link.classList.add('active');
        }
    });
}

function router() {
    let requestedPage = window.location.hash.substring(1);
    if (requestedPage.includes('?')) {
        requestedPage = requestedPage.split('?')[0];
    }
    if (!requestedPage) {
        window.location.hash = '#login'; return;
    }
    loadContent(requestedPage);
}

// --- App Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    userMenu = document.getElementById('user-menu');
    userMenuButton = document.getElementById('user-menu-button');
    userMenuText = document.getElementById('user-menu-text');
    logoutDropdown = document.getElementById('logout-dropdown');
    logoutButton = document.getElementById('logout-button');
    loginSection = document.getElementById('login-section');
    appContentSection = document.getElementById('app-content-section');
    mainContent = document.getElementById('main-content');
    mainNavigation = document.getElementById('main-navigation');

    if (!mainContent || !loginSection || !appContentSection || !userMenu || !mainNavigation) {
        console.error("Faltan elementos críticos del layout. La aplicación podría no funcionar.");
        document.body.innerHTML = "<p style='text-align:center; padding-top: 50px; font-size: 18px;'>Error: Faltan componentes de la aplicación.</p>";
        return;
    }
    
    updateNavbarUI();
    attachUserMenuListeners();
    
    document.addEventListener('click', (event) => {
        if (userMenu && !userMenu.contains(event.target) && logoutDropdown && !logoutDropdown.classList.contains('hidden')) {
            logoutDropdown.classList.add('hidden');
        }
    });

    window.addEventListener('hashchange', router);
    router(); 
});
