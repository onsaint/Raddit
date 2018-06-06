var express = require('express');
var router = express.Router();
var ObjectID = require('mongodb').ObjectID;

var monk = require('monk');
var db = monk('localhost:27017/newsaggregator');


router.get('/', function(req, res) {
    var collection = db.get('articles');
    console.log(req.query.search)
    var searchQuery = req.body;
    if(req.query.search == null){
        collection.find({}, {sort: {votes: -1}}, function(err, articles){
            if (err) throw err;
            res.json(articles);
        });
    } else {
        collection.find({title: {$regex: req.query.search, $options: 'si'}}, {sort: {votes: -1}}, function(err, articles){
            if (err) throw err;
            res.json(articles);
        });    
    }
});

router.post('/', function(req, res){
    var collection = db.get('articles');
    collection.insert({
        title: req.body.article.title,
        URL: req.body.article.url,
        user: req.body.user.username,
        votes: 0
    }, function(err, articles){
        if (err) throw err;

        res.json(articles);
    });
});

router.put('/:articleid', function(req,res) {

    console.log("HI " + req.body.code);
    //edit page
    if(req.body.code == 1){
    	var collection = db.get('articles');
        console.log(req.body.data.title);
    	collection.update(
        { 
            _id: req.params.articleid 
        }, 
    	{
            $set: {title: req.body.data.title}
    	},
    	function(err, articles) {
    		if (err) throw err;
    		res.json(articles);
    	});  
    //upvote
    } else if (req.body.code == 2){
        var collection = db.get('articles');
        collection.findOne({ _id: req.body.id  }, function(err, article){
            if (err) throw err;

                collection.update(
            { 
                _id: article._id
            }, 
            {
                $set: {votes: (article.votes+1)}
            },
            function(err, articles) {
                if (err) throw err;
                res.json(articles);
            });  
        });
    //downvote
    } else {
        var collection = db.get('articles');
        collection.findOne({ _id: req.body.id  }, function(err, article){
            if (err) throw err;

                collection.update(
            { 
                _id: article._id
            }, 
            {
                $set: {votes: (article.votes-1)}
            },
            function(err, articles) {
                if (err) throw err;

                res.json(articles);
            });  
        });
    }
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
    var objectId = new ObjectID();
    
    //if collection (comments) is empty
    collection.update(
    	{ 
            _id: req.params.articleid 
        }, 
    	{ 
            $push : 
    		   { comments:
    				{
    					id: objectId,
    					user: req.body.user.username,
    					date: new Date().toString(),
    					votes: 0,
    					body: req.body.data.content
    				}
    		   }
    	}, function(err, articles){
        if (err) throw err;

      	res.json(articles);
    });
});

router.delete('/:articleid', function(req, res){
    var collection = db.get('articles');
    collection.remove({ _id: req.params.articleid }, function(err, articles){
        if (err) throw err;

        res.json(articles);
    });
});

router.get('/:articleid/:commentid', function(req, res){
    var collection = db.get('articles');
    var commentid = req.params.commentid;
    var o_id = ObjectID(commentid);
    collection.findOne({ 'comments.id': o_id }, {"comments.$": 1}, function(err, articles){
        if (err) throw err;

        res.json(articles);
    });
});

router.delete('/:articleid/:commentid', function(req, res){
    var collection = db.get('articles');
    var commentid = req.params.commentid;
    var o_id = ObjectID(commentid);
    collection.update({ 
        'comments.id': o_id 
    }, 
    {
        $pull: {
            'comments' : {
                'id': o_id
            }
        }
    },function(err, articles){
        if (err) throw err;
        res.json(articles);
    });
});

router.put('/:articleid/:commentid', function(req, res){
   if(req.body.code == 1){
        var commentid = ObjectID(req.body.commentid);
        var collection = db.get('articles');
            collection.update(
            {
                "comments.id" : commentid
            },
            {
                $set: {
                    "comments.$.body": req.body.data.comments[0].body
                }
            },
            function(err, article) {
                if (err) throw err;
                console.log(article);
                res.json(article);
            });
   } else if (req.body.code == 2){
        var commentid = ObjectID(req.body.commentid);
        var collection = db.get('articles');
            collection.update(
            { 
                "comments.id" : commentid
            }, 
            {
                $inc: {
                    'comments.$.votes' : 1
                }
            },
            function(err, articles) {
                if (err) throw err;
                console.log(articles);
                res.json(articles);
            });
    //downvote
    } else {
        var commentid = ObjectID(req.body.commentid);
        var collection = db.get('articles');
        collection.update(
            { 
                "comments.id" : commentid
            }, 
            {
                $inc: {
                    'comments.$.votes' : -1
                }
            },
            function(err, articles) {
                if (err) throw err;
                console.log(articles);
                res.json(articles);
            });
    }
});

module.exports = router;