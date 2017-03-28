(function() {
    'use strict';

    angular
        .module('app')
        .directive('materialSelector', materialSelector);

    /* @ngInject */
    function materialSelector() {
        var directive = {
            restrict: 'EA',
            templateUrl: 'app/directive/tools/3d/material/material.tmpl.html',
            scope: {
                scene: '=',
                renderer: '=',
                output: '='
            },
            link: link,
            controller: ['$rootScope', '$scope', '$element', controller]
        };

        return directive;

        function link($scope, $element, $attrs) {
            var object = $scope.scene.getObjectByName('mainObject');

            $scope.materialList = object.material.materials;
            $scope.output = $scope.materialList[0];
        }
        function controller($rootScope, $scope, $element) {
            $scope.selectBoxOptions = {
                containerCssClass: 'black full-width',
                dropdownCssClass: 'black',
                minimumResultsForSearch: -1
            };
        }
    }
})();
