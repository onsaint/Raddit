var app = angular.module('newsAggregator', ['ngResource','ngRoute']);

app.config(['$routeProvider', function($routeProvider){
    $routeProvider
        .when('/', {
            templateUrl: 'partials/homePage.html',
            controller: 'HomePageCtrl'
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
        .otherwise({
            redirectTo: '/'
        });
}]);

app.controller('HomePageCtrl', ['$scope', '$resource', 
    function($scope, $resource){
        var Articles = $resource('/api/articles');
        Articles.query(function(articles){
            $scope.articles = articles;
    });
}]);

app.controller('AddArticleCtrl', ['$scope', '$resource', '$location',
    function($scope, $resource, $location){
        $scope.save = function(){
            var Articles = $resource('/api/articles');
            Articles.save($scope.article, function(){
                $location.path('/');
            });
        };
}]);

app.controller('EditArticleCtrl', ['$scope', '$resource', '$location', '$routeParams',
    function($scope, $resource, $location, $routeParams){
       	var Articles = $resource('/api/articles/:id');
        Articles.get({ id: $routeParams.id }, function(article){
            $scope.article = article;
        })

        $scope.update = function(){
            Articles.put({ id: $routeParams.id }, function(article){
                $location.path('/');
            });
        };
}]);

app.controller('DeleteArticleCtrl', ['$scope', '$resource', '$location', '$routeParams',
    function($scope, $resource, $location, $routeParams){
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
