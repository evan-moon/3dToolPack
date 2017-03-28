(function () {
    'use strict';

    angular
        .module('services')
        .factory('ModelLoadService', [
            '$rootScope',
            ModelLoadService
        ]);

    function ModelLoadService($rootScope) {
        var service = {
            combine: combine,
            setMesh: setMesh
        };

        return service;

        function combine(model) {
            console.time('Model combine');
            console.log(model);


            var geometry = new THREE.Geometry();
            var usedMaterials = [],
                materials = [],
                materialNames,
                groupData = [];




            // SEARCH MODEL DATA
            for(var i = 0; i < model.children.length; i++) {
                var eachModel = model.children[i];
                var newGeometry = new THREE.Geometry().fromBufferGeometry(model.children[i].geometry);

                // SET MATERIAL NAME TO GROUP PROPERTY...
                if(eachModel.geometry.groups.length > 0){
                    for(var gi = 0; gi < eachModel.geometry.groups.length; gi++) {
                        eachModel.geometry.groups[gi].name = eachModel.material.materials[gi].name;

                        groupData.push(eachModel.geometry.groups[gi]);
                    }
                }
                else {
                    groupData.push({
                        count: eachModel.geometry.attributes.position.count,
                        name: eachModel.material.name
                    });
                }

                // console.log('group data',groupData);
                // console.log(i,eachModel,eachModel.geometry,eachModel.material);

                if(eachModel.material.type === 'MeshPhongMaterial') usedMaterials.push(eachModel.material);
                else if(eachModel.material.type === 'MultiMaterial'){
                    for(var mi = 0; mi < eachModel.material.materials.length; mi++) {
                        usedMaterials.push(eachModel.material.materials[mi]);
                    }
                }

                // MERGE GEOMETRIES...
                eachModel.updateMatrix();
                geometry.merge(newGeometry,eachModel.matrix);
                // console.log(geometry);
            }



            // SORTING MATERIALS
            usedMaterials = usedMaterials.sort(function (a, b) {
            	return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
            });



            // REMOVE DUPLICATED MATERIALS
            for(var i = 0; i < usedMaterials.length; i++) {
                var isExistMaterial = false;

                // CHECK EXISTING...
                for(var j = 0; j < materials.length; j++){
                    if(materials[j].name === usedMaterials[i].name){
                        isExistMaterial = true;
                        break;
                    }
                    else isExistMaterial = false;
                }

                if(!isExistMaterial) {
                    usedMaterials[i].side = THREE.DoubleSide;
                    usedMaterials[i].transparent = true;
                    usedMaterials[i].needsUpdate = true;
                    usedMaterials[i].index = materials.length;
                    materials.push(usedMaterials[i]);
                }
            }
            materialNames = materials.map(function(v){
                return v.name;
            });
            // console.log(materials,materialNames);



            // BIND MATERIAL
            var faceIndex = 0, groupCount = 0, groupVertexCount = groupData[groupCount].count;
            // console.log(groupData);
            for(var i = 0; i < geometry.vertices.length; i++) {
                var face = geometry.faces[faceIndex];

                if((i+1)%3 === 0) {
                    face.materialIndex = materialNames.indexOf(groupData[groupCount].name) !== -1 ?
                        materialNames.indexOf(groupData[groupCount].name) : 0;
                    faceIndex++;
                }
                // console.log('current face',faceIndex,face,'current material',materials[face.materialIndex],'\n','current group',groupData[groupCount]);
                if(i >= groupVertexCount) {
                    groupCount++;
                    groupVertexCount += groupData[groupCount].count;
                }
            }
            // console.log(geometry.faces);

            // COMPUTE GEOMETRY
            geometry.center();
            // geometry.computeFaceNormals();
			// geometry.computeVertexNormals();
			// geometry.computeBoundingBox();
            geometry.normalize();

            // REDEFINE MODEL
            model.children = [];
            model.add(new THREE.Mesh(geometry,new THREE.MeshFaceMaterial(materials)));
            // console.log(model);

            console.timeEnd('Model combine');

            return model.children[0];
        }

        function setMesh(geometry) {
            var material = new THREE.MeshPhongMaterial();
                material.side = THREE.DoubleSide;
                material.transparent = true;
                material.needsUpdate = true;

            geometry = new THREE.Geometry().fromBufferGeometry(geometry);

            geometry.center();
            geometry.normalize();

            return new THREE.Mesh(geometry,material);
        }
    }
})();
