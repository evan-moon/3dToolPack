(function() {
    'use strict';

    angular
        .module('app')
        .directive('viewModeTool', viewModeTool);

    /* @ngInject */
    function viewModeTool() {
        var directive = {
            restrict: 'EA',
            templateUrl: 'app/directive/tools/3d/geometry/viewmode.tmpl.html',
            scope: {
                scene: '=',
                renderer: '='
            },
            link: link,
            controller: ['$rootScope', '$scope', '$element', controller]
        };

        return directive;

        function link($scope, $element, $attrs) {
            $scope.object = $scope.scene.getObjectByName('mainObject');
        }
        function controller($rootScope, $scope, $element) {

            $scope.modeChange = function(mode) {
                // THIS IS MULTI MATERIAL
                $scope.material = $scope.object ? $scope.object.material : null;

                // THESE ARE EACH MATERIALS IN MULTI MATERIAL
                $scope.materials = $scope.material.materials;

                // SAVE TO TEMP...
                if(!$scope._material_temp) {
                    $scope._material_temp = angular.copy($scope.materials);
                }

                switch(mode){
                    case 'realistic' :
                        materialViewControl(true);
                        xrayViewControl(false);
                        wireframeViewControl(false);
                    break;
                    case 'clean' :
                        materialViewControl(false);
                        xrayViewControl(false);
                        wireframeViewControl(false);
                    break;
                    case 'transparent' :
                        materialViewControl(false);
                        xrayViewControl(true);
                        wireframeViewControl(false);
                    break;
                    case 'wireframe' :
                        materialViewControl(false);
                        xrayViewControl(false);
                        wireframeViewControl(true,false);
                    break;
                    case 'wireclean' :
                        materialViewControl(false);
                        xrayViewControl(false);
                        wireframeViewControl(true,true);
                    break;
                    default: return false;
                }
            };

            function materialViewControl(bool) {
                for(var i = 0; i < $scope.materials.length; i++) {
                    if(bool) {
                        $scope.materials[i].map = angular.copy($scope._material_temp[i].map);

                        if(i === $scope.materials.length - 1) $scope._material_temp = null;
                    }
                    else $scope.materials[i].map = null;

                    $scope.materials[i].needsUpdate = true;
                }
                console.log('---------------------AFTER--------------------------');
                console.log($scope.materials,$scope._material_temp);
            }

            function xrayViewControl(bool) {
                var opacity;
                for(var i = 0; i < $scope.materials.length; i++) {
                    opacity = bool ? 0.5 : 1;
                    $scope.materials[i].opacity = opacity;
                }
            }

            function wireframeViewControl(bool,helper) {
                var model = $scope.scene.getObjectByName('mainObject');

                if(bool){
                    var exist = model.getObjectByName('wireframeHelper');

                    if(!exist){
                        var wireframeHelper = new THREE.WireframeHelper($scope.object,0x48cfad);
                        wireframeHelper.name = "wireframeHelper";
                        model.add(wireframeHelper);
                    }
                    if(!helper) $scope.material.visible = false;
                    else $scope.material.visible = true;
                }
                else{
                    $scope.material.visible = true;
                    model.remove($scope.scene.getObjectByName('wireframeHelper'));
                }
            }
        }
    }
})();
