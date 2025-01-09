
    // Importar Firebase SDK
    import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
    import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
    import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";
    import { updateDoc } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

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

    // Funciones para manejar la autenticación
    const registerUser = async (email, password) => {
      try {
        await createUserWithEmailAndPassword(auth, email, password);
        alert("Usuario registrado exitosamente");
      } catch (error) {
        alert(error.message);
      }
    };

    const loginUser = async (email, password) => {
      try {
        await signInWithEmailAndPassword(auth, email, password);
        alert("Inicio de sesión exitoso");
      } catch (error) {
        alert(error.message);
      }
    };

    onAuthStateChanged(auth, (user) => {
        const authSection = document.getElementById("auth-section");
        const taskSection = document.getElementById("task-section");
      
        if (user) {
          // Usuario autenticado
          authSection.style.display = "none"; // Ocultar sección de login
          taskSection.style.display = "block"; // Mostrar lista de tareas
          loadTasks();
        } else {
          // Usuario no autenticado
          authSection.style.display = "block"; // Mostrar sección de login
          taskSection.style.display = "none"; // Ocultar lista de tareas
        }
      });
      
      document.getElementById("logout-btn").addEventListener("click", () => {
        auth.signOut().then(() => {
          alert("Sesión cerrada.");
        }).catch((error) => {
          alert("Error al cerrar sesión: " + error.message);
        });
      });

    const addTask = async (task) => {
      try {
        await addDoc(collection(db, "tasks"), {
          task: task,
          timestamp: new Date(),
          completed: false // Nueva tarea siempre comienza como incompleta
        });
        alert("Tarea añadida con éxito");
        loadTasks();
      } catch (e) {
        alert("Error al añadir tarea: " + e.message);

      }
    };

    const toggleCompleteTask = async (taskId, currentStatus) => {
      try {
        const taskRef = doc(db, "tasks", taskId);
        await updateDoc(taskRef, {
          completed: !currentStatus
        });
        loadTasks();
      } catch (e) {
        alert("Error al actualizar tarea: " + e);
      }
    };

    // Exponer la función globalmente
    window.toggleComplete = toggleCompleteTask;


    // Función de carga de tareas
    const loadTasks = async () => {
      // Código existente
      await updateProgressBar();  // Llama aquí directamente después de cargar las tareas
      const taskList = document.getElementById("task-list"); // Mueve esta línea dentro de la función
      try {
        const querySnapshot = await getDocs(collection(db, "tasks"));
        taskList.innerHTML = ''; // Limpiar lista antes de cargar tareas
        querySnapshot.forEach((doc) => {
          const taskData = doc.data();
          const task = taskData.task;
          const completed = taskData.completed || false;

          if (
            (currentFilter === 'completed' && !completed) ||
            (currentFilter === 'pending' && completed)
          ) {
            return; // Saltar la tarea si no coincide con el filtro
          }

          const taskItem = document.createElement("div");
          taskItem.classList.add("task-item");
          if (completed) {
            taskItem.classList.add("completed");
          }

          taskItem.innerHTML = `
        <p>${task}</p>
        <button onclick="toggleComplete('${doc.id}', ${completed})">
          ${completed ? 'Desmarcar' : 'Completar'}
        </button>
        <button onclick="editTask('${doc.id}', '${task}')">Editar</button>
        <button onclick="deleteTask('${doc.id}')">Eliminar</button>
      `;
          taskList.appendChild(taskItem);
        });
      } catch (e) {
        alert("Error al cargar tareas: " + e);
      }
    };

    // Bloque de estados
    let currentFilter = 'all'; // Estado del filtro actual

    document.getElementById("filter-all").addEventListener("click", () => {
      currentFilter = 'all';
      loadTasks();
    });

    document.getElementById("filter-completed").addEventListener("click", () => {
      currentFilter = 'completed';
      loadTasks();
    });

    document.getElementById("filter-pending").addEventListener("click", () => {
      currentFilter = 'pending';
      loadTasks();
    });

    // Función para marcar/desmarcar como completada
    window.toggleComplete = async (taskId, completed) => {
      try {
        const taskRef = doc(db, "tasks", taskId);
        await updateDoc(taskRef, {
          completed: !completed,
        });
        loadTasks();
      } catch (e) {
        alert("Error al actualizar tarea: " + e);
      }
    };

    // Cargar las tareas cuando se cargue la página
    window.onload = () => {
      const taskList = document.getElementById("task-list");

      document.getElementById("filter-all").addEventListener("click", () => {
        currentFilter = 'all';
        loadTasks();
      });

      document.getElementById("filter-completed").addEventListener("click", () => {
        currentFilter = 'completed';
        loadTasks();
      });

      document.getElementById("filter-pending").addEventListener("click", () => {
        currentFilter = 'pending';
        loadTasks();
      });

      loadTasks();
    };

    // Eventos de formulario
    document.getElementById("register-form-element").addEventListener("submit", (e) => {
      e.preventDefault();
      const email = document.getElementById("register-email").value.trim();
      const password = document.getElementById("register-password").value.trim();

      if (email && password.length >= 6) {
        registerUser(email, password);
      } else {
        alert("Introduce un email válido y una contraseña de al menos 6 caracteres.");
      }
    });


    document.getElementById("login-form-element").addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = document.getElementById("login-email").value.trim();
        const password = document.getElementById("login-password").value.trim();
      
        if (!email || password.length < 6) {
          alert("Introduce un correo válido y una contraseña de al menos 6 caracteres.");
          return;
        }
      
        try {
          await signInWithEmailAndPassword(auth, email, password);
          alert(`¡Bienvenido, ${email}!`);
        } catch (error) {
          alert("Error al iniciar sesión: " + error.message);
        }
      });      

    document.getElementById("logout-btn").addEventListener("click", () => {
      auth.signOut();
    });

    document.getElementById("add-task-btn").addEventListener("click", () => {
      const task = prompt("Escribe la tarea");
      if (task) {
        addTask(task);
      }
    });

    const editTask = async (taskId, currentTask) => {
      const newTask = prompt("Editar tarea:", currentTask);
      if (newTask !== null && newTask.trim() !== '') {
        const taskRef = doc(db, "tasks", taskId);
        await updateDoc(taskRef, { task: newTask });
        loadTasks();
      }
    };
    window.editTask = editTask;

    const deleteTask = async (taskId) => {
      if (confirm("¿Seguro que deseas eliminar esta tarea?")) {
        await deleteDoc(doc(db, "tasks", taskId));
        loadTasks();
      }
    };
    window.deleteTask = deleteTask;

    const updateProgressBar = async () => {
      const querySnapshot = await getDocs(collection(db, "tasks"));
      let completedCount = 0;
      let totalCount = querySnapshot.size;

      querySnapshot.forEach(doc => {
        if (doc.data().completed) completedCount++;
      });

      let percentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
      document.getElementById("progress-bar").value = percentage;
      document.getElementById("progress-text").innerText = `${Math.round(percentage)}% completado`;
    };

    // Llama a esta función después de `loadTasks()`
    loadTasks().then(updateProgressBar);

    // Controlar la autenticación
