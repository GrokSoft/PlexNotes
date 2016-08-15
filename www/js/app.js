/**
 * Created by Bill on 8/14/2016.
 * Copyright (c) 2016. GrokSoft LLC All Rights Reserved
 */
"use strict";

(function () {
   var app = angular.module('plexNotes', ['media-directives']);

   app.controller('PlexNotesController', ['$http', function ($http)
   {
      var plexNotes = this;
      var movies = [];

      // Get the data for the drinks
     /* $http.get('movies.json').success(function (data)
      {
         plexNotes.movies = data;
      });*/
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