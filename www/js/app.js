/*
 * Copyright (c) 2016. GrokSoft LLC - All Rights Reserved
 */
"use strict";

(function () {
    var theApp = this;
    var VERSION = "0.0.1";
    var urlBase;

    var _issues = [];
    var _priorities = [];
    var _statuses = [];
    var _issueTypes = [];

    /**
     * Main plexNotes module
     *
     * @type {angular.Module}
     */
    var app = angular.module('plexNotes', ['media-directives']/*,function($locationProvider){
     $locationProvider.html5Mode(true);
     }*/);

    app.controller('PlexNotesController', ['$scope', '$http', '$location', function ($scope, $http, $location) {
        var plexNotes = this;
        var ctrl = this;
        var showing  = true;    // State for toggle all

        // ToDo Either change the port in the run configuration to run on to be the same as the servers or add logic to decide which to use, or Have the server configurable at the
        // GUI?????????
        urlBase = 'http://' + $location.absUrl().split("/")[2] || "Unknown";
        urlBase = 'http://localhost:8080'; // For debugging
        this.getUrlBase = function () {
            return urlBase;
        };

        $scope.movies = [];

        $http.get(urlBase + '/api/issues').success(function (data) {
            _issues = data;
            console.log("Data Read IssuesController " + data.length + " items.");
        }).error(function (data, status, headers, config) {
            /*console.log(JSON.stringify(data));
            console.log(status);
            console.log(headers);
            console.log(JSON.stringify(config));
            alert("error: "+data);*/
            alert("Could not retrieve data from server, please verify the server is running and accessible!")
        });

        $http.get(urlBase + '/api/data/statuses').success(function (statuses) {
            _statuses = statuses;
            console.log("Data Read  statuses " + statuses.length);
        });

        $http.get(urlBase + '/api/data/priorities').success(function (priorities) {
            _priorities = priorities;
            console.log("Data Read " + priorities.length + " priorities");
        });

        $http.get(urlBase + '/api/data/issuetypes').success(function (issueTypes) {
            _issueTypes = issueTypes;
            console.log("Data Read issueTypes" + issueTypes.length);
        });

        /**
         * Refresh the Issues daTA
         */
        $scope.refreshIssues = function () {
            $http.get(urlBase + '/api/issues').success(function (issues) {
                _issues = issues;
                console.log("Data Read IssuesController " + issues.length + " items.");
            });
        };

        /**
         * Get the version of Plex Notes
         * @returns {string}
         */
        this.getVersion = function () {
            return "Version: " + VERSION;
        };

        /**
         *  Toggle all the collapse elements
         */
        this.toggleAllCollapse = function () {
            var chevron      = $('#chevron');
            var allCollapsed = $('[data-toggle="collapse"]');
            if (showing) {
                allCollapsed.collapse('hide');
                chevron.removeClass('glyphicon-chevron-up');
                chevron.removeClass('glyphicon-chevron-up');
                chevron.addClass('glyphicon-chevron-down');
            }
            else {
                allCollapsed.collapse('show');
                chevron.removeClass('glyphicon-chevron-down');
                chevron.addClass('glyphicon-chevron-up');
            }
            showing = !showing;

            // Stop the finger
            /*            $('#finger2').removeClass('bounce-right');
             $('#finger2').addClass('hidden');*/
        };

        // Set up the comboboxes
        $(document).ready(function () {
            $('.combobox').combobox();
        });

        // Show info
        //console.log("$route = "+$route);
        //console.log("$routeParams = "+$routeParams);
        console.log("$location = " + JSON.stringify($location));
        console.log("$location.absUrl() = " + $location.absUrl());
        console.log("urlBase = " + urlBase);
        /*var pId = $location.absUrl().split("/")[3]||"Unknown";    //path will be /person/show/321/, and array looks like: ["","person","show","321",""]
         console.log("pId = "+pId);*/

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

    app.controller('IssuesController', ['$scope', function ($scope) {
        var ctrl = this;
        /* var statuses = $scope.statuses;
         var priorities = $scope.priorities;
         var issueTypes = $scope.issueTypes;
         var issues = $scope.issues;*/

        $scope.statuses = function () {
            console.log("Getting statuses from IssuesController");
            return _statuses;
        };
        $scope.priorities = function () {
            console.log("Getting priorities from IssuesController");
            return _priorities;
        };
        $scope.issueTypes = function () {
            console.log("Getting issueTypes from IssuesController");
            return _issueTypes;
        };
        $scope.issues = function () {
            console.log("Getting issues from IssuesController");
            return _issues;
        };

        $scope.intToString = function (key) {
            return (!isNaN(key)) ? parseInt(key) : key;
        };
    }]);


    /**
     * Directive issues
     *
     * @description
     * Shows all the issues
     */
    app.directive("issues", function () {
        return {
            restrict    : "E",   // By Attribute <div project-specs>
            templateUrl : "issues.html",
            controller  : 'IssuesController',
            controllerAs: "issuesCtrl"
        }
    });

    /**
     * Directive issues-list
     *
     * @description
     * Shows all the issue titles in a list
     */
    app.directive("issuesList", function () {
        return {
            restrict    : "E",
            templateUrl : "issuesList.html",
            controller  : 'IssuesController',
            controllerAs: "issuesListCtrl"
        }
    });

    /**
     * Directive issues-dropdown
     *
     * @description
     * Shows all the issue titles in a list
     */
    app.directive("issuesDropdown", function () {
        return {
            restrict    : "E",
            templateUrl : "issuesDropdown.html",
            controller  : 'IssuesController',
            controllerAs: "issuesDropdownCtrl"
        }
    });

    app.controller('IssuesCarouselController', ['$scope', function ($scope) {
        var ctrl = this;

        $scope.init = function(id)
        {
            //This function is sort of private constructor for controller
            $scope.id = id;
            //Based on passed argument you can make a call to resource
            //and initialize more objects
            //$resource.getMeBond(007)
        };

        $scope.getId = function () {
            return $scope.id;
        };

        /**
         * Initialize the carousel
         */
        this.setCarousel = function () {
            // Init the carousel
            new Carousel($scope.id);
        };

        /**
         * Get the issues
         * @returns {Array}
         */
        $scope.issues = function () {
            console.log("Getting issues from IssuesCarouselController");
            return _issues;
        };
    }]);

    /**
     * Directive issues-carousel
     *
     * @description
     * Shows all the issue titles in a carousel
     */
    app.directive("issuesCarousel", function () {
        var carNum = 0;
        return {
            restrict    : "E",
            templateUrl : "issuesCarousel.html",
            controller  : 'IssuesCarouselController',
            controllerAs: "issuesCarouselCtrl"
        }
    });


    app.directive("issue", function () {
        return {
            restrict    : "E",   // By Attribute <div project-specs>
            templateUrl : "issue.html",
            controller  : function ($scope) {
                $scope.statuses = function () {
                    console.log("Getting statuses from Issue-Controller");
                    return _statuses;
                };
                $scope.priorities = function () {
                    console.log("Getting priorities from Issue-Controller");
                    return _priorities;
                };
                $scope.issueTypes = function () {
                    console.log("Getting issueTypes from Issue-Controller");
                    return _issueTypes;
                };
                $scope.issues = function () {
                    console.log("Getting issues from Issue-Controller");
                    return _issues;
                };

                $scope.intToString = function (key) {
                    return (!isNaN(key)) ? parseInt(key) : key;
                };
            },
            controllerAs: "issueCtrl"
        }
    });



    app.directive("newIssue", function () {
        return {
            restrict    : "E",
            templateUrl : "newIssue.html",
            controller  : function ($scope, $http) {

                // todo get rid of this if not needed
                $http.defaults.headers.post['Content-Type'] = 'application/json;charset=utf-8';

                $scope.newIssueTemplate = {
                    "id": 0, "title": "", "user": "", "priority": "", "status": "", "notes": "", "issues": []
                };

                // Do a deep copy of the template
                $scope.newIssue = JSON.parse(JSON.stringify($scope.newIssueTemplate));

                $scope.createIssue = function () {
                    var issue = $scope.newIssue;

                    // Verify the data has been filled out
                    if ($scope.newIssue.status == "" ||
                        $scope.newIssue.priority == "" ||
                        $scope.newIssue.issues.length == 0 ||
                        $scope.newIssue.user == "" ||
                        $scope.newIssue.user == "" ) {
                        // Return an error!!!
                        alert("You must fill in all the data to save an issue!");
                        return;
                    }

                    // Reset the form's submitted flag, so it does show errors
                    $scope.submitted=false;
                    // Clear the form
                    /*$scope.newIssueForm.$setPristine();
                     $scope.newIssueForm.$setUntouched();*/

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

                        // Note: Angular is handling field validation so this is not really needed
                        if (data.errors) {
                            alert("New issue was NOT created:" + JSON.stringify(errors, null, 4));
                        } else {
                            alert("New issue was created:" + JSON.stringify(data, null, 4));
                        }
                        console.log("Issue created: " + JSON.stringify(data));

                        $scope.refreshIssues();

                        // Todo figure out why I had to put http call in the main controller and call it from here with refreshIssue()????
                        // Refresh the issues
                        /* $http.post(urlBase+'/api/issues', issue).success(function (data, status, headers, config) {
                         _issues = data;

                         console.log("Data Read " + JSON.stringify(data) + " issues");
                         });*/
                    });
                    $scope.newIssue = JSON.parse(JSON.stringify($scope.newIssueTemplate));
                }
            },
            controllerAs: "newIssueCtrl"
        };
    });

    //
    // Directives for controls
    //

    app.directive("statuses", function () {
        return {
            restrict    : "E",
            templateUrl : "statuses.html",
            controller  : function () {
                var ctrl = this;
                /*this.statuses = function () {
                    console.log("Getting statuses from statuses");
                    return _statuses;
                };*/
                this.statuses = [];

                // Load the status array for the combobox
                var i = 0;
                _statuses.forEach(function (status) {
                    ctrl.statuses.push({StatusID: i++, StatusName: status});
                });
            },
            controllerAs: "statusesCtrl"
        };
    });

    app.directive("priorities", function () {
        return {
            restrict    : "E",
            templateUrl : "priorities.html",
            controller  : function () {

                this.priorities = function () {
                    console.log("Getting priorities from priorities");
                    return _priorities;
                };
            },
            controllerAs: "prioritiesCtrl"
        };
    });

    app.directive("issueTypes", function () {
        return {
            restrict    : "E",
            templateUrl : "issueTypes.html",
            controller  : function () {
                this.issueTypes = function () {
                    console.log("Getting issueTypes from issueTypes");
                    return _issueTypes;
                };
            },
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