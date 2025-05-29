// Global state variables
let currentLoggedInUser = '';
let isLoggedIn = false;
let brandToEdit = null; // Variable to store brand being edited

// LocalStorage Keys
const MARCAS_STORAGE_KEY = 'mi365_marcas';
const THEME_STORAGE_KEY = 'mi365_theme';

// DOM Elements Cache
let userMenu, userMenuButton, userMenuText, logoutDropdown, logoutButton;
let loginSection, appContentSection, mainContent, mainNavigation;
let themeToggleButton, themeToggleSunIcon, themeToggleMoonIcon; // Theme toggle elements

// --- Sample Data (Se mantienen los datos de ejemplo) ---
const sampleKpis = { beneficiosActivos: 22, acuerdosVigentes: 18, marcasAsignadas: 10, alertasCriticas: 2, tareasPendientes: 5 };

let sampleMarcas = [
    { id: 1, nombre: "SuperTienda Online", cuit: "30-11223344-5", domicilioLegal: "Av. Siempreviva 742", codigoPostal: "B1675", contactoNombre: "Lisa Simpson", contactoEmail: "lisa@example.com", estado: "Activa", estadoColor: "green" },
    { id: 2, nombre: "GastroBar Delicias", cuit: "30-55667788-9", domicilioLegal: "Calle Falsa 123", codigoPostal: "C1000", contactoNombre: "Bart Simpson", contactoEmail: "bart@example.com", estado: "Pendiente", estadoColor: "yellow" },
    { id: 3, nombre: "TecnoSoluciones SRL", cuit: "30-99001122-3", domicilioLegal: "Otra Calle 456", codigoPostal: "X5000", contactoNombre: "Homero Simpson", contactoEmail: "homero@example.com", estado: "Activa", estadoColor: "green" },
    { id: 4, nombre: "Moda Urbana", cuit: "30-12341234-0", domicilioLegal: "Boulevard de los Sueños Rotos 789", codigoPostal: "Z9999", contactoNombre: "Marge Simpson", contactoEmail: "marge@example.com", estado: "Inactiva", estadoColor: "red" },
];

