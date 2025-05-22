// Global state variables
let currentLoggedInUser = '';
let isLoggedIn = false;

// DOM Elements Cache (populated after DOMContentLoaded and on template loads)
let loginForm = null;
let emailInput = null;
let userMenu = null;
let userMenuText = null;
let logoutDropdown = null;
let logoutButton = null;
let loginSection = null;
let dashboardSection = null;
let mainContent = null; // To inject templates into

// --- Sample Data ---
const sampleKpis = {
    beneficiosActivos: 22,
    acuerdosVigentes: 18,
    marcasAsignadas: 10,
    alertasCriticas: 2,
    tareasPendientes: 5
};
const sampleMarcasRecientes = [
    { nombre: "SuperTienda Online", estado: "Activa", estadoColor: "green" },
    { nombre: "GastroBar Delicias", estado: "Pendiente", estadoColor: "yellow" },
    { nombre: "TecnoSoluciones SRL", estado: "Activa", estadoColor: "green" }
];
const sampleBeneficiosPorVencer = [
    { beneficio: "30% Off Almuerzos", marca: "Restaurante El Sol", vence: "en 2 días" },
    { beneficio: "Envío Gratis", marca: "SuperTienda Online", vence: "en 5 días" },
    { beneficio: "2x1 CineMartes", marca: "Cines Metropolis", vence: "en 10 días" }
];
const sampleAlertas = [
    { texto: "Acuerdo 'Promo Verano Flash' vence mañana.", tipo: "critical", icon: "⚠️" },
    { texto: "'GastroBar Delicias' aún no cargó beneficios.", tipo: "warning", icon: "🔔" },
    { texto: "Revisar nuevas solicitudes de marca.", tipo: "info", icon: "ℹ️" }
];
const sampleSugerenciasIA = [
    { texto: "Para 'SuperTienda Online', ofrecer envío gratis en compras > $5000." },
    { texto: "'TecnoSoluciones SRL': considerar promo en accesorios." }
];
const sampleRecomendacionesGestion = [
    { texto: "Extender a fines de semana (+15% canjes estimados)." },
    { texto: "Aumentar descuento a 25% para liquidar stock (+30% canjes, -5% margen)." }
];

// --- Template Injection Function ---
function injectTemplate(templateId, targetElement) {
    const template = document.getElementById(templateId);
    if (template && targetElement) {
        const clone = template.content.cloneNode(true);
        targetElement.innerHTML = ''; // Clear existing content
        targetElement.appendChild(clone);
        return true; // Indicate success
    }
    console.error(`Template with id '${templateId}' or target element not found.`);
    return false; // Indicate failure
}

// --- Helper Functions for DOM creation ---
function createListItem(text, baseClasses = "p-2 rounded-md", typeClasses = "") {
    const li = document.createElement('li');
    li.className = `${baseClasses} ${typeClasses}`;
    li.textContent = text;
    return li;
}

function createAlertListItem(alerta) {
    const li = document.createElement('li');
    let typeClasses = 'bg-gray-100 border-gray-300 text-gray-700'; // Default info
    if (alerta.tipo === 'critical') {
        typeClasses = 'bg-red-50 border-red-300 text-red-700';
    } else if (alerta.tipo === 'warning') {
        typeClasses = 'bg-yellow-50 border-yellow-300 text-yellow-700';
    }
    li.className = `p-3 rounded-md border ${typeClasses} text-sm flex items-start`;
    
    const iconSpan = document.createElement('span');
    iconSpan.className = 'mr-2 text-lg';
    iconSpan.textContent = alerta.icon || 'ℹ️';
    
    const textSpan = document.createElement('span');
    textSpan.textContent = alerta.texto;
    
    li.appendChild(iconSpan);
    li.appendChild(textSpan);
    return li;
}


