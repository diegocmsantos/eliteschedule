(function(){

  'use strict';

  angular.module('eliteApp')
    .controller('LocationsCtrl', [ 'eliteApi', LocationsCtrl ]);

  function LocationsCtrl( eliteApi ) {

    var vm = this;

    eliteApi.getLeagueData()
      .then(function( data ) {

        console.log( data );
        vm.locations = data.locations;

      });

  }

})();