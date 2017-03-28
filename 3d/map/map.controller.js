(function() {
    'use strict';

    angular
        .module('app')
        .directive('mapTool', mapTool);

    /* @ngInject */
    function mapTool() {
        var directive = {
            restrict: 'EA',
            templateUrl: 'app/directive/tools/3d/map/map.tmpl.html',
            scope: {
                scene: '=',
                renderer: '=',
                output: '=',
                maps: '='
            },
            link: link,
            controller: ['$rootScope', '$scope', '$element', '$timeout', '$uibModal',controller]
        };

        return directive;

        function link($scope, $element, $attrs) {
            $scope.selectedTab = '3d';
            $scope.mapColor = '#222222';
            $scope.selectedMapIndex = 0;

            $scope.output = {
                type: $scope.selectedTab,
                index: $scope.selectedMapIndex,
                color: $scope.mapColor
            };

            console.log($scope.maps,$scope.output);
            // CONFIG....
        }
        function controller($rootScope, $scope, $element, $timeout, $uibModal) {
            $scope.selectBoxOptions = {
                containerCssClass: 'black full-width',
                dropdownCssClass: 'black',
                minimumResultsForSearch: -1
            };
            
            $scope.changeMap = function(){
                console.log($scope.selectedMapIndex);
                $scope.output = {
                    type: $scope.selectedTab,
                    index: $scope.selectedMapIndex * 1,
                    color: $scope.mapColor
                };
                console.log($scope.maps,$scope.output,$scope.selectedMapIndex);
            };
            $scope.changeColor = function(color){
                $scope.output = {
                    type: $scope.selectedTab,
                    index: $scope.output.index,
                    color: color
                };
            };
            $scope.tabAction = function(value) {
                $scope.selectedTab = value;
                $scope.selectedMapIndex = 0;
                $scope.mapColor = '#222222';

                $scope.output = {
                    type: $scope.selectedTab,
                    index: $scope.selectedMapIndex,
                    color: $scope.mapColor
                };
            };
        }
    }
})();