const sampleBeneficios = [
    { id: 101, nombre: "30% Off Almuerzos", marca: "GastroBar Delicias", tipo: "Descuento %", estado: "Activo" },
    { id: 102, nombre: "Envío Gratis > $5K", marca: "SuperTienda Online", tipo: "Condicional", estado: "Activo" },
    { id: 103, nombre: "2x1 CineMartes", marca: "Cines Metropolis", tipo: "2x1", estado: "Programado" }, // Note: "Cines Metropolis" is not in sampleMarcas
    { id: 104, nombre: "Liquidación Invierno", marca: "Moda Urbana", tipo: "Descuento %", estado: "Inactivo" },
    { id: 105, nombre: "Otro Beneficio SuperTienda", marca: "SuperTienda Online", tipo: "Descuento %", estado: "Activo"}
];
const sampleAlertas = [
    { texto: "Acuerdo 'Promo Verano Flash' vence mañana.", tipo: "critical", icon: "🚨" },
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

// --- LocalStorage Functions ---
function saveMarcasToLocalStorage() {
    localStorage.setItem(MARCAS_STORAGE_KEY, JSON.stringify(sampleMarcas));
}

function loadMarcasFromLocalStorage() {
    const storedMarcas = localStorage.getItem(MARCAS_STORAGE_KEY);
    if (storedMarcas) {
        try {
            const parsedMarcas = JSON.parse(storedMarcas);
            if (Array.isArray(parsedMarcas)) {
                sampleMarcas = parsedMarcas.map(marca => ({
                    id: marca.id || Date.now(),
                    nombre: marca.nombre || "",
                    cuit: marca.cuit || "",
                    domicilioLegal: marca.domicilioLegal || "",
                    codigoPostal: marca.codigoPostal || "",
                    contactoNombre: marca.contactoNombre || "",
                    contactoEmail: marca.contactoEmail || "",
                    estado: marca.estado || "Pendiente",
                    estadoColor: marca.estadoColor || "yellow"
                }));
            }
        } catch (error) {
            console.error("Error parsing marcas from localStorage:", error);
        }
    }
}

// --- Theme Management ---
function applyTheme(theme) {
    if (theme === 'light') {
        document.body.classList.add('light-mode');
        if (themeToggleSunIcon) themeToggleSunIcon.classList.remove('hidden');
        if (themeToggleMoonIcon) themeToggleMoonIcon.classList.add('hidden');
    } else { 
        document.body.classList.remove('light-mode');
        if (themeToggleSunIcon) themeToggleSunIcon.classList.add('hidden');
        if (themeToggleMoonIcon) themeToggleMoonIcon.classList.remove('hidden');
    }
    localStorage.setItem(THEME_STORAGE_KEY, theme);
}

function initializeTheme() {
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    let currentTheme = storedTheme || (systemPrefersDark ? 'dark' : 'dark'); // Default to dark
    applyTheme(currentTheme);
}

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
// ... (createAlertListItem remains unchanged)
function createAlertListItem(alerta) {
    const li = document.createElement('li');
    let bgColor = 'bg-sky-500/10'; 
    let textColor = 'text-sky-300'; 
    let borderColor = 'border-sky-500';

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
    tbody.innerHTML = '';
    marcas.slice(0, 4).forEach(marca => { 
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
        const benefitCount = sampleBeneficios.filter(beneficio => beneficio.marca === marca.nombre).length;
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="compact-table">${marca.nombre}</td>
            <td class="compact-table">${marca.cuit}</td>
            <td class="compact-table text-center">${benefitCount}</td>
            <td class="compact-table"><span class="px-2 py-0.5 text-xxs font-semibold rounded-full bg-${marca.estadoColor}-500/20 text-${marca.estadoColor}-400">${marca.estado}</span></td>
            <td class="compact-table text-center">
                {/* <!-- TODO: 'Ver' button could navigate to a brand detail page showing benefits --> */}
                <button class="text-[var(--color-accent-primary)] hover:text-[var(--color-accent-primary-hover)] text-xs">Ver</button>
                <button class="text-[var(--color-accent-primary)] hover:text-[var(--color-accent-primary-hover)] text-xs ml-2" onclick="window.location.hash='#alta-marca?id=${marca.id}'">Editar</button>
            </td>`;
        tbody.appendChild(tr);
    });
}
// ... (rest of populate functions remain largely unchanged) ...
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
// ... (updateNavbarUI, handleLoginSuccess, handleLogout remain unchanged)
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
// ... (attachLoginFormListener, attachUserMenuListeners remain unchanged)
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

    const titleElement = form.querySelector('h2');
    const nombreComercialInput = form.querySelector('#nombre-comercial');
    const nombreComercialError = form.querySelector('#nombre-comercial-error');
    const cuitInput = form.querySelector('#cuit');
    const cuitError = form.querySelector('#cuit-error');
    const domicilioLegalInput = form.querySelector('#domicilio-legal');
    const codigoPostalInput = form.querySelector('#codigo-postal');
    const contactoNombreInput = form.querySelector('#contacto-nombre');
    const contactoNombreError = form.querySelector('#contacto-nombre-error');
    const contactoEmailInput = form.querySelector('#contacto-email');
    const contactoEmailError = form.querySelector('#contacto-email-error');

    const submitButton = form.querySelector('#alta-marca-submit-button');
    const successMessageDiv = form.querySelector('#form-success-message'); 
    let existingHiddenIdInput = form.querySelector('#edit-brand-id');

    const clearError = (errorElement) => {
        if (errorElement) errorElement.textContent = '';
    };

    if (nombreComercialInput && nombreComercialError) nombreComercialInput.addEventListener('input', () => clearError(nombreComercialError));
    if (cuitInput && cuitError) cuitInput.addEventListener('input', () => clearError(cuitError));
    if (contactoNombreInput && contactoNombreError) contactoNombreInput.addEventListener('input', () => clearError(contactoNombreError));
    if (contactoEmailInput && contactoEmailError) contactoEmailInput.addEventListener('input', () => clearError(contactoEmailError));

    if (brandToEdit) {
        if (titleElement) titleElement.textContent = `Editar Marca: ${brandToEdit.nombre}`;
        if (nombreComercialInput) nombreComercialInput.value = brandToEdit.nombre;
        if (cuitInput) cuitInput.value = brandToEdit.cuit;
        if (domicilioLegalInput) domicilioLegalInput.value = brandToEdit.domicilioLegal || '';
        if (codigoPostalInput) codigoPostalInput.value = brandToEdit.codigoPostal || '';
        if (contactoNombreInput) contactoNombreInput.value = brandToEdit.contactoNombre || '';
        if (contactoEmailInput) contactoEmailInput.value = brandToEdit.contactoEmail || '';

        if (!existingHiddenIdInput) {
            existingHiddenIdInput = document.createElement('input');
            existingHiddenIdInput.type = 'hidden';
            existingHiddenIdInput.id = 'edit-brand-id';
            existingHiddenIdInput.name = 'editBrandId';
            form.appendChild(existingHiddenIdInput);
        }
        existingHiddenIdInput.value = brandToEdit.id;
    } else {
        if (titleElement) titleElement.textContent = 'Registrar Nueva Marca';
        if (nombreComercialInput) nombreComercialInput.value = '';
        if (cuitInput) cuitInput.value = '';
        if (domicilioLegalInput) domicilioLegalInput.value = '';
        if (codigoPostalInput) codigoPostalInput.value = '';
        if (contactoNombreInput) contactoNombreInput.value = '';
        if (contactoEmailInput) contactoEmailInput.value = '';
        if (existingHiddenIdInput) existingHiddenIdInput.remove();
    }

    form.addEventListener('submit', function(event) {
        event.preventDefault();
        let isValid = true;

        if (nombreComercialError) nombreComercialError.textContent = '';
        if (cuitError) cuitError.textContent = '';
        if (contactoNombreError) contactoNombreError.textContent = '';
        if (contactoEmailError) contactoEmailError.textContent = '';
        if (successMessageDiv) successMessageDiv.classList.add('hidden');

        if (nombreComercialInput && !nombreComercialInput.value.trim()) {
            if (nombreComercialError) nombreComercialError.textContent = 'El nombre comercial es obligatorio.';
            isValid = false;
        }
        const cuitValue = cuitInput ? cuitInput.value.trim() : '';
        const cuitRegex = /^(\d{11}|\d{2}-\d{8}-\d{1})$/;
        if (cuitInput && !cuitValue) {
            if (cuitError) cuitError.textContent = 'El CUIT es obligatorio.';
            isValid = false;
        } else if (cuitInput && !cuitRegex.test(cuitValue)) {
            if (cuitError) cuitError.textContent = 'Formato de CUIT inválido. Use XXXXXXXXXXX o XX-XXXXXXXX-X.';
            isValid = false;
        }
        if (contactoNombreInput && !contactoNombreInput.value.trim()) {
            if (contactoNombreError) contactoNombreError.textContent = 'El nombre de contacto es obligatorio.';
            isValid = false;
        }
        const emailValue = contactoEmailInput ? contactoEmailInput.value.trim() : '';
        const emailRegex = /^\S+@\S+\.\S+$/;
        if (contactoEmailInput && !emailValue) {
            if (contactoEmailError) contactoEmailError.textContent = 'El email de contacto es obligatorio.';
            isValid = false;
        } else if (contactoEmailInput && !emailRegex.test(emailValue)) {
            if (contactoEmailError) contactoEmailError.textContent = 'Formato de email inválido.';
            isValid = false;
        }

        if (!isValid) {
            showToast('Por favor, corrija los errores en el formulario.', 'error');
            return; 
        }

        const hiddenIdInput = form.querySelector('#edit-brand-id');
        const isEditMode = hiddenIdInput && hiddenIdInput.value;
        
        const marcaData = {
            nombre: nombreComercialInput.value.trim(),
            cuit: cuitInput.value.trim(),
            domicilioLegal: domicilioLegalInput.value.trim(),
            codigoPostal: codigoPostalInput.value.trim(),
            contactoNombre: contactoNombreInput.value.trim(),
            contactoEmail: contactoEmailInput.value.trim(),
        };

        if (isEditMode) {
            const idToUpdate = parseInt(hiddenIdInput.value, 10);
            const brandIndex = sampleMarcas.findIndex(m => m.id === idToUpdate);
            if (brandIndex !== -1) {
                sampleMarcas[brandIndex] = { 
                    ...sampleMarcas[brandIndex], 
                    ...marcaData, 
                    id: idToUpdate 
                };
            }
        } else {
            marcaData.id = Date.now(); 
            marcaData.estado = "Pendiente"; 
            marcaData.estadoColor = "yellow"; 
            sampleMarcas.push(marcaData);
        }
        
        saveMarcasToLocalStorage();
        showToast(isEditMode ? 'Marca actualizada exitosamente!' : 'Marca guardada exitosamente!', 'success');
        
        if (submitButton) {
            submitButton.textContent = 'Guardando...';
            submitButton.disabled = true;
        }
        
        setTimeout(() => {
            brandToEdit = null; 
            if (window.location.hash.startsWith('#alta-marca')) window.location.hash = '#gestion-marcas';
        }, 1500);
    });
}

// ... (setupCambiarContrasenaFormListeners, handleGenerarDescripcionIA remain unchanged) ...
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

    if (!nombreBeneficioInput || !tipoBeneficioSelect || !valorBeneficioInput || !descripcionBeneficioTextarea || !spinner || !sugerenciasContainer) {
        console.error("Faltan elementos del DOM para la generación IA.");
        showToast("Error: Faltan elementos en la página para la IA.", 'error');
        return;
    }

    const nombre = nombreBeneficioInput.value;
    const tipo = tipoBeneficioSelect.value;
    const valor = valorBeneficioInput.value;
    const marcaAsociadaSelect = document.getElementById('gb-marca-asociada');
    const marca = marcaAsociadaSelect && marcaAsociadaSelect.value ? marcaAsociadaSelect.options[marcaAsociadaSelect.selectedIndex].text : "una marca asociada";

    if (!nombre.trim()) {
        showToast("Por favor, ingrese el nombre del beneficio.", 'error');
        return;
    }

    spinner.classList.remove('hidden');
    descripcionBeneficioTextarea.disabled = true;
    sugerenciasContainer.innerHTML = ''; 

    setTimeout(() => {
        try {
            const mockApiResponse = {
                candidates: [
                    {
                        content: {
                            parts: [
                                {
                                    text: `1. ¡Disfrutá de un ${nombre} con ${marca}! ${tipo} de ${valor} para vos.\n2. ${marca} te trae un ${nombre} imperdible. ¡Aprovechá este ${tipo} de ${valor}!\n3. Tu ${nombre} soñado está en ${marca}. Un ${tipo} de ${valor} que no podés dejar pasar.`
                                }
                            ]
                        }
                    }
                ]
            };

            if (mockApiResponse.candidates && mockApiResponse.candidates.length > 0 && mockApiResponse.candidates[0].content && mockApiResponse.candidates[0].content.parts && mockApiResponse.candidates[0].content.parts.length > 0) {
                const text = mockApiResponse.candidates[0].content.parts[0].text;
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
                showToast('Descripciones generadas!', 'success');
            } else {
                throw new Error("No se pudo obtener una descripción de la IA simulada. Formato de respuesta inesperado.");
            }
        } catch (error) {
            console.error("Error al generar descripción con IA (simulada):", error);
            showToast(`Error al generar (simulado): ${error.message}. Intenta de nuevo.`, 'error');
        } finally {
            spinner.classList.add('hidden');
            descripcionBeneficioTextarea.disabled = false;
        }
    }, 1500); 
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

    if (page !== 'alta-marca' || !window.location.hash.includes('?id=')) {
        brandToEdit = null;
    }

    switch (page) {
        case 'dashboard': templateId = 'dashboard-template'; break;
        case 'alta-marca':
            templateId = 'alta-marca-template';
            const urlParamsAltaMarca = new URLSearchParams(window.location.hash.split('?')[1]);
            const brandId = urlParamsAltaMarca.get('id');
            if (brandId) {
                const idToFind = parseInt(brandId, 10);
                brandToEdit = sampleMarcas.find(marca => marca.id === idToFind) || null;
            } else {
                brandToEdit = null; 
            }
            break;
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
            const beneficioExistente = beneficioId ? sampleBeneficios.find(b => b.id == beneficioId) : null;
            const marcaPreseleccionada = beneficioExistente ? beneficioExistente.marca : null;

            const titleElement = document.getElementById('gestion-beneficio-title');
            const form = document.getElementById('gestion-beneficio-form');
            const marcaSelect = document.getElementById('gb-marca-asociada');

            if (marcaSelect) {
                marcaSelect.innerHTML = ''; // Clear existing options
                const defaultOption = document.createElement('option');
                defaultOption.value = "";
                defaultOption.textContent = "Seleccionar marca...";
                defaultOption.disabled = true;
                marcaSelect.appendChild(defaultOption);

                sampleMarcas.forEach(marca => {
                    const option = document.createElement('option');
                    option.value = marca.nombre; // Using nombre as value to match existing logic
                    option.textContent = marca.nombre;
                    if (marcaPreseleccionada === marca.nombre) {
                        option.selected = true;
                    }
                    marcaSelect.appendChild(option);
                });
                if (!marcaPreseleccionada) { // If new or no matching brand
                     marcaSelect.value = "";
                }
            }

            if (beneficioId && beneficioExistente) { 
                if(titleElement) titleElement.textContent = `Editar Beneficio ID: ${beneficioId}`;
                if(form) {
                    form.elements['gb-nombre-beneficio'].value = beneficioExistente.nombre;
                    form.elements['gb-tipo-beneficio'].value = beneficioExistente.tipo; 
                    // Marca is handled by the dynamic population above
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
            const searchInputMarcas = document.getElementById('search-marcas-input');
            if (searchInputMarcas) {
                searchInputMarcas.addEventListener('input', function(event) {
                    const searchTerm = event.target.value.toLowerCase();
                    if (!searchTerm) {
                        populateTablaGestionMarcas(sampleMarcas);
                    } else {
                        const filteredMarcas = sampleMarcas.filter(marca => {
                            return (marca.nombre && marca.nombre.toLowerCase().includes(searchTerm)) ||
                                   (marca.cuit && marca.cuit.toLowerCase().includes(searchTerm));
                        });
                        populateTablaGestionMarcas(filteredMarcas);
                    }
                });
            }
        } else if (page === 'gestion-beneficios') {
            populateTablaGestionBeneficios(sampleBeneficios);
        }
    }
    
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
    
    themeToggleButton = document.getElementById('theme-toggle-button');
    themeToggleSunIcon = document.getElementById('theme-toggle-sun-icon');
    themeToggleMoonIcon = document.getElementById('theme-toggle-moon-icon');

    if (!mainContent || !loginSection || !appContentSection || !userMenu || !mainNavigation ) {
        console.error("Faltan elementos críticos del layout. La aplicación podría no funcionar correctamente.");
        document.body.innerHTML = "<p style='text-align:center; padding-top: 50px; font-size: 18px;'>Error: Faltan componentes de la aplicación.</p>";
        return; 
    }
    if (!themeToggleButton || !themeToggleSunIcon || !themeToggleMoonIcon) {
        console.error("Elementos del toggle de tema no encontrados. El toggle de tema podría no funcionar.");
    }
    
    loadMarcasFromLocalStorage(); 
    initializeTheme(); 
    updateNavbarUI();
    attachUserMenuListeners();

    if (themeToggleButton) {
        themeToggleButton.addEventListener('click', () => {
            if (document.body.classList.contains('light-mode')) {
                applyTheme('dark');
            } else {
                applyTheme('light');
            }
        });
    }
    
    document.addEventListener('click', (event) => {
        if (userMenu && !userMenu.contains(event.target) && logoutDropdown && !logoutDropdown.classList.contains('hidden')) {
            logoutDropdown.classList.add('hidden');
        }
    });

    window.addEventListener('hashchange', router);
    router(); 
});

function showToast(message, type = 'info', duration = 3000) {
    const container = document.getElementById('toast-container');
    if (!container) {
        console.error('Toast container not found! Make sure <div id="toast-container" class="fixed top-4 right-4 z-[100] space-y-2"></div> is in index.html');
        return;
    }

    const toast = document.createElement('div');
    toast.className = `toast-message toast-${type}`;
    toast.textContent = message;

    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('fade-out'); 
        toast.addEventListener('transitionend', () => {
            if(toast.parentNode) toast.remove();
        });
        setTimeout(() => {
             if(toast.parentNode) toast.remove();
        }, 500); 
    }, duration);
}
