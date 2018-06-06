var app = angular.module('newsAggregator', ['ngResource','ngRoute', 'ngStorage']);

app.config(['$routeProvider', function($routeProvider){
    $routeProvider
        .when('/', {
            templateUrl: 'partials/homePage.html',
            controller: 'HomePageCtrl'
        })
        .when('/login', {
            templateUrl: 'partials/login.html',
            controller: 'LoginCtrl'
        })
        .when('/register', {
            templateUrl: 'partials/register.html',
            controller: 'RegisterCtrl'
        })
        .when('/add-article', {
            templateUrl: 'partials/createArticle-form.html',
            controller: 'AddArticleCtrl'
        })
        .when('/article/edit/:id', {
            templateUrl: 'partials/editArticle-form.html',
            controller: 'EditArticleCtrl'
        })
        .when('/article/delete/:id', {
            templateUrl: 'partials/article-delete.html',
            controller: 'DeleteArticleCtrl'
        })
        .when('/article/viewcomments/:id', {
            templateUrl: 'partials/commentPage.html',
            controller: 'CommentCtrl'
        })
        .when('/article/viewcomments/:articleid/edit/:commentid', {
            templateUrl: 'partials/editComment-form.html',
            controller: 'EditCommentCtrl'
        })
        .when('/article/viewcomments/:articleid/delete/:commentid', {
            templateUrl: 'partials/comment-delete.html',
            controller: 'DeleteCommentCtrl'
        })
        .otherwise({    
            redirectTo: '/'
        });
}]);

app.factory('ArticleService', ['$resource',
    function ($resource) {
        return $resource('api/articles/:id', {}, {
            query: { method: "GET", isArray: true },
            create: { method: "POST", params: {id: '@id'}},
            get: { method: "GET"},
            remove: { method: "DELETE"},
            update: { method: "PUT", params: {id: '@id'}}
        });
}]);

app.factory('ArticleCommentService', ['$resource',
    function ($resource) {
        return $resource('api/articles/:articleid/:commentid', {}, {
            query: { method: "GET", isArray: true },
            create: { method: "POST", params: {id: '@id'}},
            get: { method: "GET"},
            remove: { method: "DELETE"},
            update: { method: "PUT", params: {articleid: '@articleid', commentid: '@commentid'}}
        });
}]);

app.controller('LoginCtrl', ['$localStorage', '$scope', '$resource', '$location', '$routeParams', '$route',
    function($localStorage, $scope, $resource, $location, $routeParams, $route){
        if($localStorage.prevPageData != null){
            $location.path('/')
        }

    $scope.user = {};
    $scope.submit = function(){
        var error = 0;
        if($scope.user.username == null || $scope.user.password == null){
            alert("Please key in a username and password")
            error = 1
        }
        if(error != 1){

            console.log($scope.user)
            var Credentials = $resource('/users');
            Credentials.get($scope.user, function(user){
                console.log("HELLA")
                console.log(user.username)
                if(user.username == null){
                    alert("Incorrect username or password")
                } else {
                $localStorage.prevPageData = user;
                $location.path('/');
                }
            });
        }
    };
}]);

app.controller('RegisterCtrl', ['$localStorage', '$scope', '$resource', '$location', '$routeParams', '$route', '$rootScope',
    function($localStorage, $scope, $resource, $location, $routeParams, $route, $rootScope){
        if($localStorage.prevPageData != null){
            $location.path('/')
        }

        $scope.submit = function(){
            var error = 0;
            if($scope.user.name == null || $scope.user.username == null || $scope.user.password == null || $scope.user.confirmPassword == null ){
                alert("Please fill up the missing fields.")
                error = 1
            }

            if($scope.user.password != $scope.user.confirmPassword){
                alert("Password does not match")
                error = 1
            }

            if($scope.user.modCode != "9999" && $scope.user.modCode != null){
                alert("Registration to be a moderator is unsuccessful, please only register to be one if you have the code")
                error = 1
                $route.reload();
                $scope.$apply();
                $location.replace();
            } else {

            if(error != 1){
            $.ajax({
                    url : '/users/register',
                    type : 'POST',
                    data: { user: $scope.user },
                    contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
                    success : function(data) {
                        
                        alert(data.msg)
                        if(data.msg == 'Username taken, please try again'){
                            $location.path("/register");
                        } else {
                            $location.path("/login");
                        }
                        $scope.$apply();
                        $location.replace();

                    }
                });
            } 
            }
        }
}]);

app.controller('HomePageCtrl', ['ArticleService', '$localStorage', '$scope', '$resource', '$location', '$routeParams', '$route',
    function(ArticleService, $localStorage, $scope, $resource, $location, $routeParams, $route){
        if($localStorage.prevPageData == null){
            $location.path('/login')
        }
        $scope.user = $localStorage.prevPageData;

        var Articles = $resource('/api/articles');
        Articles.query(function(articles){
            $scope.articles = articles;
        });

        $scope.up = function(id){
            console.log(id);

            ArticleService.update({ id: id, code: 2}, function(){
                $route.reload();
            });                           
        };

        $scope.down = function(id){

            ArticleService.update({ id: id, code: 3}, function(){
                $route.reload();
            });    
        }

        $scope.submit = function(){
            var searchQuery = $scope.article;
            console.log(searchQuery)
            Articles.query($scope.article, function(articles){
                $scope.articles = articles;
            });
        }

        $scope.logout = function(){
            console.log("logging out")
            $localStorage.$reset();
            $location.path('/login')
        }
}]);



