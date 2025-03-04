// Importar Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, updateDoc, query, where } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

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

let currentFilter = "all"; // Filtro actual

// Manejo de autenticación
onAuthStateChanged(auth, async (user) => {
  const authSection = document.getElementById("auth-section");
  const tasksSection = document.getElementById("tasks-section");
  
  if (user) {
    authSection.style.display = "none";
    tasksSection.style.display = "block";
    await loadTasks();
  } else {
    authSection.style.display = "block";
    tasksSection.style.display = "none";
  }
});

// Registrar usuario
const registerUser = async (email, password) => {
  try {
    await createUserWithEmailAndPassword(auth, email, password);
    alert("Usuario registrado exitosamente.");
  } catch (error) {
    alert("Error en registro: " + error.message);
  }
};

// Iniciar sesión
const loginUser = async (email, password) => {
  try {
    await signInWithEmailAndPassword(auth, email, password);
    alert("Inicio de sesión exitoso.");
  } catch (error) {
    alert("Error al iniciar sesión: " + error.message);
  }
};

// Cargar tareas
const loadTasks = async () => {
  if (!auth.currentUser) return;
  const taskList = document.getElementById("task-list");
  taskList.innerHTML = "";

  try {
    const q = query(collection(db, "tasks"), where("userId", "==", auth.currentUser.uid));
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((doc) => {
      const { task, completed } = doc.data();
      if ((currentFilter === "completed" && !completed) || (currentFilter === "pending" && completed)) return;

      const taskItem = document.createElement("div");
      taskItem.classList.add("task-item");
      if (completed) taskItem.classList.add("completed");

      taskItem.innerHTML = `
        <p>${task}</p>
        <button onclick="toggleComplete('${doc.id}', ${completed})">${completed ? "Desmarcar" : "Completar"}</button>
        <button onclick="editTask('${doc.id}', '${task}')">Editar</button>
        <button onclick="deleteTask('${doc.id}')">Eliminar</button>
      `;
      taskList.appendChild(taskItem);
    });
    updateProgressBar();
  } catch (e) {
    alert("Error al cargar tareas: " + e.message);
  }
};

// Agregar tarea
const addTask = async () => {
  const taskInput = document.getElementById("task-input").value.trim();
  if (!taskInput) return alert("Ingresa una tarea válida.");
  try {
    await addDoc(collection(db, "tasks"), {
      task: taskInput,
      completed: false,
      userId: auth.currentUser.uid,
      timestamp: new Date(),
    });
    document.getElementById("task-input").value = "";
    loadTasks();
  } catch (e) {
    alert("Error al añadir tarea: " + e.message);
  }
};

// Editar tarea
const editTask = async (taskId, currentTask) => {
  const newTask = prompt("Editar tarea:", currentTask);
  if (!newTask || newTask.trim() === "") return;
  try {
    await updateDoc(doc(db, "tasks", taskId), { task: newTask });
    loadTasks();
  } catch (e) {
    alert("Error al editar tarea: " + e.message);
  }
};

// Eliminar tarea
const deleteTask = async (taskId) => {
  if (!confirm("¿Seguro que deseas eliminar esta tarea?")) return;
  try {
    await deleteDoc(doc(db, "tasks", taskId));
    loadTasks();
  } catch (e) {
    alert("Error al eliminar tarea: " + e.message);
  }
};

// Completar tarea
const toggleComplete = async (taskId, currentStatus) => {
  try {
    await updateDoc(doc(db, "tasks", taskId), { completed: !currentStatus });
    loadTasks();
  } catch (e) {
    alert("Error al actualizar tarea: " + e.message);
  }
};

// Barra de progreso
const updateProgressBar = async () => {
  if (!auth.currentUser) return;
  try {
    const q = query(collection(db, "tasks"), where("userId", "==", auth.currentUser.uid));
    const querySnapshot = await getDocs(q);
    const tasks = querySnapshot.docs.map((doc) => doc.data());
    const completedCount = tasks.filter((t) => t.completed).length;
    const percentage = tasks.length ? (completedCount / tasks.length) * 100 : 0;
    document.getElementById("progress-bar").value = percentage;
    document.getElementById("progress-text").textContent = `${Math.round(percentage)}% completado`;
  } catch (e) {
    alert("Error al actualizar la barra de progreso: " + e.message);
  }
};

// Eventos de formularios
document.getElementById("register-form-element").addEventListener("submit", (e) => {
  e.preventDefault();
  registerUser(document.getElementById("register-email").value.trim(), document.getElementById("register-password").value.trim());
});

document.getElementById("login-form-element").addEventListener("submit", (e) => {
  e.preventDefault();
  loginUser(document.getElementById("login-email").value.trim(), document.getElementById("login-password").value.trim());
});

// Logout
document.querySelectorAll("#logout-btn").forEach((btn) => {
  btn.addEventListener("click", () => signOut(auth));
});