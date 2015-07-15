var homePage = angular.module("myWebsite", []);

homePage.controller("ProjectController", function($scope, $http) {
  $http.get('data/projects.json').success(function(data){
    $scope.projects = data;
  });

});

homePage.controller("EduController", function($scope, $http) {
  $http.get('data/edu.json').success(function(data){
    $scope.universities = data;
  });

});

homePage.controller("WorkController", function($scope, $http) {
  $http.get('data/workex.json').success(function(data){
    $scope.workex = data;
  });

});
