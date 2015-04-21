angular.module('PEPFAR.dedupe').controller('appController', appController);

function appController(dedupeService, dedupeRecordFilters, $scope, $modal, notify, DEDUPE_PAGE_SIZE) {
    var ctrl = this;
    var dedupeFilters = {
        includeResolved: false,
        ty: 'PURE'
    };

    ctrl.isFilterToggle = false;
    ctrl.noLoadDone = true;
    ctrl.isProcessing = false;
    ctrl.dedupeRecords = [];
    ctrl.allDedupeRecords = [];
    ctrl.pager = {
        current: 1,
        total: 0,
        pageSize: DEDUPE_PAGE_SIZE
    };

    //Controller methods
    ctrl.useMax = useMax;
    ctrl.useSum = useSum;
    ctrl.resolveDuplicates = resolveDuplicates;
    ctrl.changedIncludeResolved = changedIncludeResolved;
    ctrl.isShowingAll = isShowingAll;
    ctrl.getDuplicateRecords = getDuplicateRecords;
    ctrl.pageChanged = pageChanged;
    ctrl.filters = dedupeRecordFilters;
    ctrl.showCrossWalkMessage = showCrossWalkMessage;
    ctrl.isShowingCrosswalkDedupes = isShowingCrosswalkDedupes;

    $scope.$on('DEDUPE_DIRECTIVE.resolve', function (event, dedupeRecordId, saveStatus) {

        //Remove the resolved record from the list of shown records
        ctrl.dedupeRecords = ctrl.dedupeRecords.filter(function (dedupeRecord) {
            return dedupeRecord.id !== dedupeRecordId;
        });

        reportStatusToUser(saveStatus);
    });

    $scope.$on('DEDUPE_RECORDFILTER_SERVICE.updated', function (event, dedupeRecordFilters) {
        dedupeFilters.ou = dedupeRecordFilters.ou;
        dedupeFilters.pe = dedupeRecordFilters.pe;
        dedupeFilters.tr = dedupeRecordFilters.tr;
        dedupeFilters.ty = dedupeRecordFilters.ty;

        ctrl.getDuplicateRecords();
    });

    function getDuplicateRecords() {
        ctrl.isProcessing = true;

        dedupeService.getDuplicateRecords(dedupeFilters.ou, dedupeFilters.pe, dedupeFilters.includeResolved, dedupeFilters.tr, ctrl.pager.current, dedupeFilters.ty)
            .then(addPeriodInformationToRecords)
            .then(function (duplicateRecords) {
                ctrl.allDedupeRecords = ctrl.dedupeRecords = duplicateRecords;

                adjustPager(duplicateRecords.totalNumber);

                if (ctrl.allDedupeRecords.length === 0 && dedupeFilters.ou && dedupeFilters.pe) {
                    notifyUserIfNoRecordsWereFound();

                    if (dedupeFilters.ty === 'PURE') {
                        ctrl.showCrossWalkMessage();
                    }
                }

                if (dedupeFilters.ou && dedupeFilters.pe) {
                    ctrl.noLoadDone = false;
                }

                return duplicateRecords;
            })
            .catch(function (errorMessage) {
                notify.error(errorMessage || 'An error occurred when loading the dedupe records.');
            })
            .finally(setProcessingToFalse);
    }

    function addPeriodInformationToRecords(duplicateRecords) {
        duplicateRecords.forEach(function (duplicateRecord) {
            duplicateRecord.details.timePeriodName = dedupeRecordFilters.getPeriodName();
            duplicateRecord.details.timePeriodDisplayName = dedupeRecordFilters.getPeriodDisplayName();
        });

        return duplicateRecords;
    }

    function showCrossWalkMessage() {
        var modal;

        if (ctrl.dedupeRecords.length === 0) {
            modal = $modal.open({
                template: [
                   '<p>There are no more PURE dedupes to be done for this organisation unit and period, would you like to dedupe the CROSSWALK duplicates?</p>',
                   '<button class="btn btn-primary" ng-click="$close()">Yes, please!</button><button class="btn btn-default" ng-click="$dismiss()">No, thanks.</button>'
                   ],
                size: 'sm',
                windowClass: 'dedupe-confirm-box'
            });

            modal.result
                .then(function () {
                    dedupeRecordFilters.changeIsCrosswalk(true);
                });
        }
    }

    function isShowingCrosswalkDedupes() {
        return dedupeFilters.ty === 'CROSSWALK';
    }

    function adjustPager(total) {
        if (total) {
            ctrl.pager.total = total;
        }
    }

    function notifyUserIfNoRecordsWereFound() {
        notify.warning('No records were found for the given criteria');
    }

    function changedIncludeResolved() {
        dedupeFilters.includeResolved = !dedupeFilters.includeResolved;

        getDuplicateRecords();
    }

    function pageChanged() {
        return getDuplicateRecords();
    }

    function isShowingAll() {
        return dedupeFilters.includeResolved;
    }

    function reportStatusToUser(saveStatus) {
        if (saveStatus.successCount > 0) {
            notify.success(saveStatus.successCount === 1 ? 'Deduplication resolved.' : [saveStatus.successCount, ' deduplication(s) resolved.'].join(' '));
        }

        if (saveStatus.errorCount > 0) {
            notify.error(['Unable to resolve', saveStatus.successCount, 'dedupe(s).'].join(' '));
        }

        (saveStatus.errors || []).forEach(function (error) {
            notify.warning(error.message);
        });
    }

    function useMax() {
        resolveDedupeRecordsUsingPredefinedType('max', dedupeService.getMax);
    }

    function useSum() {
        resolveDedupeRecordsUsingPredefinedType('sum', dedupeService.getSum);
    }

    function resolveDedupeRecordsUsingPredefinedType(typeName, typeFunction) {
        if (!Array.isArray(ctrl.dedupeRecords)) { return; }

        ctrl.dedupeRecords.forEach(function (item) {
            item.resolve.type = typeName;
            item.resolve.value = typeFunction.apply(dedupeService, [item.data]);
        });
    }

    function resolveDuplicates() {
        ctrl.isProcessing = true;

        dedupeService.resolveDuplicates(ctrl.dedupeRecords)
            .then(function (saveStatus) {
                reportStatusToUser(saveStatus);
            })
            .catch(function (errorMessage) {
                notify.error(errorMessage);
            })
            .finally(setProcessingToFalse);
    }

    function setProcessingToFalse() {
        ctrl.isProcessing = false;
    }
}
