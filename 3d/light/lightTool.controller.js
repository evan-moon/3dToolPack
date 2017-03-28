(function() {
    'use strict';

    angular
        .module('app')
        .directive('lightTool', lightTool);

    /* @ngInject */
    function lightTool() {
        var directive = {
            restrict: 'EA',
            templateUrl: 'app/directive/tools/3d/light/lightTool.tmpl.html',
            scope: {
                scene: '=',
                renderer: '=',
                output: '='
            },
            link: link,
            controller: ['$rootScope', '$scope', '$element', '$timeout', 'LightGenerateService', controller]
        };

        return directive;

        function link($scope, $element, $attrs) {
            $scope.maxLightsLength = 3;
            $scope.lights = $scope.output;
            $scope.selectedLight = null;
            $scope.lightTypes = ['directional','spot','point'];

            $scope.sliderOptions = [{
                floor: 0,
                ceil: 100,
                step: 1,
                showSelectionBar: true,
                onChange: $scope.changeIntensity
            },{
                floor: 1,
                ceil: 100,
                step: 1,
                showSelectionBar: true,
                onChange: $scope.changeDistance
            },{
                floor: 10,
                ceil: 90,
                step: 1,
                showSelectionBar: true,
                onChange: $scope.changeAngle
            },{
                floor: 0,
                ceil: 100,
                step: 1,
                showSelectionBar: true,
                onChange: $scope.changeSoftness
            }];

            // INIT SETTING.... Don't Change these values
            $scope.initConfig = {
                type: 'directional',
                color: '#ffffff',
                intensity: 50,
                distance: 50,
                angle: 20,
                softness: 100
            };

            $scope.config = angular.copy($scope.initConfig);

            // SET INIT LIGHT TEMP....
            for(var i = 0; i < $scope.maxLightsLength; i++) {
                $scope.lights[i] = {
                    name: 'light' + (i+1),
                    enable: false,
                    object: null,
                    index: i,
                    config: angular.copy($scope.initConfig)
                };
            }
        }

        function controller($rootScope, $scope, $element, $timeout, LightGenerateService) {
            'use stict';
            // BIND DOM EVENT
            var camera = $scope.scene.getObjectByName('mainCamera'),
                domEvents = new THREEx.DomEvents(camera,$scope.renderer.domElement);

            $scope.lightClickEvent = function(event) {
                var index = (event.target.name.split('t')[1] * 1) - 1;
                console.log(event,index);
                $scope.changeLight(index);
            };

            $scope.changeLight = function(index) {
                if($scope.lights[index].name === $scope.selectedLight.name) return false;

                if($scope.lights[index].enable) {
                    $scope.selectedLight = $scope.lights[index];
                    LightGenerateService.control.attach($scope.scene,$scope.renderer,$scope.selectedLight.name);
                }
                else return false;

                $timeout(function () { $scope.$broadcast('rzSliderForceRender'); });
                console.log($scope.lights,$scope.selectedLight);
            };

            $scope.enableLight = function(newValue,oldValue,target,reload) {
                $timeout(function(){
                    var isExist = $scope.isExistLights();

                    if(newValue) {
                        var newLight = LightGenerateService.create($scope.scene,target.config,target.name);

                        $scope.scene.add(newLight);

                        LightGenerateService.control.attach($scope.scene,$scope.renderer,target.name);
                        $scope.selectedLight = target;
                        $scope.selectedLight.object = $scope.scene.getObjectByName(target.name);

                        $scope.changeLight(target.index);

                        $scope.$broadcast('rzSliderForceRender');

                        domEvents.addEventListener(newLight,'click', $scope.lightClickEvent);
                    }
                    else {
                        domEvents.removeEventListener($scope.scene.getObjectByName(target.name),'click', $scope.lightClickEvent);
                        LightGenerateService.destroy($scope.scene,target.name);
                        if(!reload) {
                            target.config = angular.copy($scope.initConfig);
                            target.object = null;
                        }

                        if(isExist.length === 0) {
                            LightGenerateService.control.remove($scope.scene);
                            $scope.selectedLight = null;
                        }
                        else if((isExist.length > -1) && (target.name !== isExist[0].name)) {
                            LightGenerateService.control.attach($scope.scene,$scope.renderer,isExist[0].name);
                            $scope.selectedLight = isExist[0];
                        }
                    }
                    console.log(newValue ? 'turn on' : 'turn off',$scope.selectedLight);
                });
            };

            $scope.changeLightType = function(type) {
                console.log(type);

                if($scope.selectedLight.name === type) return false;

                // CHANGE LIGHT START...
                $scope.selectedLight.config.type = type;
                // SAVE POSITION
                var beforePosition = {
                    x: $scope.selectedLight.object.children[0].position.x,
                    y: $scope.selectedLight.object.children[0].position.y,
                    z: $scope.selectedLight.object.children[0].position.z
                };
                // MANUALLY TURN OFF THIS LIGHT AND TURN ON AGAIN BY NEW TYPE
                $scope.enableLight(false, true, $scope.selectedLight,true);
                $scope.enableLight(true, false, $scope.selectedLight);

                $timeout(function(){
                    $scope.selectedLight.object.children[0].position.set(
                        beforePosition.x, beforePosition.y, beforePosition.z
                    );
                    $scope.scene.getObjectByName('lightController').update();
                });

                console.log(beforePosition,$scope.selectedLight.object);
            };

            // LIGHT CONTROLS...
            $scope.changeColor = function(color) {
                // ALL LIGHTS
                if($scope.selectedLight) {
                    var newColor = new THREE.Color(color);
                    $scope.selectedLight.object.children[0].color = newColor;
                    $scope.selectedLight.object.children[1].update();
                }
            };

            $scope.changeIntensity = function(id,val){
                // ALL LIGHTS
                if($scope.selectedLight) {
                    $scope.selectedLight.object.children[0].intensity = val * 0.01;
                    $scope.selectedLight.object.children[1].update();
                }
            };

            $scope.changeDistance = function(id,val){
                // SPOT, POINT
                if($scope.selectedLight) {
                    $scope.selectedLight.object.children[0].distance = val;
                    $scope.selectedLight.object.children[1].update();
                }
            };

            $scope.changeAngle = function(id,val){
                // SPOT
                if($scope.selectedLight) {
                    $scope.selectedLight.object.children[0].angle = val * 0.01;
                    $scope.selectedLight.object.children[1].update();
                }
            };

            $scope.changeSoftness = function(id,val){
                // SPOT
                if($scope.selectedLight) {
                    $scope.selectedLight.object.children[0].penumbra = val * 0.01;
                    $scope.selectedLight.object.children[1].update();
                }
            };

            $scope.isExistLights = function() {
                var result = $scope.lights.filter(function(v,i){
                    return v.enable;
                });
                return result;
            };
        }
    }
})();
