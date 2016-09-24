/*
 * Copyright (c) 2016. GrokSoft LLC - All Rights Reserved
 */
"use strict";

(function () {
    var theApp = this;
    var VERSION = "0.0.1";
    var urlBase;
    var _notes = [];
    var _priorities = [];
    var _statuses = [];
    var _categories = [];

    /**
     * Main plexNotes module
     *
     * Note: ui-bootstrap requires ngAnimate
     *
     * @type {angular.Module}
     */
    var app = angular.module('plexNotes', ['ui.bootstrap', 'ngAnimate', 'media-directives']/*,function($locationProvider){
     $locationProvider.html5Mode(true);
     }*/);

    /**
     * Controller PlexNotesController
     *
     * @description
     * Main Controller for the application
     */
    app.controller('PlexNotesController', ['$scope', '$http', '$location', '$anchorScroll', '$element', function ($scope, $http, $location, $anchorScroll, $element) {
        var plexNotes = this;
        var ctrl = this;
        var showing = true;    // State for toggle all

        // ToDo Either change the port in the run configuration to run on to be the same as the servers or add logic to decide which to use, or Have the server configurable at the
        // GUI?????????
        urlBase = 'http://' + $location.absUrl().split("/")[2] || "Unknown";
        urlBase = 'http://localhost:8080'; // For debugging

        /**
         * @name getUrlBase
         *
         * @description
         * Get the urlBase for this web app
         *
         * @returns {string}
         */
        this.getUrlBase = function () {
            return urlBase;
        };

        $scope.movies = [];

        //
        // Get the notes from the rest server
        //
        $http.get(urlBase + '/api/notes').success(function (data) {
            _notes = data;
            console.log("Data Read NotesController " + data.length + " items.");
        }).error(function (data, status, headers, config) {
            /*console.log(JSON.stringify(data));
             console.log(status);
             console.log(headers);
             console.log(JSON.stringify(config));
             alert("error: "+data);*/
            alert("Could not retrieve data from server, please verify the server is running and accessible!\n" + JSON.stringify(config, null, 4))
        });

        //
        // Get the statuses
        //
        $http.get(urlBase + '/api/data/statuses').success(function (statuses) {
            _statuses = statuses;
            console.log("Data Read  statuses " + statuses.length);
        });

        //
        // Get the priorities
        //
        $http.get(urlBase + '/api/data/priorities').success(function (priorities) {
            _priorities = priorities;
            console.log("Data Read " + priorities.length + " priorities");
        });

        //
        // Get the categories
        //
        $http.get(urlBase + '/api/data/categories').success(function (categories) {
            _categories = categories;
            console.log("Data Read categories" + categories.length);
        });

        /**
         * @name ScrollTo
         *
         * @description
         * Scroll to an anchor on a page
         */
        $scope.scrollTo = function (id) {
            $location.hash(id);
            $anchorScroll();
        };

        /**
         * @name refreshNotes
         *
         * @description
         * Refresh the Notes data
         */
        $scope.refreshNotes = function () {
            $http.get(urlBase + '/api/notes').success(function (notes) {
                _notes = notes;
                console.log("Data Read NotesController " + notes.length + " items.");
            });
        };

        /**
         * @name getVersion
         *
         * @description
         * Get the version of Plex Notes
         *
         * @returns {string}
         */
        this.getVersion = function () {
            return "Version: " + VERSION;
        };

        /**
         *  @name toggleCollapse
         *
         *  @description
         *  Toggle all the collapse elements Chevron
         *
         *  Note: This function is not needed.
         *  It's better to use angular to change the icons.
         *  On the chevron you want to change add the following using the correct isCollapsed??? variable
         *  ng-class="[{'glyphicon-chevron-down':isCollapsedList}, {'glyphicon-chevron-up':!isCollapsedList}]"
         */
        this.toggleCollapse = function (id) {
            var domElement = document.querySelector('#' + id);
            var chevron = angular.element(domElement);

            if (chevron.hasClass('glyphicon-chevron-up')) {
                chevron.removeClass('glyphicon-chevron-up');
                chevron.addClass('glyphicon-chevron-down');
            }
            else {
                chevron.removeClass('glyphicon-chevron-down');
                chevron.addClass('glyphicon-chevron-up');
            }
            //showing = !showing;

            // Stop the finger
            /*            $element.find('#finger2').removeClass('bounce-right');
             $element.find('#finger2').addClass('hidden');*/
        };

        /**
         *  @name toggleAllCollapse
         *
         *  @description
         *  Toggle all the collapse elements
         */
        this.toggleAllCollapse = function () {
            var chevron = $element.find('#chevron');
            //var allCollapsed = $('[data-toggle="collapse"]');
            var allCollapsed = $element.find('collapse');
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
            /*            $element.find('#finger2').removeClass('bounce-right');
             $element.find('#finger2').addClass('hidden');*/
        };

        // Set up the comboboxes
        //$element.find( '.combobox' ).combobox();


        // Show info
        //console.log("$route = "+$route);
        //console.log("$routeParams = "+$routeParams);
        console.log("$location = " + JSON.stringify($location));
        console.log("$location.absUrl() = " + $location.absUrl());
        console.log("urlBase = " + urlBase);
        /*var pId = $location.absUrl().split("/")[3]||"Unknown";    //path will be /person/show/321/, and array looks like: ["","person","show","321",""]
         console.log("pId = "+pId);*/

    }]);

    /**
     * Directive collapseWidthHeight
     *
     * @description
     * Horizontal & Vertical collapse
     */
    app.directive('uibCollapseWidthHeight', ['$scope', '$animation', function ($scope, $animation) {

        /*
        This stop working when I switched to the latest version of ui-bootstrap. I needed to start using uib-collapse, but not sure how to get to the ubi-????? with this javascript.

         */
        return {
            restrict: 'A',

            link: function (scope, element, attrs) {

                var initialAnimSkip = true;
                var currentTransition;

                function doTransition(change) {
                    var newTransition = $animation(element, change);
                    if (currentTransition) {
                        currentTransition.cancel();
                    }
                    currentTransition = newTransition;
                    newTransition.then(newTransitionDone, newTransitionDone);
                    return newTransition;

                    function newTransitionDone() {
                        // Make sure it's this transition, otherwise, leave it alone.
                        if (currentTransition === newTransition) {
                            currentTransition = undefined;
                        }
                    }
                }

                function expand() {
                    if (initialAnimSkip) {
                        initialAnimSkip = false;
                        expandDone();
                    } else {
                        element.removeClass('collapse').addClass('collapsing-width-height');
                        doTransition({width: element[0].scrollWidth + 'px', height: element[0].scrollHeight + 'px'}).then(expandDone);
                    }
                }

                function expandDone() {
                    element.removeClass('collapsing-width-height');
                    element.addClass('collapse in');
                    element.css({width: 'auto'});
                    element.css({height: 'auto'});
                }

                function collapse() {
                    if (initialAnimSkip) {
                        initialAnimSkip = false;
                        collapseDone();
                        element.css({width: 0});
                    } else {
                        // CSS transitions don't work with height: auto, so we have to manually change the height to a specific value
                        element.css({width: element[0].scrollWidth + 'px', height: element[0].scrollHeight + 'px'});
                        //trigger reflow so a browser realizes that height was updated from auto to a specific value
                        var x = element[0].offsetHeight;

                        element.removeClass('collapse in').addClass('collapsing-width-height');

                        doTransition({width: 0, height: 0}).then(collapseDone);
                    }
                }

                function collapseDone() {
                    element.removeClass('collapsing-width-height');
                    element.addClass('collapse');
                }

                scope.$watch(attrs.uibCollapseWidthHeight, function (shouldCollapse) {
                    if (shouldCollapse) {
                        collapse();
                    } else {
                        expand();
                    }
                });
            }
        };
    }]);

    /**
     * Directive collapseWidth
     *
     * @description
     * Horizontal collapse
     */
    app.directive('ubiCollapseWidth', ['$scope', '$animate', '$timeout', function ($scope, $animate, $timeout) {

        return {
            link: function (scope, element, attrs) {

                var initialAnimSkip = true;
                var currentTransition;

                function doTransition(change) {
                    var newTransition = $animate(element, change);
                    if (currentTransition) {
                        currentTransition.cancel();
                    }
                    currentTransition = newTransition;
                    newTransition.then(newTransitionDone, newTransitionDone);
                    return newTransition;

                    function newTransitionDone() {
                        // Make sure it's this transition, otherwise, leave it alone.
                        if (currentTransition === newTransition) {
                            currentTransition = undefined;
                        }
                    }
                }

                function expand() {
                    if (initialAnimSkip) {
                        initialAnimSkip = false;
                        expandDone();
                    } else {
                        element.removeClass('collapse').addClass('collapsing-width');
                        doTransition({width: element[0].scrollWidth + 'px'}).then(expandDone);
                    }
                }

                function expandDone() {
                    element.removeClass('collapsing-width');
                    element.addClass('collapse in');
                    element.css({width: 'auto'});
                }

                function collapse() {
                    if (initialAnimSkip) {
                        initialAnimSkip = false;
                        collapseDone();
                        element.css({width: 0});
                    } else {
                        // CSS transitions don't work with height: auto, so we have to manually change the height to a specific value
                        element.css({width: element[0].scrollWidth + 'px'});
                        //trigger reflow so a browser realizes that height was updated from auto to a specific value
                        var x = element[0].offsetHeight;

                        element.removeClass('collapse in').addClass('collapsing-width');

                        doTransition({width: 0}).then(collapseDone);
                    }
                }

                function collapseDone() {
                    element.removeClass('collapsing-width');
                    element.addClass('collapse');
                }

                scope.$watch(attrs.collapseWidth, function (shouldCollapse) {
                    if (shouldCollapse) {
                        collapse();
                    } else {
                        expand();
                    }
                });
            }
        };
    }]);


    /**
     * The restrict option is typically set to:
     *
     * 'A' - only matches attribute name    <div myAttribute>
     * 'E' - only matches element name      <myDirective>
     * 'C' - only matches class name        <div class="myClass"
     * 'M' - only matches comment           ??????
     */

    /**
     * Directive ngConfirmClick
     *
     * @description
     * Show the confirm popup
     */
    app.directive('ngConfirmClick', [
        function () {
            return {
                priority: -1,
                restrict: 'A',
                link    : function (scope, element, attrs) {
                    element.bind('click', function (e) {
                        var message = attrs.ngConfirmClick;
                        // confirm() requires jQuery
                        if (message && !confirm(message)) {
                            e.stopImmediatePropagation();
                            e.preventDefault();
                        }
                    });
                }
            }
        }
    ]);

    /**
     * Directive menu
     *
     * @description
     * The main Menu
     */
    app.directive("menu", function () {
        return {
            restrict    : "E",   // By Attribute <div project-specs>
            templateUrl : "menu.html",
            controller  : function () {

            },
            controllerAs: "menuCtrl"
        };
    });

    /**
     * Directive plexJumbo
     *
     * @description
     * Shows plexJumbo Carousel
     */
    app.directive("plexJumbo", function () {
        return {
            restrict    : "E",
            templateUrl : "plex-jumbo.html",
            controller  : function ($scope) {
                $scope.myInterval = 5000;
                $scope.noWrapSlides = false;
                $scope.active = 0;
                var slides = $scope.slides = [];
                var currIndex = 0;

                $scope.addSlide = function() {
                    var newWidth = 600 + slides.length + 1;
                    slides.push({
                        image: '//unsplash.it/' + newWidth + '/300',
                        text: ['Nice image','Awesome photograph','That is so cool','I love that'][slides.length % 4],
                        id: currIndex++
                    });
                };

                $scope.randomize = function() {
                    var indexes = generateIndexesArray();
                    assignNewIndexesToSlides(indexes);
                };

                for (var i = 0; i < 4; i++) {
                    $scope.addSlide();
                }

                // Randomize logic below

                function assignNewIndexesToSlides(indexes) {
                    for (var i = 0, l = slides.length; i < l; i++) {
                        slides[i].id = indexes.pop();
                    }
                }

                function generateIndexesArray() {
                    var indexes = [];
                    for (var i = 0; i < currIndex; ++i) {
                        indexes[i] = i;
                    }
                    return shuffle(indexes);
                }

                // http://stackoverflow.com/questions/962802#962890
                function shuffle(array) {
                    var tmp, current, top = array.length;

                    if (top) {
                        while (--top) {
                            current = Math.floor(Math.random() * (top + 1));
                            tmp = array[current];
                            array[current] = array[top];
                            array[top] = tmp;
                        }
                    }

                    return array;
                }
            },
            controllerAs: "jumboCtrl"
        };
    });

    /*app.controller('CarouselDemoCtrl', function ($scope) {
        $scope.myInterval = 5000;
        $scope.noWrapSlides = false;
        $scope.active = 0;
        var slides = $scope.slides = [];
        var currIndex = 0;

        $scope.addSlide = function() {
            var newWidth = 600 + slides.length + 1;
            slides.push({
                image: '//unsplash.it/' + newWidth + '/300',
                text: ['Nice image','Awesome photograph','That is so cool','I love that'][slides.length % 4],
                id: currIndex++
            });
        };

        $scope.randomize = function() {
            var indexes = generateIndexesArray();
            assignNewIndexesToSlides(indexes);
        };

        for (var i = 0; i < 4; i++) {
            $scope.addSlide();
        }

        // Randomize logic below

        function assignNewIndexesToSlides(indexes) {
            for (var i = 0, l = slides.length; i < l; i++) {
                slides[i].id = indexes.pop();
            }
        }

        function generateIndexesArray() {
            var indexes = [];
            for (var i = 0; i < currIndex; ++i) {
                indexes[i] = i;
            }
            return shuffle(indexes);
        }

        // http://stackoverflow.com/questions/962802#962890
        function shuffle(array) {
            var tmp, current, top = array.length;

            if (top) {
                while (--top) {
                    current = Math.floor(Math.random() * (top + 1));
                    tmp = array[current];
                    array[current] = array[top];
                    array[top] = tmp;
                }
            }

            return array;
        }
    });
*/

    /**
     * Controller NotesController
     *
     * @description
     * Main Controller for all note directives
     */
    app.controller('NotesController', ['$scope', '$http', '$element', function ($scope, $http, $element) {
        var ctrl = this;
        /* var statuses = $scope.statuses;
         var priorities = $scope.priorities;
         var categories = $scope.categories;
         var notes = $scope.notes;*/

        /**
         * @name statuses
         *
         * @description
         * Get the list of statuses
         *
         * @returns {Array} of statuses
         */
        $scope.statuses = function () {
            console.log("Getting statuses from NotesController");
            return _statuses;
        };

        /**
         * @name priorities
         *
         * @description
         * Get the list of priorities
         *
         * @returns {Array} of priorities
         */
        $scope.priorities = function () {
            console.log("Getting priorities from NotesController");
            return _priorities;
        };

        /**
         * @name categories
         *
         * @description
         * Get the list of categories
         *
         * @returns {Array} of categories
         */
        $scope.categories = function () {
            console.log("Getting categories from NotesController");
            return _categories;
        };

        /**
         * @name notes
         *
         * @description
         * Get the list of notes
         *
         * @returns {Array} of notes
         */
        $scope.notes = function () {
            console.log("Getting notes from NotesController");
            return _notes;
        };

        /**
         * @name inToString
         * Todo: Rename this?????
         *
         * @description
         * Make sure the key is an int
         *
         * @param key
         * @returns {Number}
         */
        $scope.intToString = function (key) {
            return (!isNaN(key)) ? parseInt(key) : key;
        };

        /**
         * @name zoom
         *
         * @description
         * Toggle the hover zoom of the passed note
         *
         * @param id - the id of the note
         */
        $scope.zoom = function (id, evt) {
            var domElement = document.querySelector('#' + id);
            var element = angular.element(domElement);
            var zoomIcon = angular.element(evt.target);
            if (element.hasClass('grow-md')) {
                //zoomIcon = element.find('.glyphicon-zoom-out:first');
                zoomIcon.removeClass('glyphicon-zoom-out');
                zoomIcon.addClass('glyphicon-zoom-in');
                element.removeClass('grow-md');
            }
            else {
                //zoomIcon = element.find('.glyphicon-zoom-in:first');
                zoomIcon.removeClass('glyphicon-zoom-in');
                zoomIcon.addClass('glyphicon-zoom-out');
                element.addClass('grow-md');
            }
        };
        /**
         * @name deleteNote
         *
         * @description
         * Delete the passed note
         *
         * @param id
         */
        $scope.deleteNote = function (id) {
            $http({
                method : 'DELETE',
                url    : "http://localhost:8080/api/notes/" + id,
                data   : $scope.newNote,
                headers: {'content-Type': 'application/json'}
            }).success(function (data, status, headers, config) {

                // Note: Angular is handling field validation so this is not really needed
                if (data.errors) {
                    alert("Note was NOT deleted:" + JSON.stringify(errors, null, 4));
                } else {
                    alert("Note was deleted:" + JSON.stringify(data, null, 4));
                }
                console.log("Note delete: " + JSON.stringify(data));

                $scope.refreshNotes();
            });
        };

        //
        // Initialize collapse defaults
        //
        $scope.isCollapsedNotes = false;
        $scope.isCollapsedHorizontal = false;
        $scope.isCollapsedList = false;
        $scope.isCollapsedCat = false;

        /*$scope.getWidth = function (elem) {
         var domElement = elem;
         var theDiv      = angular.element(domElement);
         var w = domElement.clientWidth;
         var w1 = theDiv.clientWidth;
         var w3 = elem.clientWidth;
         var element = document.getElementById(elem);
         var divsize = angular.element(domElement).prop('offsetWidth');
         return divsize;
         }*/

    }]);

    /**
     * Directive get-size
     *
     * @description
     * Return the width and/or height of the element that has the attribute get-size
     * This is normally the parent div of a collapse element. If you set the width
     * of a collapsible element when you do a horizontal collapse it is smooth.
     *
     * There are 3 different widths & heights you can get depending on what you're after:
     * clientWidth clientHeight
     * offsetWidth offsetHeight
     * scrollWidth scrollHeight
     */
    app.directive('getSize', function () {
        return {
            restrict: 'A',
            link    : function (scope, element, attributes) {
                var width = element[0].clientWidth;
                var height = element[0].clientHeight;
                console.log(width + ' ' + height);
                //element[0].css('width',element[0].clientWidth+"px");

                /**
                 * @name getSizeWidth
                 *
                 * @description
                 * Return the width of the element that has the attribute get-width
                 *
                 * @returns {string}
                 */
                scope.getSizeWidth = function () {
                    return width + "px";
                };
                scope.getSizeHeight = function () {
                    return height + "px";
                };
            }
        };
    });

    /**
     * Directive hover-spin
     *
     * @description
     * Spin the element that has the hover-spin attribute when the mouse is hovering
     *
     */
    app.directive('hoverSpin', function () {
        return {
            restrict: 'A',

            link: function (scope, element) {
                var hoverClass = 'gly-spin-slow';
                element.on('mouseenter', function () {
                    element.addClass(hoverClass);
                });
                element.on('mouseleave', function () {
                    element.removeClass(hoverClass);
                });
            }
        };
    });

    /**
     * Directive notes
     *
     * @description
     * Shows all the notes
     */
    app.directive("notes", function () {
        return {
            restrict    : "E",   // By Attribute <div project-specs>
            templateUrl : "notes.html",
            controller  : 'NotesController',
            controllerAs: "notesCtrl"
        }
    });

    /**
     * Directive notes-list
     *
     * @description
     * Shows all the note titles in a list
     */
    app.directive("notesList", function () {
        return {
            restrict    : "E",
            templateUrl : "notesList.html",
            controller  : 'NotesController',
            controllerAs: "notesListCtrl"
        }
    });

    /**
     * Directive notes-dropdown
     *
     * @description
     * Shows all the note titles in a list
     */
    app.directive("notesDropdown", function () {
        return {
            restrict    : "E",
            templateUrl : "notesDropdown.html",
            controller  : 'NotesController',
            controllerAs: "notesDropdownCtrl"
        }
    });

    /**
     * Controller NotesCarouselController
     *
     * @description
     * Controller for the Note carousel directives
     *
     * Todo Make a notes module and put these directives under it.
     */
    app.controller('NotesCarouselController', ['$scope', '$document', function ($scope, $document) {
        var ctrl = this;

        /**
         * @name init
         *
         * @description
         * Set the id
         *
         * @param id
         */
        $scope.init = function (id) {
            //This function is sort of private constructor for controller
            $scope.id = id;
            //Based on passed argument you can make a call to resource
            //and initialize more objects
            //$resource.getMeBond(007)
        };

        /**
         * @name getID
         *
         * @description
         * retrurn id set with the init function
         *
         * @returns id
         */
        $scope.getId = function () {
            return $scope.id;
        };

        /**
         * @name setCarousel
         *
         * @description
         * Initialize the carousel
         */
        this.setCarousel = function () {
            // Init the carousel
            new Carousel($document, $scope.id);
        };

        /**
         * @name notes
         *
         * @description
         * Get the notes
         *
         * @returns {Array} of notes
         */
        $scope.notes = function () {
            console.log("Getting notes from NotesCarouselController");
            return _notes;
        };
    }]);

    /**
     * Directive notes-carousel
     *
     * @description
     * Shows all the note in a carousel
     */
    app.directive("notesCarousel", function () {
        var carNum = 0;
        return {
            restrict    : "E",
            templateUrl : "notesCarousel.html",
            controller  : 'NotesCarouselController',
            controllerAs: "notesCarouselCtrl"
        }
    });

    /**
     * Directive note
     *
     * @description
     * Shows all the note
     */
    app.directive("note", function () {
        return {
            restrict    : "E",   // By Attribute <div project-specs>
            templateUrl : "note.html",
            controller  : function ($scope) {
                $scope.statuses = function () {
                    console.log("Getting statuses from Note-Controller");
                    return _statuses;
                };
                $scope.priorities = function () {
                    console.log("Getting priorities from Note-Controller");
                    return _priorities;
                };
                $scope.categories = function () {
                    console.log("Getting categories from Note-Controller");
                    return _categories;
                };
                $scope.notes = function () {
                    console.log("Getting notes from Note-Controller");
                    return _notes;
                };

                $scope.intToString = function (key) {
                    return (!isNaN(key)) ? parseInt(key) : key;
                };
            },
            controllerAs: "noteCtrl"
        }
    });

    /**
     * Directive new-note
     *
     * @description
     * Shows a dialog where the user can enter and save a new note
     */
    app.directive("newNote", function () {
        return {
            restrict    : "E",
            templateUrl : "newNote.html",
            controller  : function ($scope, $http) {

                // todo get rid of this if not needed
                $http.defaults.headers.post['Content-Type'] = 'application/json;charset=utf-8';

                $scope.newNoteTemplate = {
                    "id": 0, "title": "", "user": "", "emailme": true, "priority": "", "status": "", "details": "", "categories": []
                };

                // Do a deep copy of the template
                $scope.newNote = JSON.parse(JSON.stringify($scope.newNoteTemplate));

                $scope.createNote = function () {
                    var note = $scope.newNote;

                    // Verify the data has been filled out
                    if ($scope.newNote.status == "" ||
                        $scope.newNote.priority == "" ||
                        $scope.newNote.categories.length == 0 ||
                        $scope.newNote.user == "" ||
                        $scope.newNote.title == "") {
                        // Return an error!!!
                        alert("You must fill in all the data to save an note!");
                        return;
                    }

                    // Reset the form's submitted flag, so it does show errors
                    $scope.submitted = false;
                    // Clear the form
                    /*$scope.newNoteForm.$setPristine();
                     $scope.newNoteForm.$setUntouched();*/

                    // Convert to numbers
                    // Todo There should be a better way of doing this with an angular filter, directive or something!
                    $scope.newNote.status = parseInt($scope.newNote.status);
                    $scope.newNote.priority = parseInt($scope.newNote.priority);
                    for (var i = 0; i < $scope.newNote.categories.length; i++)
                        $scope.newNote.categories[i] = parseInt($scope.newNote.categories[i]);

                    $http({
                        method : 'POST',
                        url    : "http://localhost:8080/api/notes",
                        data   : $scope.newNote,
                        headers: {'content-Type': 'application/json'}
                    }).success(function (data, status, headers, config) {

                        // Note: Angular is handling field validation so this is not really needed
                        if (data.errors) {
                            alert("New note was NOT created:" + JSON.stringify(errors, null, 4));
                        } else {
                            alert("New note was created:" + JSON.stringify(data, null, 4));
                        }
                        console.log("Note created: " + JSON.stringify(data));

                        $scope.refreshNotes();

                        // Todo figure out why I had to put http call in the main controller and call it from here with refreshNote()????
                        // Refresh the notes
                        /* $http.post(urlBase+'/api/notes', note).success(function (data, status, headers, config) {
                         _notes = data;

                         console.log("Data Read " + JSON.stringify(data) + " notes");
                         });*/
                    });
                    $scope.newNote = JSON.parse(JSON.stringify($scope.newNoteTemplate));
                }
            },
            controllerAs: "newNoteCtrl"
        };
    });

    //
    // Directives for controls
    //

    /**
     * Directive statuses
     *
     * @description
     * Shows all the statuses in a selection dropdown
     */
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

    /**
     * Directive priorities
     *
     * @description
     * Shows all the priorities in a selection dropdown
     */
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

    /**
     * Directive categories
     *
     * @description
     * Shows all the categories in a selection dropdown
     */
    app.directive("categories", function () {
        return {
            restrict    : "E",
            templateUrl : "categories.html",
            controller  : function () {
                this.categories = function () {
                    console.log("Getting categories from categories");
                    return _categories;
                };
            },
            controllerAs: "categoriesCtrl"
        };
    });

    // Misc helper functions

    /**
     * @name Carousel
     *
     * @description
     * Create a bootstrap carousel slightly delayed from the last one created.
     *
     * @param aId
     * @param aInc
     * @param aInterval
     * @constructor
     */
    var Carousel = function (doc, aId, aInc, aInterval) {
        var theId = aId;
        Object.defineProperties(this, {
            carId: {
                value: angular.element(document.querySelector(aId))
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
        //   if( !$element.find(this.carId).is(".carousel") ) {
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
            /** todo use angular for this
             *  ng-mouseenter="onScreen($event)"
             ng-mouseleave="offScreen($event)"
             */
            /*angular.document.on('mouseleave', '.carousel', function () {
             if (Carousel.running == true)
             aangular.element( document.querySelector(this)).carousel('cycle');
             });
             angular.document.on('mouseenter', '.carousel', function () {
             angular.element( document.querySelector(this)).carousel('pause');
             });*/
        }

        // Setup the Carousel's initial state and create the timeout function to start it cycling
        /** TODO FIx this
         * Broke when I took jQuery out
         *
         */
        /*this.carId.carousel({interval: this.carInterval});
         this.carId.carousel("pause");*/
        Carousel.carDelay += this.inc;

        // After timeout, start the carousel cycling
        setTimeout(function () {
            //angular.element( document.querySelector(theId)).carousel('cycle');
        }, Carousel.carDelay);
    };

    /**
     * @name offset
     *
     * @param elm
     * @returns {*}
     */
    function offset(elm) {
        try {
            return elm.offset();
        } catch (e) {
        }
        var rawDom = elm[0];
        var _x = 0;
        var _y = 0;
        var body = document.documentElement || document.body;
        var scrollX = window.pageXOffset || body.scrollLeft;
        var scrollY = window.pageYOffset || body.scrollTop;
        _x = rawDom.getBoundingClientRect().left + scrollX;
        _y = rawDom.getBoundingClientRect().top + scrollY;
        return {left: _x, top: _y};
    }


    // Todo put this in the nac controller.
    /**
     * @name scrollScreen
     *
     * @description
     * Handle locking the menu to the top of page when scrolled there.
     */
    function scrollScreen() {
        // Don't bother with the menu when in phone mode.
        // Instead of messing with making the mobile menu stick to top, just let it scroll with the page.
        var MINWIDTH = 465;
        var MAXSCROLLTOP = 593;//260;
        var width = window.innerWidth;
        if (width < MINWIDTH)
            return;

        var body = document.documentElement || document.body;
        var scrollY = window.pageYOffset || body.scrollTop;

        var menu = angular.element(document.querySelector('.navbar'));

        var menuPos = menu.prop('offsetTop');//menu.position().top;
        var menuOffset = offset(menu);//menu.offset().top;
        var scrollTop = window.pageYOffset || body.scrollTop;//window.scrollTop();
        //console.log("width" + width + " | " +"MenuPos"+menuPos + " | " + "menuOffset"+ menuOffset + " | " + "scrollTop"+scrollTop);

        //if ($element.find(window).scrollTop() >= origOffsetY)
        if ((menuPos != 0) && scrollTop > (menuOffset + 20)) {
            menu.addClass('navbar-fixed-top');
            menu.addClass('fixed-menu');
            angular.element.find('#page').addClass('fixed-menu-content-padding');
        } else if ((width > MINWIDTH) && (menuPos == 0) && (scrollTop <= MAXSCROLLTOP)) {
            menu.removeClass('navbar-fixed-top');
            menu.removeClass('fixed-menu');
            angular.element.find('#page').removeClass('fixed-menu-content-padding');
        }
    }

    // If the on scroll is not set - set it
    if (document.onscroll == null)
        document.onscroll = scrollScreen;
})();