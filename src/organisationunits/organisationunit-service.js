angular.module('PEPFAR.dedupe').factory('organisationUnitService', organisationUnitService);

function organisationUnitService(Restangular, notify) {
    return {
        getOrganisationUnitsForLevel: getOrganisationUnitsForLevel
    };

    function getOrganisationUnitsForLevel(level) {
        return Restangular
            .one('organisationUnits').withHttpConfig({cache: true})
            .get({
                level: level || 1
            })
            .then(function (response) {
                return response.organisationUnits || [];
            })
            .then(function (organisationUnits) {
                return _.sortBy(organisationUnits, 'name');
            })
            .catch(function (error) {
                notify.error(error.data + ' (' + error.status + ')');
            });
    }
}
