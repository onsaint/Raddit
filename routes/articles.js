var express = require('express');
var router = express.Router();

var monk = require('monk');
var db = monk('localhost:27017/newsaggregator');

router.get('/', function(req, res) {
    var collection = db.get('articles');
    collection.find({}, function(err, articles){
        if (err) throw err;
      	res.json(articles);
    });
});

router.post('/', function(req, res){
    var collection = db.get('articles');
    collection.insert({
        title: req.body.title,
        URL: req.body.url,
        user: req.body.user,
        votes: 0
    }, function(err, articles){
        if (err) throw err;

        res.json(articles);
    });
});

router.put('/:articleid', function(req,res) {
	var collection = db.get('articles');
	collection.findByIdAndUpdate({ _id: req.params.articleid }, 
	{
		$set : {title: req.body.title}
	},
	{
		new : true
	},
	function(err, articles) {
		if (err) throw err;

		res.json(articles);
	});
});

router.get('/:articleid', function(req, res) {
    var collection = db.get('articles');
    collection.findOne({ _id: req.params.articleid }, function(err, articles){
        if (err) throw err;

      	res.json(articles);
    });
});

router.post('/:articleid', function(req, res) {
    var collection = db.get('articles');
    //if collection (comments) is empty
    collection.update(
    	{ _id: req.params.articleid }, 
    	{ $set : 
    		{ comments: [
    				{
    					id: 2,
    					user: req.body.user,
    					date: req.body.date,
    					votes: 0,
    					body: req.body.content
    				}
    			]
    		}
    	}, function(err, articles){
        if (err) throw err;

      	res.json(articles);
    });
    //else just push
});

router.delete('/:articleid', function(req, res){
    var collection = db.get('articles');
    collection.remove({ _id: req.params.articleid }, function(err, articles){
        if (err) throw err;

        res.json(articles);
    });
});

router.delete(':articleid/:commentid', function(req, res){
    var collection = db.get('articles');
    collection.remove({ _id: req.params.articleid }, function(err, articles){
        if (err) throw err;
//pull?
        res.json(articles);
    });
});

module.exports = router;