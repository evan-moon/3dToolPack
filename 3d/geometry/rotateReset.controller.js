(function() {
    'use strict';

    angular
        .module('app')
        .directive('rotateResetTool', rotateResetTool);

    /* @ngInject */
    function rotateResetTool() {
        var directive = {
            restrict: 'EA',
            templateUrl: 'app/directive/tools/3d/geometry/rotateReset.tmpl.html',
            scope: {
                scene: '=',
                renderer: '='
            },
            link: link,
            controller: ['$rootScope', '$scope', '$element', controller]
        };

        return directive;

        function link($scope, $element, $attrs) {

        }
        function controller($rootScope, $scope, $element) {
            // console.log($scope.scene,$scope.renderer);
            $scope.initEuler = function(axis) {
                // MESH의 ROTATION Euler의 초기값이 -0인 경우가 있음. 알아낼 것
                // 2016.09.12 09:12 - evan
                var object = $scope.scene.getObjectByName('mainObject');
                event.stopPropagation();
                console.log(axis);
                console.log(object);

                var newEuler = new THREE.Euler().copy(object.rotation);

                switch(axis) {
                    case 'x' : newEuler.x = 0; break;
                    case 'y' : newEuler.y = 0; break;
                    case 'z' : newEuler.z = 0; break;
                    default: return false;
                }

                object.setRotationFromEuler(newEuler);
            };

        }
    }
})();
