(function(){

  'use strict';

  angular.module('eliteApp')
    .factory( 'eliteApi', [ '$http', '$q', '$ionicLoading', 'CacheFactory', eliteApi ] );

  function eliteApi( $http, $q, $ionicLoading, CacheFactory ) {

    self.leaguesCache    = CacheFactory.get( "leaguesCache" );
    self.leagueDataCache = CacheFactory.get( "leagueDataCache" );

    if ( self.leaguesCache ) {
      self.leaguesCache.setOptions({
        onExpire: function ( key, value ) {
          getLeagues()
            .then(function () {
              console.log( 'League Data Cache was automatically refreshed' );
            }, function () {
              console.log( 'Error getting data. Putting expired items back into the cache', new Date() );
              self.leagueDataCache.put( key, value );
            });
        }
      });
    }

    if ( self.leagueDataCache ) {
      self.leagueDataCache.setOptions({
        onExpire: function ( key, value ) {
          getLeagueData()
            .then(function () {
              console.log( 'Leagues cache was automatically refreshed' );
            }, function () {
              console.log( 'Error getting data. Putting expired items back into the cache', new Date() );
              self.leaguesCache.put( key, value );
            });
        }
      });
    }

    self.staticCache = CacheFactory.get( "staticCache" ) ? CacheFactory.get( "staticCache" ) : CacheFactory( "staticCache" );

    function setLeagueId( leagueId ) {
      self.staticCache.put("currentLeagueId", leagueId);
    }

    function getLeagueId() {
      return self.staticCache ? self.staticCache.get("currentLeagueId") : null;
    }

    function getLeagues(){
      
      var deferred = $q.defer(),
          cacheKey = "leagues",
          leaguesData = null;

      if ( self.leaguesCache ) {
        leaguesData = self.leaguesCache.get( cacheKey )
      } else {
        self.leaguesCache = CacheFactory( cacheKey );
      }

      $ionicLoading.show( { template: 'Loading...' } );

      if ( leaguesData ) {

        console.log( "Found data inside cache ", leaguesData );
        $ionicLoading.hide();
        deferred.resolve( leaguesData );

      } else {

        $http.get("http://elite-schedule.net/api/leaguedata")
          .success(function( data ){

            $ionicLoading.hide();
            console.log('Received data via HTTP');
            self.leaguesCache.put( cacheKey, data );
            deferred.resolve( data );

          })
          .error(function() {

            $ionicLoading.hide();
            console.log("Error while making HTTP call.");
            deferred.reject();

          });

      }

      return deferred.promise;

    }

    function getLeagueData(){
    
      var deferred = $q.defer(),
          cacheKey = "leagueData-" + getLeagueId(),
          leaguesData = null;

      if ( self.leagueDataCache ) {
        leaguesData = self.leagueDataCache.get( cacheKey )
      } else {
        self.leagueDataCache = CacheFactory( cacheKey );
      }

      $ionicLoading.show( { template: 'Loading...' } );

      if ( leaguesData ) {

        console.log( "Found data inside cache ", leaguesData );
        $ionicLoading.hide();
        deferred.resolve( leaguesData );

      } else {

        $http.get("http://elite-schedule.net/api/leaguedata/" + getLeagueId())
          .success(function( data, status ) {

            $ionicLoading.hide();
            console.log( "Received schedule data via HTTP", data, status );
            self.leagueDataCache.put( cacheKey, data );
            deferred.resolve( data );

          })
          .error(function() {

            $ionicLoading.hide();
            console.log("Error while making HTTP call.");
            deferred.reject();

          });

      }

      return deferred.promise;

    };

    return {
        getLeagues: getLeagues,
        getLeagueData: getLeagueData,
        setLeagueId: setLeagueId
    };

  }

})();