// --- Data Population Functions ---
function populateDashboardKpis(kpis) {
    if (document.getElementById('kpi-beneficios-activos')) document.getElementById('kpi-beneficios-activos').textContent = kpis.beneficiosActivos;
    if (document.getElementById('kpi-acuerdos-vigentes')) document.getElementById('kpi-acuerdos-vigentes').textContent = kpis.acuerdosVigentes;
    if (document.getElementById('kpi-marcas-asignadas')) document.getElementById('kpi-marcas-asignadas').textContent = kpis.marcasAsignadas;
    if (document.getElementById('kpi-alertas-criticas')) document.getElementById('kpi-alertas-criticas').textContent = kpis.alertasCriticas;
    if (document.getElementById('kpi-tareas-pendientes')) document.getElementById('kpi-tareas-pendientes').textContent = kpis.tareasPendientes;
}

function populateMarcasRecientes(marcas) {
    const tbody = document.getElementById('marcas-recientes-tbody');
    if (!tbody) return;
    tbody.innerHTML = ''; // Clear existing
    marcas.forEach(marca => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="px-3 py-2 whitespace-nowrap text-sm">${marca.nombre}</td>
            <td class="px-3 py-2 whitespace-nowrap text-sm">
                <span class="px-1.5 py-0.5 text-xxs bg-${marca.estadoColor}-100 text-${marca.estadoColor}-700 rounded-full">${marca.estado}</span>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function populateBeneficiosPorVencer(beneficios) {
    const ul = document.getElementById('beneficios-vencer-list');
    if (!ul) return;
    ul.innerHTML = ''; // Clear existing
    beneficios.forEach(b => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${b.beneficio}</strong> (${b.marca}) - vence ${b.vence}`;
        ul.appendChild(li);
    });
}

function populateAlertasImportantes(alertas) {
    const ul = document.getElementById('alertas-importantes-list');
    if (!ul) return;
    ul.innerHTML = ''; // Clear existing
    alertas.forEach(alerta => {
        ul.appendChild(createAlertListItem(alerta));
    });
}

function populateSugerenciasIA(sugerencias) {
    const ul = document.getElementById('sugerencias-ia-list');
    if (!ul) return;
    ul.innerHTML = ''; // Clear existing
    sugerencias.forEach(sug => {
        const li = document.createElement('li');
        li.textContent = sug.texto;
        ul.appendChild(li);
    });
}

function populateRecomendacionesGestionIA(recomendaciones) {
    const ul = document.getElementById('recomendaciones-ia-gestion-list');
    if (!ul) return;
    ul.innerHTML = ''; // Clear existing
    recomendaciones.forEach(rec => {
        const li = document.createElement('li');
        li.textContent = rec.texto;
        ul.appendChild(li);
    });
}

// --- UI Update Functions ---
function showUserLoggedInUI() {
    if (userMenuText) {
        let displayUser = "Usuario Logueado";
        if (currentLoggedInUser) {
            let extractedUser = currentLoggedInUser;
            const atIndex = currentLoggedInUser.indexOf('@');
            if (atIndex !== -1) {
                extractedUser = currentLoggedInUser.substring(0, atIndex);
            }
            displayUser = extractedUser || "Usuario Logueado";
        }
        userMenuText.textContent = displayUser;
    }

    if (userMenu) userMenu.classList.remove('hidden');
    if (loginSection) loginSection.classList.add('hidden');
    if (mainContent) mainContent.classList.remove('hidden');
    
    loadContent('dashboard'); 
}

function showUserLoggedOutUI() {
    currentLoggedInUser = '';
    if (userMenuText) userMenuText.textContent = '';
    if (userMenu) userMenu.classList.add('hidden');
    if (logoutDropdown) logoutDropdown.classList.add('hidden');
    
    if (loginSection) {
        loginSection.classList.remove('hidden');
        injectTemplate('login-template', loginSection);
        loginForm = document.getElementById('login-form');
        emailInput = document.getElementById('email-address');
        attachLoginFormListener();
    }
    if (mainContent) mainContent.classList.add('hidden');
    if (dashboardSection) dashboardSection.innerHTML = '';
}

// --- Event Listeners Setup ---
function attachLoginFormListener() {
    if (loginForm) {
        loginForm.addEventListener('submit', function(event) {
            event.preventDefault();
            if (emailInput) {
                currentLoggedInUser = emailInput.value;
            }
            isLoggedIn = true;
            showUserLoggedInUI();
            window.location.hash = '#dashboard';
        });
    } else {
        console.warn("Login form not found for attaching listener.");
    }
}

function attachUserMenuListeners() {
    if (userMenu && logoutDropdown) {
        const userButton = userMenu.querySelector('button') || userMenu;
        userButton.addEventListener('click', (event) => {
            event.stopPropagation();
            if (isLoggedIn) {
                logoutDropdown.classList.toggle('hidden');
            }
        });
    }

    if (logoutButton) {
        logoutButton.addEventListener('click', function(event) {
            event.stopPropagation();
            isLoggedIn = false;
            showUserLoggedOutUI();
            window.location.hash = '#login';
        });
    }
}

function setupAltaMarcaFormListeners() {
    const form = document.getElementById('alta-marca-form');
    if (!form) return;

    const submitButton = form.querySelector('#alta-marca-submit-button');
    const successMessageDiv = form.querySelector('#form-success-message');
    const nombreComercialInput = form.querySelector('#nombre-comercial');
    const cuitInput = form.querySelector('#cuit');
    const contactoNombreInput = form.querySelector('#contacto-nombre');
    const contactoEmailInput = form.querySelector('#contacto-email');
    const nombreComercialError = form.querySelector('#nombre-comercial-error');
    const cuitError = form.querySelector('#cuit-error');
    const contactoNombreError = form.querySelector('#contacto-nombre-error');
    const contactoEmailError = form.querySelector('#contacto-email-error');

    form.addEventListener('submit', function(event) {
        event.preventDefault();
        let isValid = true;

        if(successMessageDiv) successMessageDiv.classList.add('hidden');
        if(nombreComercialError) nombreComercialError.textContent = '';
        if(cuitError) cuitError.textContent = '';
        if(contactoNombreError) contactoNombreError.textContent = '';
        if(contactoEmailError) contactoEmailError.textContent = '';
        if(submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = 'Guardar Marca';
        }

        if (nombreComercialInput && nombreComercialError && !nombreComercialInput.value.trim()) {
            nombreComercialError.textContent = 'El nombre comercial es obligatorio.';
            isValid = false;
        }

        if (cuitInput && cuitError) {
            const cuitRegex = /^\d{2}-\d{8}-\d{1}$/;
            if (!cuitInput.value.trim()) {
                cuitError.textContent = 'El CUIT es obligatorio.';
                isValid = false;
            } else if (!cuitRegex.test(cuitInput.value.trim())) {
                cuitError.textContent = 'Formato de CUIT incorrecto. Use XX-XXXXXXXX-X.';
                isValid = false;
            }
        }

        if (contactoNombreInput && contactoNombreError && !contactoNombreInput.value.trim()) {
            contactoNombreError.textContent = 'El nombre de contacto es obligatorio.';
            isValid = false;
        }

        if (contactoEmailInput && contactoEmailError) {
            const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
            if (!contactoEmailInput.value.trim()) {
                contactoEmailError.textContent = 'El email de contacto es obligatorio.';
                isValid = false;
            } else if (!emailRegex.test(contactoEmailInput.value.trim())) {
                contactoEmailError.textContent = 'Formato de email incorrecto.';
                isValid = false;
            }
        }

        if (isValid) {
            const formData = { /* ... gather data ... */ };
            console.log("Form data (simulado):", formData);
            if (successMessageDiv) {
                successMessageDiv.textContent = 'Marca guardada exitosamente (simulado).';
                successMessageDiv.classList.remove('hidden');
            }
            if (submitButton) {
                submitButton.textContent = 'Guardando...';
                submitButton.disabled = true;
            }
            setTimeout(() => { window.location.hash = '#dashboard'; }, 2000);
        } else {
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = 'Guardar Marca';
            }
        }
    });
}

// --- Content Loading and Routing ---
function loadContent(page) {
    if (!mainContent) mainContent = document.getElementById('main-content');
    if (!dashboardSection) dashboardSection = document.getElementById('dashboard-section');
    if (!loginSection) loginSection = document.getElementById('login-section');

    if (page !== 'login' && loginSection) {
        loginSection.classList.add('hidden');
        loginSection.innerHTML = '';
    }
    if (mainContent) mainContent.classList.remove('hidden');

    let templateId = '';
    let targetElement = dashboardSection;

    switch (page) {
        case 'dashboard':
            templateId = 'dashboard-template';
            if (targetElement && injectTemplate(templateId, targetElement)) {
                populateDashboardKpis(sampleKpis);
                populateMarcasRecientes(sampleMarcasRecientes);
                populateBeneficiosPorVencer(sampleBeneficiosPorVencer);
                populateAlertasImportantes(sampleAlertas);
                populateSugerenciasIA(sampleSugerenciasIA);
                
                // Attach listener for "Registrar Nueva Marca" button
                const registrarMarcaButton = document.querySelector('.panel button.bg-blue-500');
                if (registrarMarcaButton) {
                    registrarMarcaButton.onclick = () => window.location.hash = '#alta-marca';
                }
                // Attach listener for "Gestionar Beneficio (Test)" button
                 const gestionarBeneficioButton = document.querySelector('.panel button.bg-green-500');
                 if(gestionarBeneficioButton) {
                    gestionarBeneficioButton.onclick = () => window.location.hash = '#gestion-beneficio';
                 }
            }
            break;
        case 'alta-marca':
            templateId = 'alta-marca-template';
            if (targetElement && injectTemplate(templateId, targetElement)) {
                setupAltaMarcaFormListeners();
            }
            break;
        case 'gestion-beneficio':
            templateId = 'gestion-beneficio-template';
            if (targetElement && injectTemplate(templateId, targetElement)) {
                populateRecomendacionesGestionIA(sampleRecomendacionesGestion);
                const btnSimulacion = document.getElementById('btn-ejecutar-simulacion');
                const resultadoSimulacionDiv = document.getElementById('simulacion-ia-resultado');
                if (btnSimulacion && resultadoSimulacionDiv) {
                    btnSimulacion.addEventListener('click', () => {
                        resultadoSimulacionDiv.textContent = "Simulación IA: Extender a fines de semana podría incrementar canjes en un 12% (+/- 3%). Costo estimado: $1500.";
                        resultadoSimulacionDiv.classList.remove('hidden');
                    });
                }
            }
            break;
        case 'login':
            if (loginSection) {
                loginSection.classList.remove('hidden');
                if (mainContent) mainContent.classList.add('hidden');
                injectTemplate('login-template', loginSection);
                loginForm = document.getElementById('login-form');
                emailInput = document.getElementById('email-address');
                attachLoginFormListener();
            }
            break;
        default:
            console.warn(`Unknown page: ${page}. Loading dashboard.`);
            window.location.hash = '#dashboard';
            break;
    }
}

function router() {
    const hash = window.location.hash.substring(1) || (isLoggedIn ? 'dashboard' : 'login');
    if (!isLoggedIn && hash !== 'login') {
        window.location.hash = '#login';
        loadContent('login');
    } else if (isLoggedIn && hash === 'login') {
        window.location.hash = '#dashboard';
        loadContent('dashboard');
    } else {
        loadContent(hash);
    }
}

document.addEventListener('click', function(event) {
    if (logoutDropdown && !logoutDropdown.classList.contains('hidden')) {
        if (userMenu && !userMenu.contains(event.target) && !logoutDropdown.contains(event.target)) {
            logoutDropdown.classList.add('hidden');
        }
    }
});

document.addEventListener('DOMContentLoaded', () => {
    userMenu = document.getElementById('user-menu');
    userMenuText = document.getElementById('user-menu-text');
    logoutDropdown = document.getElementById('logout-dropdown');
    logoutButton = document.getElementById('logout-button');
    loginSection = document.getElementById('login-section');
    dashboardSection = document.getElementById('dashboard-section');
    mainContent = document.getElementById('main-content');

    router();
    window.addEventListener('hashchange', router);
    attachUserMenuListeners();

    if (!isLoggedIn) {
        showUserLoggedOutUI(); 
    }
});

console.log("script.js loaded with dynamic data simulation and mock IA features.");
