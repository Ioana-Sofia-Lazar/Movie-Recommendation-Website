module.exports = function (omdb,rs) {
    let router = require('express').Router();

    router.get('/test/:id', async (req, res) => {
        let imdbId = req.params.id;
        let similarIds = await rs.getSimilarMoviesById(imdbId);
        
        let result = [];
        for (var i = 0; i < similarIds.length; i++) {
            let movieId = similarIds[i].id;
            let movieData = await omdb.getMovieById(movieId);
            result.push(movieData);
        }
        
        res.send(result);
    });
    
    return router;
};