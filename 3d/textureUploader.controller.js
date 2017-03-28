(function() {
    'use strict';

    angular
        .module('app.pages.editor')
        .controller('textureUploaderController', ['$scope', '$uibModalInstance', 'info', textureUploaderController]);

    /** @ngInject */
    function textureUploaderController($scope, $uibModalInstance, info) {


        console.log(info);

        function init() {
            if(info.textures.length !== 0) {
                $scope.textures = info.textures;
                $scope.initTextureSelection($scope.textures);

                if(info.currentTexture) {
                    $scope.textures[info.currentTexture.textureIndex].selected = true;
                    $scope.selectedTexture = $scope.textures[info.currentTexture.textureIndex];
                }
            }
            else $scope.textures = [];

            $scope.uploadingNow = false;
        }

        $scope.beforeChangedFile = function() {
            $scope.uploadingNow = true;
        };

        $scope.changedFile = function(files,file,newFiles,invalidFiles) {
            console.log(files,file,newFiles,invalidFiles);

            if(!newFiles || !files) return false;

            $scope.initTextureSelection(newFiles);

            if($scope.textures.length === 0) {
                $scope.textures = newFiles;
            }
            else $scope.textures = $.merge($scope.textures, newFiles);

            $scope.setTextureIndex($scope.textures);

            console.log($scope.textures);
            $scope.uploadingNow = false;
        };

        $scope.selectTexture = function(index,$event) {

            $scope.initTextureSelection($scope.textures);

            $scope.textures[index].selected = true;
            $scope.selectedTexture = $scope.textures[index];
        };

        $scope.setTextureIndex = function(textures) {
            for(var i = 0; i < textures.length; i++) {
                textures[i].textureIndex = i;
            }
        };

        $scope.initTextureSelection = function(textures) {
            for(var i = 0; i < textures.length; i++) {
                textures[i].selected = false;
            }
        };

        // CONTROLLER OUTPUT ------>
        $scope.ok = function() {
            $uibModalInstance.close({
                selectedTexture: $scope.selectedTexture,
                textures: $scope.textures
            });
        };

        $scope.cancel = function() {
            $uibModalInstance.dismiss('cancel');
        };

        init();
    }
})();
