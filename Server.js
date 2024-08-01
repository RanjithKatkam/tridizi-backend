require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const cors = require("cors");
const PORT = 3000;
const app = express();
app.use(bodyParser.json());
app.use(cors());

app.get("/api/movies", async (req, res) => {
    const url = `https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&page=1&sort_by=popularity.desc&api_key=${process.env.API_KEY}`;
    const options = {
        method: "GET",
        headers: {
            accept: "application/json",
            Authorization: `Bearer ${process.env.BEARER_TOKEN}`,
        },
    };

    try {
        const response = await axios.get(url, options);
        const moviesList = response.data.results.map((movie) => ({
            id: movie.id,
            title: movie.title,
            description: movie.overview,
            poster: "https://image.tmdb.org/t/p/w500" + movie.poster_path,
            releaseDate: movie.release_date,
            backdropImg: "https://image.tmdb.org/t/p/w500" + movie.backdrop_path,
            rating: parseFloat(movie.vote_average.toFixed(1)),
        }));
        res.json(moviesList);
    } catch (error) {
        console.error("Error fetching movies: ", error);
        res.status(500).json({ message: "Error fetching movies" });
    }
});

app.get("/api/movie/details/:movieId", async (req, res) => {
    const { movieId } = req.params;
    const url = `https://api.themoviedb.org/3/movie/${movieId}?language=en-US&api_key=${process.env.API_KEY}`;
    const options = {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.BEARER_TOKEN}`,
        },
    };

    try {
        const response = await axios.get(url, options);
        const hrs = Math.floor(response.data.runtime / 60);
        const mins = response.data.runtime % 60;

        const movieDetails = {
            budget: response.data.budget,
            homepage: response.data.homepage,
            revenue: response.data.revenue,
            runtime: `${hrs} hrs ${mins} mins`,
            poster: "https://image.tmdb.org/t/p/w500" + response.data.poster_path,
            title: response.data.title,
            description: response.data.overview,
            rating: parseFloat(response.data.vote_average.toFixed(1)),
            releaseDate: response.data.release_date,
            tagline: response.data.tagline || ""
        };
        res.json(movieDetails);
    } catch (error) {
        console.error("Error fetching movie details: ", error);
        res.status(500).json({ message: "Error fetching movie details" });
    }
});

app.get("/api/movie/people/:movieId", async (req, res) => {
    const { movieId } = req.params;
    const url = `https://api.themoviedb.org/3/movie/${movieId}/credits?language=en-US&api_key=${process.env.API_KEY}`;
    const options = {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.BEARER_TOKEN}`,
        },
    };

    try {
        const response = await axios.get(url, options);
        const actors = response.data.cast.filter((cast) => cast.known_for_department === "Acting");
        const directors = response.data.crew.filter((cast) => cast.known_for_department === "Directing");
        const actorsList = actors.map((actor) => ({
            id: actor.id,
            name: actor.name,
            character: actor.character,
            profileImg: "https://image.tmdb.org/t/p/w500" + actor.profile_path,
        }));

        const directorsList = directors.map((director) => ({
            id: director.id,
            name: director.name,
            profileImg: "https://image.tmdb.org/t/p/w500" + director.profile_path,
        }));

        const people = {
            actors: actorsList,
            directors: directorsList,
        };
        res.json(people);
    } catch (error) {
        console.error("Error fetching movie cast: ", error);
        res.status(500).json({ message: "Error fetching movie cast" });
    }
});

app.get("/api/movie/:movieId/images", async (req, res) => {
    const { movieId } = req.params;
    const url = `https://api.themoviedb.org/3/movie/${movieId}/images?api_key=${process.env.API_KEY}`;
    const options = {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.BEARER_TOKEN}`,
        },
    };

    try {
        const response = await axios.get(url, options);
        const backdrops = response.data.backdrops.map((images) => ({
            image: "https://image.tmdb.org/t/p/w500" + images.file_path,
        }));
        const imagesList = backdrops.slice(0, 5).map((img) => img.image);

        res.json(imagesList);
    } catch (error) {
        console.error("Error fetching images: ", error);
        res.status(500).json({ message: "Error fetching images" });
    }
});

app.listen(PORT, () => {
    console.log("Server is running on PORT: ", PORT);
});
