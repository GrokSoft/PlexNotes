/**
 * Created by Bill on 8/14/2016.
 * Copyright (c) 2016. GrokSoft LLC All Rights Reserved
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
        $(document).ready(function(){
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
            console.log("Data Read " + issues.length + " items.");
        });

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
            controller  : function () {
                var ctrl = this;

                /*this.createIssue = function (issue) {

                 $http.post('http://localhost:8080/api/issues').success(function (issue) {

                 //console.log("Data Read %d statuses", statuses.length);
                 });
                 };*/


            },
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