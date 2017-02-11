'use strict';

angular.module('games', [
    'ui.router',
    'ngMaterial',
    'gametools.component',
    'gametoolsprovincelistitem.component',
    'mapService',
    'vAccordion'
])
.config(['$stateProvider', function($stateProvider) {
    $stateProvider
    .state('games', {
        abstract: true,
        url: '/games',
        template: '<ui-view />'
    })
    .state('games.list', {
        url: '',
        controller: 'GameListController as vm',
        templateUrl: 'app/games/games.html',
        resolve: {
            games: ['gameService', function(gameService) {
                return gameService.getAllOpenGames();
            }]
        }// ,
        // onEnter: ['userService', '$state', function(userService, $state) {
        //     if (!userService.isAuthenticated())
        //         $state.go('main.home');
        // }]
    })
    .state('games.archive', {
        url: '/archive',
        controller: 'GameArchiveController as vm',
        templateUrl: 'app/games/archive/archive.html',
        resolve: {
            games: ['gameService', function(gameService) {
                return gameService.getAllArchivedGames();
            }]
        },
        onEnter: ['userService', '$state', function(userService, $state) {
            userService.blockUnauthenticated();
        }]
    })
    .state('games.new', {
        url: '/new',
        controller: 'NewGameController as vm',
        templateUrl: 'app/games/new/new.html',
        resolve: {
            variants: ['variantService', function(variantService) {
                return variantService.getAllVariants();
            }]
        },
        onEnter: ['userService', '$state', function(userService, $state) {
            userService.blockUnauthenticated();
        }]
    })
    .state('games.view', {
        url: '/:id/{ordinal:int}',
        controller: 'ViewController as vm',
        templateUrl: 'app/games/view/view.html',
        params: {
            ordinal: {
                value: null,
                squash: true,
                dynamic: true
            }
        },
        resolve: {
            mapService: 'mapService',
            game: ['gameService', '$stateParams', function(gameService, $stateParams) {
                return gameService.getGame($stateParams.id);
            }],
            phases: ['gameService', '$stateParams', function(gameService, $stateParams) {
                return gameService.getPhases($stateParams.id);
            }],
            phaseState: ['game', 'gameService', 'mapService', 'phases', '$stateParams', function(game, gameService, MapService, phases, $stateParams) {
                var mapService = new MapService(null, game, phases.Properties, null, null, null, $stateParams.ordinal),
                    phase = mapService.getCurrentPhase();

                // No phase? No phase state.
                if (phase)
                    return gameService.getPhaseState($stateParams.id, phase.Properties);
                else
                    return null;
            }],
            options: ['game', 'gameService', 'mapService', 'phases', '$stateParams', function(game, gameService, MapService, phases, $stateParams) {
                var mapService = new MapService(null, game, phases.Properties, null, null, null, $stateParams.ordinal),
                    phase = mapService.getCurrentPhase();
                return gameService.getUserOptionsForPhase(game.Properties, phase.Properties);
            }],
            orders: ['game', 'gameService', 'mapService', 'phases', '$stateParams', function(game, gameService, MapService, phases, $stateParams) {
                var mapService = new MapService(null, game, phases.Properties, null, null, null, $stateParams.ordinal),
                    phase = mapService.getCurrentPhase();

                // No phase? No orders.
                if (phase)
                    return gameService.getPhaseOrders($stateParams.id, phase.Properties);
                else
                    return null;
            }],
            variant: ['variantService', 'game', function(variantService, game) {
                return variantService.getVariant(game.Properties.Variant);
            }],
            svg: ['variantService', 'game', function(variantService, game) {
                return variantService.getVariantSVG(game.Properties.Variant);
            }]
        },
        onEnter: ['userService', '$state', function(userService, $state) {
            userService.blockUnauthenticated();
        }]
    });
}]);
