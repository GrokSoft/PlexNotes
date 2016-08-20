/*
 * Copyright (c) 2016. GrokSoft LLC - All Rights Reserved
 */
"use strict";

(function () {
    var theApp = this;
    var VERSION = "0.0.1";
    var app = angular.module('plexNotes', ['media-directives']);

    app.controller('PlexNotesController', ['$scope', '$http', function ($scope, $http) {
        var plexNotes = this;

        $scope.movies = [];

        $scope.issues = [];
        $scope.priorities = [];
        $scope.statuses = [];
        $scope.issueTypes = [];

        /**
         * Get the version of Plex Notes
         * @returns {string}
         */
        this.getVersion = function () {
            return "Version: " + VERSION;
        };

        // Set up the comboboxes
        $(document).ready(function () {
            $('.combobox').combobox();
        });

    }]);

    app.directive("plexJumbo", function () {
        return {
            restrict    : "E",   // By Attribute <div project-specs>
            templateUrl : "plex-jumbo.html",
            controller  : function () {
                // Init the carousel
                new Carousel('#topCarousel');
            },
            controllerAs: "jumboCtrl"
        };
    });

    app.controller('IssuesController', ['$scope', '$http', function ($scope, $http) {
        var ctrl = this;
        var statuses;
        var priorities;
        var issueTypes;
        var issues;


        $http.defaults.headers.post['Content-Type'] = 'application/json;charset=utf-8';

        $http.get('http://localhost:8080/api/data/statuses').success(function (statuses) {
            $scope.statuses = ctrl.statuses = statuses;
            //console.log("Data Read %d statuses", statuses.length);
        });

        $http.get('http://localhost:8080/api/data/priorities').success(function (priorities) {
            $scope.priorities = ctrl.priorities = priorities;
            //console.log("Data Read "+ ctrl.priorities.length +" priorities");
        });

        $http.get('http://localhost:8080/api/data/issues').success(function (issueTypes) {
            $scope.issueTypes = ctrl.issueTypes = issueTypes;
            //console.log("Data Read %d issueTypes", issueTypes.length);
        });

        $http.get('http://localhost:8080/api/issues').success(function (issues) {
            $scope.issues = ctrl.issues = issues;
            console.log("Data Read IssuesController " + issues.length + " items.");
        });


        $scope.intToString = function (key) {
            return (!isNaN(key)) ? parseInt(key) : key;
        };

        $scope.newIssueTemplate = {
            "id": 0, "user": "", "priority": "", "status": "", "note": "", "issues": [
                1,
                2
            ]
        };

        // Do a deep copy of the template
        $scope.newIssue = JSON.parse(JSON.stringify($scope.newIssueTemplate));

        $scope.createIssue = function () {
            var issue = $scope.newIssue;

            // Verify the data has been filled out
            if ($scope.newIssue.status == "" ||
                $scope.newIssue.priority == "" ||
                $scope.newIssue.issues.length == 0 ||
                $scope.newIssue.user == "") {
                // Return an error!!!
                alert("You must fill in all the data to save an issue!");
                return;
            }

            // Convert to numbers
            // Todo There should be a better way of doing this with an angular filter, directive or something!
            $scope.newIssue.status = parseInt($scope.newIssue.status);
            $scope.newIssue.priority = parseInt($scope.newIssue.priority);
            for (var i = 0; i < $scope.newIssue.issues.length; i++)
                $scope.newIssue.issues[i] = parseInt($scope.newIssue.issues[i]);

            $http({
                method : 'POST',
                url    : "http://localhost:8080/api/issues",
                data   : $scope.newIssue,
                headers: {'content-Type': 'application/json'}
            }).success(function (data, status, headers, config) {
                if (data.errors) {
                    alert("New issue was NOT created:" + JSON.stringify(errors, null, 4));
                } else {
                    $scope.message = data.message;
                    alert("New issue was created:" + JSON.stringify(data, null, 4));
                }
                console.log("Issue created: " + JSON.stringify(data));
            });

            $scope.newIssue = JSON.parse(JSON.stringify($scope.newIssueTemplate));

            /*$http.post('http://localhost:8080/api/issues', issue).success(function (data, status, headers, config) {

             console.log("Data Read " + JSON.stringify(data));
             });*/
        }

    }]);

    app.directive("issues", function () {
        return {
            restrict    : "E",   // By Attribute <div project-specs>
            templateUrl : "issues.html",
            controller  : 'IssuesController',
            controllerAs: "issuesCtrl"
        }
    });

    app.directive("issue", function () {
        return {
            restrict   : "E",   // By Attribute <div project-specs>
            templateUrl: "../issue.html"
        }
    });

    app.directive("newIssue", function () {
        return {
            restrict    : "E",
            templateUrl : "newIssue.html",
            controller  : 'IssuesController',   // ToDo Don't do this the controller constructor gets called again, and probably under a different scope.
            controllerAs: "newIssueCtrl"
        };
    });

    //
    // Directives for controls
    //

    app.directive("statuses", function () {
        return {
            restrict    : "EA",
            templateUrl : "statuses.html",
            controller  : 'IssuesController',
            controllerAs: "statusesCtrl"
        };
    });

    app.directive("priorities", function () {
        return {
            restrict    : "E",
            templateUrl : "priorities.html",
            controller  : 'IssuesController',
            controllerAs: "prioritiesCtrl"
        };
    });

    app.directive("issueTypes", function () {
        return {
            restrict    : "E",
            templateUrl : "issueTypes.html",
            controller  : 'IssuesController',
            controllerAs: "issueTypeCtrl"
        };
    });

    // Misc helper functions

    /**
     * Create a bootstrap carousel slightly delayed from the last one created.
     *
     * @param aId
     * @param aInc
     * @param aInterval
     * @constructor
     */
    var Carousel = function (aId, aInc, aInterval) {
        var theId = aId;
        Object.defineProperties(this, {
            carId: {
                value: $(aId)
            },

            inc: {
                value     : typeof aInc !== 'undefined' ? aInc : 2000,
                enumerable: true
            },

            carInterval: {
                value     : typeof aInterval !== 'undefined' ? aInterval : 10000,
                enumerable: true
            }
        });

        // See if the ID passed is really a carousel
        //   if( !$(this.carId).is(".carousel") ) {
        //       throw new Error("Id passed is NOT a carousel!");
        //   }

        //
        // Set the carousels to start slightly delayed from each other, so they are not all moving at the same time by default.
        //

        // Set up the Carousel's listeners. But only do this the first time.
        if (Carousel.first === undefined || Carousel.first === true) {
            // Create the Static vars that is NOT inherited by instantiated classes and needed to keep track of timing.
            Carousel.first = false;
            Carousel.carDelay = 0;  // The delay between each carousel sliding.
            Carousel.running = true;

            // Make the carousel pause when hovered over.
            $(document).on('mouseleave', '.carousel', function () {
                if (Carousel.running == true)
                    $(this).carousel('cycle');
            });
            $(document).on('mouseenter', '.carousel', function () {
                $(this).carousel('pause');
            });
        }

        // Setup the Carousel's initial state and create the timeout function to start it cycling
        this.carId.carousel({interval: this.carInterval});
        this.carId.carousel("pause");
        Carousel.carDelay += this.inc;

        // After timeout, start the carousel cycling
        setTimeout(function () {
            $(theId).carousel('cycle');
        }, Carousel.carDelay);
    };


})();