onAuthStateChanged(auth, (user) => {
    const authSection = document.getElementById("auth-section");
    const tasksSection = document.getElementById("tasks-section");
  
    if (user) {
      // Usuario autenticado
      authSection.classList.remove("active");
      tasksSection.classList.add("active");
      loadTasks(); // Cargar lista de tareas
    } else {
      // Usuario no autenticado
      authSection.classList.add("active");
      tasksSection.classList.remove("active");
    }
  });
  
  // Manejar registro
  document.getElementById("register-form-element").addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("register-email").value.trim();
    const password = document.getElementById("register-password").value.trim();
  
    if (email && password.length >= 6) {
      registerUser(email, password);
    } else {
      alert("Introduce un email válido y una contraseña de al menos 6 caracteres.");
    }
  });
  
  // Manejar login
  document.getElementById("login-form-element").addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value.trim();
  
    if (email && password) {
      loginUser(email, password);
    } else {
      alert("Introduce tus credenciales correctamente.");
    }
  });
  
  // Manejar cambio entre formularios
  document.getElementById("show-register").addEventListener("click", (e) => {
    e.preventDefault();
    document.getElementById("login-form-element").style.display = "none";
    document.getElementById("register-form-element").style.display = "block";
  });
  
  document.getElementById("show-login").addEventListener("click", (e) => {
    e.preventDefault();
    document.getElementById("register-form-element").style.display = "none";
    document.getElementById("login-form-element").style.display = "block";
  });
  
  // Manejar logout
  document.getElementById("logout-btn").addEventListener("click", () => {
    auth.signOut();
  });
  