app.controller('AddArticleCtrl', ['$localStorage', '$scope', '$resource', '$location',
    function($localStorage, $scope, $resource, $location){
        if($localStorage.prevPageData == null){
            $location.path('/login')
        }
        $scope.user = $localStorage.prevPageData;
        $scope.save = function(){
            var Articles = $resource('/api/articles');
            console.log($scope.article)
            Articles.save({article: $scope.article, user: $scope.user}, function(){
                $location.path('/');
            });
        };
}]);

app.controller('EditArticleCtrl', ['$localStorage', 'ArticleService', '$scope', '$resource', '$location', '$routeParams',
    function($localStorage, ArticleService, $scope, $resource, $location, $routeParams){
        if($localStorage.prevPageData == null){
            $location.path('/login')
        }
        $scope.user = $localStorage.prevPageData;
       	//var Articles = $resource('/api/articles/:id');
        ArticleService.get({ id: $routeParams.id }, function(article){
            $scope.article = article;
        })

        $scope.update = function(){
            ArticleService.update({ id: $routeParams.id, data: $scope.article, code: 1}, function(){
                $location.path('/');
            });
        };
}]);

app.controller('DeleteArticleCtrl', ['$localStorage', '$scope', '$resource', '$location', '$routeParams',
    function($localStorage, $scope, $resource, $location, $routeParams){
        if($localStorage.prevPageData == null){
            $location.path('/login')
        }
        $scope.user = $localStorage.prevPageData;
        var Articles = $resource('/api/articles/:id');
        Articles.get({ id: $routeParams.id }, function(article){
            $scope.article = article;
        })
    
        $scope.delete = function(){
            Articles.delete({ id: $routeParams.id }, function(article){
                $location.path('/');
            });
        }
}]);

app.controller('CommentCtrl', ['$localStorage', 'ArticleService', 'ArticleCommentService', '$scope', '$resource', '$location', '$routeParams', '$route',
    function($localStorage, ArticleService, ArticleCommentService, $scope, $resource, $location, $routeParams, $route){
        if($localStorage.prevPageData == null){
            $location.path('/login')
        }
        //var Articles = $resource('/api/articles/:id');
        $scope.user = $localStorage.prevPageData;
        ArticleService.get({ id: $routeParams.id }, function(article){
            if(article.comments != null){
                article.comments.sort(function(a, b){
                    var x = a.votes;
                    var y = b.votes;

                    return -1 * ((x < y) ? -1 : ((x > y) ? 1 : 0));
                });
            }
            $scope.article = article;
        })

        $scope.save = function(){
            ArticleService.create({id: $routeParams.id, user: $scope.user, data: $scope.comment}, function(){
                $route.reload();
            })
        }

        $scope.upArticle = function(id){
            console.log(id);

            ArticleService.update({ id: id, code: 2}, function(){
                $route.reload();
            });                           
        };

        $scope.downArticle = function(id){

            ArticleService.update({ id: id, code: 3}, function(){
                $route.reload();
            });    
        }

        $scope.up = function(articleid, commentid){
            ArticleCommentService.update({ articleid: articleid, commentid: commentid, code: 2}, function(){
                $route.reload();
            });                           
        };

        $scope.down = function(articleid, commentid){

            ArticleCommentService.update({ articleid: articleid, commentid: commentid, code: 3}, function(){
                $route.reload();
            });    
        }
}]);

app.controller('EditCommentCtrl', ['ArticleCommentService', '$localStorage', 'ArticleService', '$scope', '$resource', '$location', '$routeParams', '$route',
    function(ArticleCommentService, $localStorage, ArticleService, $scope, $resource, $location, $routeParams, $route){
        if($localStorage.prevPageData == null){
            $location.path('/login')
        }
        $scope.user = $localStorage.prevPageData;
        var Articles = $resource('/api/articles/:articleid/:commentid', {articleid: '@articleid', commentid: '@commentid'});
        Articles.get({ articleid: $routeParams.articleid }, function(article){
            $scope.article = article;
        })

        Articles.get({ articleid: $routeParams.articleid, commentid: $routeParams.commentid }, function(comment){
            console.log(comment);
            $scope.comment = comment;
        })

        $scope.update = function(){
            ArticleCommentService.update({articleid: $routeParams.articleid, commentid: $routeParams.commentid, data: $scope.comment, code: 1 }, function(){
                $location.path("/article/viewcomments/"+$routeParams.articleid);
            })
        }
}]);

app.controller('DeleteCommentCtrl', ['$localStorage', 'ArticleService', '$scope', '$resource', '$location', '$routeParams', '$route',
    function($localStorage, ArticleService, $scope, $resource, $location, $routeParams, $route){
        if($localStorage.prevPageData == null){
            $location.path('/login')
        }
        $scope.user = $localStorage.prevPageData;

        var Articles = $resource('/api/articles/:articleid/:commentid', {articleid: '@articleid', commentid: '@commentid'});
        Articles.get({ articleid: $routeParams.articleid }, function(article){
            $scope.article = article;
        })

        Articles.get({ articleid: $routeParams.articleid, commentid: $routeParams.commentid }, function(comment){
            console.log(comment);
            $scope.comment = comment;
        })

        $scope.delete = function(){
            Articles.delete({articleid: $routeParams.articleid, commentid: $routeParams.commentid }, function(){
                $location.path("/article/viewcomments/"+$routeParams.articleid);
            })
        }
}]);


