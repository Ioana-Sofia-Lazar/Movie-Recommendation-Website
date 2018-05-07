module.exports = function (omdb,rs) {
    let router = require('express').Router();

    router.get('/test/:id', async (req, res) => {
        let imdbId = req.params.id;
        let similarIds = await rs.getSimilarMoviesById(imdbId);
        
        let result = similarIds;
        // let result = [];
        // for (var i = 0; i < similarIds.length; i++) {
        //     let movieData = await omdb.getMovieById(similarIds[i]);
        //     console.log(JSON.stringify(movieData));
        //     result.push(movieData);
        // }
        
        res.send(result);
    });
    
    return router;
};