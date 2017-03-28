(function() {
    'use strict';

    angular
        .module('app')
        .directive('specularTool', specularTool);

    /* @ngInject */
    function specularTool() {
        var directive = {
            restrict: 'EA',
            templateUrl: 'app/directive/tools/3d/material/specular.tmpl.html',
            scope: {
                scene: '=',
                renderer: '=',
                output: '=',
                textures: '='
            },
            link: link,
            controller: ['$rootScope', '$scope', '$element', '$timeout', '$uibModal', 'TextureService', controller]
        };

        return directive;

        function link($scope, $element, $attrs) {
            // console.log('specularController',$scope);
            $scope.object = $scope.scene.getObjectByName('mainObject');

            $scope.modelShininess = $scope.output ? $scope.output.shininess : 100;
            $scope.modelColor = $scope.output ?
                '#' + $scope.output.specular.getHexString():
                '#' + $scope.object.material.materials[0].specular.getHexString();
            console.log($scope.modelColor);

            $scope.sliderOptions = {
                floor: 0,
                ceil: 100,
                step: 1,
                showSelectionBar: true,
                onChange: $scope.changeShininess
            };

            $scope.selectedTab = 'texture';

            $scope.$watch('output',function(newValue, oldValue){
                // console.log('----------------------------SPECULAR TOOL CATCHED---------------------------------');
                // console.log('-----------------------------MATERIAL IS CHANGED-----------------------------------');
                // console.log(oldValue,'->',newValue);
                // console.log($scope);

                $scope.currentTextureIndex = ($scope.output && $scope.output.specularMap) ?
                    $scope.output.specularMap.textureIndex : -1;

                $scope.selectedTexture = $scope.currentTextureIndex >= 0 ?
                    $scope.textures[$scope.currentTextureIndex] : null;
                $scope.modelShininess = $scope.output.shininess;
                // console.log($scope.currentTextureIndex,$scope.selectedTexture);
            });

        }
        function controller($rootScope, $scope, $element, $timeout, $uibModal, TextureService) {
            // TAB ACTION
            $scope.tabAction = function(value) {
                $scope.selectedTab = value;
                $timeout(function () { $scope.$broadcast('rzSliderForceRender'); });
                console.log($scope.selectedTab);
            };

            // TEXTURE METHOD
            $scope.modalOpen = function(size) {
                console.log($scope);
                var instance = $uibModal.open({
                    animation: true,
                    ariaLabelledBy: 'modal-title',
                    ariaDescribedBy: 'modal-body',
                    backdrop: true,
                    templateUrl: 'app/directive/tools/3d/textureUploader.tmpl.html',
                    size: size,
                    resolve: {
                        info: function() {
                            return {
                                textures: $scope.textures,
                                type: 'specular',
                                currentMaterial: $scope.output,
                                currentTexture: $scope.output.specularMap
                            };
                        }
                    },
                    controller: 'textureUploaderController'
                });

                instance.result.then(function(res) {
                    console.log(res);
                    $scope.selectedTexture = res.selectedTexture;
                    $scope.textures = res.textures;
                    $scope.bindMaterial(res.selectedTexture);
                });
            };

            // TEXTURE CHANGE METHOD
            $scope.bindMaterial = function(tex) {
                if(tex){
                    var texConstructor = tex.constructor.name;
                    var index = tex.textureIndex;
                    console.log('THIS TEXTURE IS : ',texConstructor,index);

                    if(texConstructor === 'File') {
                        console.log(tex,index);
                        TextureService.get(tex,function(res){
                            res.textureIndex = index;
                            console.log(res);
                            if($scope.output) {
                                $scope.output.specularMap = res;
                                $scope.output.needsUpdate = true;
                            }
                        });
                    }
                    else return false;
                }
            };

            // COLOR METHOD
            $scope.changeColor = function(color) {
                var textureColor = new THREE.Color(color);
                if($scope.output) $scope.output.specular = textureColor;
            };

            // OPACITY METHOD
            $scope.changeShininess = function() {
                var shininess= $scope.modelShininess;

                if($scope.output) $scope.output.shininess = shininess;
                else return false;
            };
        }
    }
})();
