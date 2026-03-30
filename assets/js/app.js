let titleControl = document.getElementById('title');
let imageControl = document.getElementById('image');
let descriptionControl = document.getElementById('description');
let ratingControl = document.getElementById('rating');
let movieContainer = document.getElementById('movieContainer');
let addMovie = document.getElementById('addMovie');
let backdrop = document.getElementById('backdrop');
let movieForm = document.getElementById('movieForm');
let addMovieBtn = document.getElementById('addMovieBtn');
let updateMovieBtn = document.getElementById('updateMovieBtn');
const closeBtn = document.getElementById('closeBtn');
let spinner = document.getElementById('spinner');

const BASE_URL = "https://moviesfetchfirebase-default-rtdb.firebaseio.com";

const MOVIE_URL = `${BASE_URL}/movies.json`;


function snackbar(text, icon, timer = 1200) {
    Swal.fire({
        text: text,
        icon: icon,
        timer: timer

    })
}


function showSpinner() {
    spinner.classList.remove('d-none');
}

function hideSpinner() {
    spinner.classList.add('d-none');
}

async function makeApiCall(api_url, method_name, msgbody = null) {

    showSpinner();

    try {
        let res = await fetch(api_url, {
            method: method_name,
            body: msgbody ? JSON.stringify(msgbody) : null,
            headers: {
                'Content-Type': 'application/json'
            }
        });

        let data = await res.json();

        if (!res.ok) {
            throw new Error(data.error || 'Something went wrong');
        }

        return data;

    } catch (err) {
        console.log(err);
    } finally {
        hideSpinner();
    }
}

function ontoggle() {
    backdrop.classList.toggle('d-none');
    movieForm.classList.toggle('d-none');

}

function CreateCards(arr) {
    let result = '';

    arr.forEach(movie => {
        result += `
        <div class="col-md-4 mb-4" id="${movie.id}">
            <div class="card movieCard p-3">

                <div class="card-header">
                    <h4>${movie.title}</h4>
                </div>

                <div class="card-body">
                    <img src="${movie.image}" class="img-fluid mb-2 movie-img">
                    <p class="desc">${movie.description}</p>
                    <p class="rating"><strong>Rating:</strong> ${movie.rating}</p>
                </div>

                <div class="card-footer d-flex justify-content-between">
                    <button onclick="onEditMovie(this)" class="btn btn-sm btn-primary">EDIT</button>
                    <button onclick="onRemoveMovie(this)" class="btn btn-sm btn-danger">REMOVE</button>
                </div>

            </div>
        </div>`;
    });

    movieContainer.innerHTML = result;
}


async function fetchcards() {
    try {
        let data = await makeApiCall(MOVIE_URL, 'GET');

        let movieArr = [];

        for (const key in data) {
            movieArr.push({
                ...data[key],
                id: key
            });
        }

        CreateCards(movieArr);




    } catch (error) {
        snackbar('something went wrong!!!', 'error', 1000);
    }
}
fetchcards();


async function onaddsubmitBtn(eve) {
    eve.preventDefault();

    let movieObj = {
        title: titleControl.value,
        image: imageControl.value,
        description: descriptionControl.value,
        rating: ratingControl.value
    };
    console.log(movieObj);

    try {
        let data = await makeApiCall(MOVIE_URL, 'POST', movieObj);
        movieForm.reset();

        let col = document.createElement('div');
        col.className = 'col-md-4 mb-4';
        col.id = data.name;

        col.innerHTML = `
        <div class="card movieCard p-3">
            <div class="card-header">
                <h4>${movieObj.title}</h4>
            </div>

            <div class="card-body">
                <img src="${movieObj.image}" class="img-fluid mb-2 movie-img">
                <p class="desc">${movieObj.description}</p>
                <p class="rating"><strong>Rating:</strong> ${movieObj.rating}</p>
            </div>

            <div class="card-footer d-flex justify-content-between">
                <button onclick="onEditMovie(this)" class="btn btn-sm btn-primary">EDIT</button>
                <button onclick="onRemoveMovie(this)" class="btn btn-sm btn-danger">REMOVE</button>
            </div>
        </div>`;

        movieContainer.prepend(col);
        snackbar(`MOVIE ${movieObj.title} ADDED SUCCESSFULLY!!`, 'success', timer = 1000);


    } catch (error) {
        snackbar('something went wrong!!!', 'error', 1000);
    }
}




async function onEditMovie(ele) {
    let Edit_id = ele.closest('.col-md-4').id;
    localStorage.setItem('Edit_id', Edit_id);

    let EDIT_URL = `${BASE_URL}/movies/${Edit_id}.json`;

    try {
        let data = await makeApiCall(EDIT_URL, 'GET')
        //patch the form
        titleControl.value = data.title;
        imageControl.value = data.image;
        descriptionControl.value = data.description;
        ratingControl.value = data.rating;

        addMovieBtn.classList.add('d-none');
        updateMovieBtn.classList.remove('d-none');



    } catch (error) {
        snackbar('something went wrong!!!', 'error', 1000);
    }
}

async function onUpdatemovie() {

    let updateId = localStorage.getItem('Edit_id');


    let updatedObj = {
        title: titleControl.value,
        image: imageControl.value,
        description: descriptionControl.value,
        rating: ratingControl.value
    };

    let UPDATE_URL = `${BASE_URL}/movies/${updateId}.json`;

    try {
        await makeApiCall(UPDATE_URL, 'PATCH', updatedObj);

        let col = document.getElementById(updateId);

        col.querySelector('h4').innerText = updatedObj.title;
        col.querySelector('.movie-img').src = updatedObj.image;
        col.querySelector('.desc').innerText = updatedObj.description;
        col.querySelector('.rating').innerHTML = `<strong>Rating:</strong> ${updatedObj.rating}`;

        movieForm.reset();
        snackbar(`movie ${updatedObj.title} updated successfully!!!!!!!`, 'success', 1200)
        addMovieBtn.classList.remove('d-none');
        updateMovieBtn.classList.add('d-none');

        localStorage.removeItem('Edit_id');


    } catch (error) {
        snackbar('something went wrong!!!', 'error', 1000);
    }
}


async function onRemoveMovie(ele) {


    let removeId = ele.closest('.col-md-4').id;


    let removeUrl = `${BASE_URL}/movies/${removeId}.json`;

    Swal.fire({
        title: "Are you sure?",
        text: "This movie will be permanently deleted!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#6c757d",
        confirmButtonText: "Yes, delete it!"
    }).then(async (result) => {

        if (result.isConfirmed) {

            try {

                await makeApiCall(removeUrl, 'DELETE');

                ele.closest('.col-md-4').remove();

                Swal.fire({
                    title: "Deleted!",
                    text: "Movie deleted successfully.",
                    icon: "success",
                    timer: 1500,
                    showConfirmButton: false
                });

            } catch (error) {
                console.error(error);

                Swal.fire({
                    title: "Error!",
                    text: "Something went wrong!",
                    icon: "error"
                });

            }
        }
    });
}
movieForm.addEventListener('submit', onaddsubmitBtn);
updateMovieBtn.addEventListener('click', onUpdatemovie);
addMovie.addEventListener('click', ontoggle);
backdrop.addEventListener('click', ontoggle);
closeBtn.addEventListener('click', ontoggle);