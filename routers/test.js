module.exports = function (omdb) {
    let router = require('express').Router();

    router.get('/test/:id', async (req, res) => {
        let imdb_id = req.params.id;
        let result = await omdb.getMovieById(imdb_id);
        res.send(result);
    });
    
    return router;
};