document.addEventListener("DOMContentLoaded", () => {
  const moviesContainer = document.getElementById("movies-container");
  const movieModal = new bootstrap.Modal(document.getElementById("movieModal"));
  const newMovieModal = new bootstrap.Modal(document.getElementById("newMovieModal"));
  const saveChangesBtn = document.getElementById("saveChangesBtn");
  const addMovieBtn = document.getElementById("addMovieBtn");

  let currentMovie;

  // Crear una tarjeta personalizada
  function createMovieCard(movie) {
    return `
      <div class="card-custom">
        <img src="${movie.Poster}" alt="${movie.Title}" class="card-custom-img cursor-pointer" data-id="${movie.imdbID}" onclick="window.location.href='html/movie-details.html?imdbID=${movie.imdbID}'">
        <div class="card-custom-body">
          <h5 class="card-custom-title">${movie.Title}</h5>
          <p class="card-custom-type"><strong>Tipo:</strong> ${movie.Type}</p>
          <p class="card-custom-year"><strong>Año:</strong> ${movie.Year}</p>
          <p class="card-custom-ubication"><strong>Ubicación:</strong> ${movie.Ubication}</p>
          <div class="d-flex justify-content-center gap-2">
            <button type="button" class="btn btn-outline-warning mt-3" data-id="${movie.imdbID}"> <i class="bi bi-pencil"></i> Editar</button>
            <button type="button" class="btn btn-outline-danger mt-3" data-id="${movie.imdbID}"><i class="bi bi-trash3"></i> Eliminar</button>
          </div>
        </div>
      </div>
    `;
  }

  // Abrir el modal con la información de la película
  function openMovieModal(movie) {
    document.getElementById("imdbID").value = movie.imdbID || "";
    document.getElementById("title").value = movie.Title || "";
    document.getElementById("year").value = movie.Year || "";
    document.getElementById("type").value = movie.Type || "";
    document.getElementById("poster").value = movie.Poster || "";
    document.getElementById("description").value = movie.description || "";
    document.getElementById("ubication").value = movie.Ubication || "";
    document.getElementById("estado").value = movie.Estado || "";

    currentMovie = movie;
    movieModal.show();
  }

  // Abrir el modal de nueva película
  function openNewMovieModal() {
    document.getElementById("newMovieForm").reset();
    newMovieModal.show();
  }

  // Obtener y mostrar las películas
  function fetchMovies() {
    fetch("https://movie.azurewebsites.net/api/cartelera?title=&ubication=")
      .then((response) => response.json())
      .then((data) => {
        moviesContainer.innerHTML = ""; // Limpiar el contenedor antes de insertar
        data.forEach((movie) => {
          moviesContainer.innerHTML += createMovieCard(movie);
        });

        // Añadir eventos a los botones de actualizar y eliminar
        attachEventListeners();
      })
      .catch((error) => console.error("Error al obtener las películas:", error));
  }

  // Adjuntar eventos a los botones
  function attachEventListeners() {
    // Botones de edición
    document.querySelectorAll('.btn-outline-warning').forEach((button) => {
      button.addEventListener("click", () => {
        const movieID = button.getAttribute("data-id");
        fetch(`https://movie.azurewebsites.net/api/cartelera?imdbID=${movieID}`)
          .then((response) => response.json())
          .then((movie) => {
            openMovieModal(movie);
          })
          .catch((error) => console.error("Error al obtener la película:", error));
      });
    });

    // Botones de eliminación
    document.querySelectorAll(".btn-outline-danger").forEach((button) => {
      button.addEventListener("click", () => {
        const movieID = button.getAttribute("data-id");
        Swal.fire({
          title: "¿Estás seguro?",
          text: "¡No podrás recuperar esta película!",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "Sí, eliminar",
          cancelButtonText: "Cancelar",
        }).then((result) => {
          if (result.isConfirmed) {
            fetch(`https://movie.azurewebsites.net/api/cartelera?imdbID=${movieID}`, {
              method: "DELETE",
            })
            .then((response) => {
              if (response.ok) {
                Swal.fire("Eliminado", "La película ha sido eliminada.", "success");
                fetchMovies(); // Volver a cargar las películas
              } else {
                Swal.fire("Error", "No se pudo eliminar la película.", "error");
              }
            })
            .catch((error) => console.error("Error al eliminar la película:", error));
          }
        });
      });
    });
  }

  // Guardar los cambios y hacer PUT
  saveChangesBtn.addEventListener("click", () => {
    const imdbID = document.getElementById("imdbID").value.trim();
    const updatedMovie = {
      imdbID: imdbID,
      Title: document.getElementById("title").value.trim(),
      Year: document.getElementById("year").value.trim(),
      Type: document.getElementById("type").value.trim(),
      Poster: document.getElementById("poster").value.trim(),
      Estado: document.getElementById("estado").value === "true",
      description: document.getElementById("description").value.trim(),
      Ubication: document.getElementById("ubication").value.trim(),
    };

    fetch(`https://movie.azurewebsites.net/api/cartelera?imdbID=${updatedMovie.imdbID}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedMovie),
    })
    .then((response) => {
      if (response.ok) {
        Swal.fire("Éxito", "Se actualizó la película correctamente", "success");
        movieModal.hide(); // Ocultar modal
        fetchMovies(); // Volver a cargar las películas para reflejar los cambios
      } else {
        return response.text().then((text) => {
          throw new Error(text);
        });
      }
    })
    .catch((error) => Swal.fire("Error", `No se pudo actualizar los datos: ${error.message}`, "error"));
  });

  // Agregar una nueva película
  addMovieBtn.addEventListener("click", () => {
    const newMovie = {
      imdbID: document.getElementById("newImdbID").value.trim(),
      Title: document.getElementById("newTitle").value.trim(),
      Year: document.getElementById("newYear").value.trim(),
      Type: document.getElementById("newType").value.trim(),
      Poster: document.getElementById("newPoster").value.trim(),
      Estado: document.getElementById("newEstado").value === "true",
      description: document.getElementById("newDescription").value.trim(),
      Ubication: document.getElementById("newUbication").value.trim(),
    };

    // Validación adicional para asegurarse de que los campos críticos no estén vacíos
    if (
      newMovie.imdbID === "" ||
      newMovie.Title === "" ||
      newMovie.Year === "" ||
      newMovie.Type === "" ||
      newMovie.Poster === ""
    ) {
      Swal.fire("Error", "Por favor, complete todos los campos requeridos.", "error");
      return;
    }

    fetch("https://movie.azurewebsites.net/api/cartelera", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newMovie),
    })
    .then((response) => {
      if (response.ok) {
        Swal.fire("Éxito", "Se agregó la película correctamente", "success");
        newMovieModal.hide(); // Ocultar modal
        fetchMovies(); // Volver a cargar las películas para reflejar los cambios
      } else {
        return response.text().then((text) => {
          throw new Error(text);
        });
      }
    })
    .catch((error) => Swal.fire("Error", `No se pudo agregar la película: ${error.message}`, "error"));
  });

  // Inicializar la carga de películas
  fetchMovies();
});
