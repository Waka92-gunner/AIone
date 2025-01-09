// Importar Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDDEPuWMURqeE0Aa7plFWY069l_fdtyFsk",
  authDomain: "ai-one-323ed.firebaseapp.com",
  projectId: "ai-one-323ed",
  storageBucket: "ai-one-323ed.firebasestorage.app",
  messagingSenderId: "673839138559",
  appId: "1:673839138559:web:e9fd7d394dcb05bc8a2eca"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Variables globales
let currentFilter = "all"; // Controla el filtro actual de tareas

// Función de autenticación
const registerUser = async (email, password) => {
  try {
    await createUserWithEmailAndPassword(auth, email, password);
    alert("Usuario registrado exitosamente.");
  } catch (error) {
    alert("Error en registro: " + error.message);
  }
};

const loginUser = async (email, password) => {
  try {
    await signInWithEmailAndPassword(auth, email, password);
    alert("Inicio de sesión exitoso.");
  } catch (error) {
    alert("Error al iniciar sesión: " + error.message);
  }
};

// Manejar autenticación
onAuthStateChanged(auth, (user) => {
  const authSection = document.getElementById("auth-section");
  const tasksSection = document.getElementById("tasks-section");

  if (user) {
    authSection.style.display = "none";
    tasksSection.style.display = "block";
    loadTasks();
  } else {
    authSection.style.display = "block";
    tasksSection.style.display = "none";
  }
});

// Función para cargar tareas
const loadTasks = async () => {
  const taskList = document.getElementById("task-list");
  taskList.innerHTML = ""; // Limpiar lista
  try {
    const querySnapshot = await getDocs(collection(db, "tasks"));
    querySnapshot.forEach((doc) => {
      const { task, completed } = doc.data();

      if (
        (currentFilter === "completed" && !completed) ||
        (currentFilter === "pending" && completed)
      ) return;

      const taskItem = document.createElement("div");
      taskItem.classList.add("task-item");
      if (completed) taskItem.classList.add("completed");

      taskItem.innerHTML = `
        <p>${task}</p>
        <button onclick="toggleComplete('${doc.id}', ${completed})">
          ${completed ? "Desmarcar" : "Completar"}
        </button>
        <button onclick="editTask('${doc.id}', '${task}')">Editar</button>
        <button onclick="deleteTask('${doc.id}')">Eliminar</button>
      `;
      taskList.appendChild(taskItem);
    });
    updateProgressBar(); // Actualizar progreso después de cargar tareas
  } catch (e) {
    alert("Error al cargar tareas: " + e.message);
  }
};

// Funciones CRUD de tareas
const addTask = async (task) => {
  try {
    await addDoc(collection(db, "tasks"), {
      task,
      completed: false,
      timestamp: new Date(),
    });
    alert("Tarea añadida.");
    loadTasks();
  } catch (e) {
    alert("Error al añadir tarea: " + e.message);
  }
};

const editTask = async (taskId, currentTask) => {
  const newTask = prompt("Editar tarea:", currentTask);
  if (newTask && newTask.trim() !== "") {
    try {
      await updateDoc(doc(db, "tasks", taskId), { task: newTask });
      loadTasks();
    } catch (e) {
      alert("Error al editar tarea: " + e.message);
    }
  }
};

const deleteTask = async (taskId) => {
  if (confirm("¿Seguro que deseas eliminar esta tarea?")) {
    try {
      await deleteDoc(doc(db, "tasks", taskId));
      loadTasks();
    } catch (e) {
      alert("Error al eliminar tarea: " + e.message);
    }
  }
};

const toggleComplete = async (taskId, currentStatus) => {
  try {
    await updateDoc(doc(db, "tasks", taskId), { completed: !currentStatus });
    loadTasks();
  } catch (e) {
    alert("Error al actualizar tarea: " + e.message);
  }
};
window.toggleComplete = toggleComplete;
window.editTask = editTask;
window.deleteTask = deleteTask;

// Barra de progreso
const updateProgressBar = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "tasks"));
    const tasks = querySnapshot.docs.map((doc) => doc.data());
    const completedCount = tasks.filter((t) => t.completed).length;
    const percentage = tasks.length ? (completedCount / tasks.length) * 100 : 0;

    document.getElementById("progress-bar").value = percentage;
    document.getElementById("progress-text").textContent = `${Math.round(percentage)}% completado`;
  } catch (e) {
    alert("Error al actualizar la barra de progreso: " + e.message);
  }
};

// Formularios de autenticación
document.getElementById("register-form-element").addEventListener("submit", (e) => {
  e.preventDefault();
  const email = document.getElementById("register-email").value.trim();
  const password = document.getElementById("register-password").value.trim();
  if (email && password.length >= 6) {
    registerUser(email, password);
  } else {
    alert("Datos inválidos.");
  }
});

document.getElementById("login-form-element").addEventListener("submit", (e) => {
  e.preventDefault();
  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value.trim();
  if (email && password) {
    loginUser(email, password);
  } else {
    alert("Credenciales inválidas.");
  }
});

// Filtros de tareas
document.getElementById("filter-all").addEventListener("click", () => {
  currentFilter = "all";
  loadTasks();
});

document.getElementById("filter-completed").addEventListener("click", () => {
  currentFilter = "completed";
  loadTasks();
});

document.getElementById("filter-pending").addEventListener("click", () => {
  currentFilter = "pending";
  loadTasks();
});

// Logout
document.getElementById("logout-btn").addEventListener("click", () => auth.signOut());

// Mostrar el formulario de registro
document.getElementById("show-register").addEventListener("click", (e) => {
  e.preventDefault(); // Evitar navegación por defecto del enlace
  document.getElementById("register-form-element").style.display = "block"; // Mostrar registro
  document.getElementById("login-form-element").style.display = "none"; // Ocultar login
});

// Mostrar el formulario de login
document.getElementById("show-login").addEventListener("click", (e) => {
  e.preventDefault(); // Evitar navegación por defecto del enlace
  document.getElementById("login-form-element").style.display = "block"; // Mostrar login
  document.getElementById("register-form-element").style.display = "none"; // Ocultar registro
});

document.getElementById("register-form-element").addEventListener("submit", (e) => {
  e.preventDefault(); // Evitar que el formulario recargue la página
  const email = document.getElementById("register-email").value.trim();
  const password = document.getElementById("register-password").value.trim();
  if (email && password.length >= 6) {
    registerUser(email, password); // Llama a la función de registro
  } else {
    alert("Datos inválidos. La contraseña debe tener al menos 6 caracteres.");
  }
});

