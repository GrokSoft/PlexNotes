/**
 * Created by Bill on 8/14/2016.
 * Copyright (c) 2016. GrokSoft LLC All Rights Reserved
 */
"use strict";

(function () {
    var app = angular.module('media-directives', []);

    /**
     * The restrict option is typically set to:
     *
     * 'A' - only matches attribute name    <div myAttribute>
     * 'E' - only matches element name      <myDirective>
     * 'C' - only matches class name        <div class="myClass"
     * 'M' - only matches comment           ??????
     */

    app.directive("movie", function () {
        return {
            restrict    : "E",
            templateUrl : "movie.html",
            controller  : ['$scope', function ($scope) {

            }],
            controllerAs: "movieCtrl"
        }
    });

})();


