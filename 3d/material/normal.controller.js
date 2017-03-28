(function() {
    'use strict';

    angular
        .module('app')
        .directive('normalTool', normalTool);

    /* @ngInject */
    function normalTool() {
        var directive = {
            restrict: 'EA',
            templateUrl: 'app/directive/tools/3d/material/normal.tmpl.html',
            scope: {
                scene: '=',
                renderer: '=',
                output: '=',
                textures: '='
            },
            link: link,
            controller: ['$rootScope', '$scope', '$element', '$timeout', '$uibModal', 'TextureService',controller]
        };

        return directive;

        function link($scope, $element, $attrs) {
            // console.log('normalController',$scope);
            $scope.object = $scope.scene.getObjectByName('mainObject');

            $scope.modelNormalScale = $scope.output ? $scope.output.normalScale.x * 100 : 100;
            // NORMAL SCALE -> Vector2 { width, height, x, y}

            $scope.sliderOptions = {
                floor: 0,
                ceil: 100,
                step: 1,
                showSelectionBar: true,
                onChange: $scope.changeNormalScale
            };

            $scope.selectedTab = 'texture';

            $scope.$watch('output',function(newValue, oldValue){
                // console.log('-----------------------------NORMAL TOOL CATCHED----------------------------------');
                // console.log('-----------------------------MATERIAL IS CHANGED-----------------------------------');
                // console.log(oldValue,'->',newValue);
                // console.log($scope);

                $scope.currentTextureIndex = ($scope.output && $scope.output.normalMap) ?
                    $scope.output.normalMap.textureIndex : -1;

                $scope.selectedTexture = $scope.currentTextureIndex >= 0 ?
                    $scope.textures[$scope.currentTextureIndex] : null;
                $scope.modelNormalScale = $scope.output.normalScale.x * 100;
                // console.log($scope.currentTextureIndex,$scope.selectedTexture);
            });

        }
        function controller($rootScope, $scope, $element, $timeout, $uibModal, TextureService) {

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
                                currentTexture: $scope.output.normalMap
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
                                $scope.output.normalMap = res;
                                $scope.output.needsUpdate = true;
                            }
                        });
                    }
                    else return false;
                }
            };

            // OPACITY METHOD
            $scope.changeNormalScale = function() {

                var val = $scope.modelNormalScale * 0.01;
                var normalScale = new THREE.Vector2(val,val); // {x,y}

                if($scope.output) $scope.output.normalScale = normalScale;
                else return false;
            };
        }
    }
})();
