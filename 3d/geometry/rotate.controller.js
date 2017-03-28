(function() {
    'use strict';

    angular
        .module('app')
        .directive('rotateTool', rotateTool);

    /* @ngInject */
    function rotateTool() {
        var directive = {
            restrict: 'EA',
            templateUrl: 'app/directive/tools/3d/geometry/rotate.tmpl.html',
            scope: {
                scene: '=',
                renderer: '='
            },
            link: link,
            controller: ['$rootScope', '$scope', '$element', 'ModelControlService', controller]
        };

        return directive;

        function link($scope, $element, $attrs) {
            $scope.toggleOn = false;
        }
        function controller($rootScope, $scope, $element, ModelControlService) {

            $scope.toggleAction = function(newValue,oldValue) {
                console.log(newValue);
                if(newValue) {
                    ModelControlService.attach($scope.scene,$scope.renderer,'rotate');
                }
                else {
                    ModelControlService.remove($scope.scene);
                }
            };

            $scope.rotateCW = function(coordinate) { // +
                var object = $scope.scene.getObjectByName('mainObject');

                object.rotation[coordinate] += Math.PI / 2;
                console.log(object.rotation);
            };
            $scope.rotateCCW = function(coordinate) { // -
                var object = $scope.scene.getObjectByName('mainObject');

                object.rotation[coordinate] -= (Math.PI / 2);
                console.log(object.rotation);
            };
        }
    }
})();
