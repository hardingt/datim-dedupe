describe('App controller', function () {
    var dedupeServiceMock;
    var dedupeRecordFiltersMock;
    var notifyMock;
    var $controller;
    var controller;
    var $rootScope;
    var scope;
    var dedupeRecords;

    beforeEach(module('PEPFAR.dedupe'));

    beforeEach(inject(function ($injector) {
        dedupeRecords = [{
            id: '2364f5b15e57185fc6564ce64cc9c629',
            details: {
                orgUnitName: 'Glady\'s clinic',
                timePeriodName: 'FY 2014'
            },
            data: [
                {agency: 'USAID', partner: 'PartnerA', value: 60},
                {agency: 'USAID', partner: 'PartnerB', value: 40},
                {agency: 'USAID', partner: 'PartnerC', value: 20}
            ],
            resolve: {
                type: undefined,
                value: undefined
            }
        }, {
            details: {
                orgUnitName: 'Glady\'s clinic',
                timePeriodName: 'FY 2014',
                type: 'CROSSWALK'
            },
            data: [
                {agency: 'CDC', partner: 'PartnerA', value: 12},
                {agency: 'CDC', partner: 'PartnerD', value: 30},
                {agency: 'CDC', partner: 'PartnerG', value: 10}
            ],
            resolve: {
                type: undefined,
                value: undefined
            }
        }, {
            details: {
                orgUnitName: 'Mark\'s clinic',
                timePeriodName: 'FY 2014'
            },
            data: [
                {agency: 'CDC', partner: 'PartnerD', value: 50},
                {agency: 'CDC', partner: 'PartnerU', value: 20},
                {agency: 'CDC', partner: 'PartnerT', value: 17}
            ],
            resolve: {
                type: 'custom',
                value: -10,
                isResolved: true
            }
        }];

        dedupeRecords.totalNumber = 10;
        dedupeRecords.pageNumber = 1;

        var $q = $injector.get('$q');
        $controller = $injector.get('$controller');

        $rootScope = $injector.get('$rootScope');

        dedupeServiceMock = {
            getMax: jasmine.createSpy('dedupeService.getMax'),
            getSum: jasmine.createSpy('dedupeService.getSum'),
            getDuplicateRecords: jasmine.createSpy('dedupeService.getDuplicateRecords')
                .and.returnValue($q.when(dedupeRecords)),
            resolveDuplicates: jasmine.createSpy('dedupeService.resolveDuplicates')
                .and.returnValue($q.when({
                    successCount: 1,
                    errorCount: 0,
                    errors: []
                }))
        };

        dedupeRecordFiltersMock = {
            onlyNonResolvedRecords: jasmine.createSpy('dedupeRecordFilters.onlyNonResolvedRecords')
                .and.returnValue(dedupeRecords.slice(1)),
            onlyTypeCrosswalk: jasmine.createSpy('dedupeRecordFilters.onlyTypeCrosswalk')
                .and.callFake(function (records) {
                    return records.filter(function (dedupeRecord) {
                        return (dedupeRecord && dedupeRecord.details) && dedupeRecord.details.type === 'CROSSWALK';
                    });
                })
        };

        scope = $rootScope.$new();

        notifyMock = {
            error: jasmine.createSpy('notify.error'),
            warning: jasmine.createSpy('notify.warning'),
            success: jasmine.createSpy('notify.success')
        };

        controller = $controller('appController', {
            dedupeService: dedupeServiceMock,
            dedupeRecordFilters: dedupeRecordFiltersMock,
            $scope: scope,
            notify: notifyMock
        });

        controller.allDedupeRecords = [{
            id: '2364f5b15e57185fc6564ce64cc9c629',
            details: {
                orgUnitName: 'Glady\'s clinic',
                timePeriodName: 'FY 2014'
            },
            data: [
                {agency: 'USAID', partner: 'PartnerA', value: 60},
                {agency: 'USAID', partner: 'PartnerB', value: 40},
                {agency: 'USAID', partner: 'PartnerC', value: 20}
            ],
            resolve: {
                type: undefined,
                value: undefined
            }
        }, {
            details: {
                orgUnitName: 'Glady\'s clinic',
                timePeriodName: 'FY 2014',
                type: 'CROSSWALK'
            },
            data: [
                {agency: 'CDC', partner: 'PartnerA', value: 12},
                {agency: 'CDC', partner: 'PartnerD', value: 30},
                {agency: 'CDC', partner: 'PartnerG', value: 10}
            ],
            resolve: {
                type: undefined,
                value: undefined
            }
        }, {
            details: {
                orgUnitName: 'Mark\'s clinic',
                timePeriodName: 'FY 2014'
            },
            data: [
                {agency: 'CDC', partner: 'PartnerD', value: 50},
                {agency: 'CDC', partner: 'PartnerU', value: 20},
                {agency: 'CDC', partner: 'PartnerT', value: 17}
            ],
            resolve: {
                type: 'custom',
                value: -10,
                isResolved: true
            }
        }];

        controller.dedupeRecords = [{
            id: '2364f5b15e57185fc6564ce64cc9c629',
            details: {
                orgUnitName: 'Glady\'s clinic',
                timePeriodName: 'FY 2014'
            },
            data: [
                {agency: 'USAID', partner: 'PartnerA', value: 60},
                {agency: 'USAID', partner: 'PartnerB', value: 40},
                {agency: 'USAID', partner: 'PartnerC', value: 20}
            ],
            resolve: {
                type: undefined,
                value: undefined
            }
        }, {
            details: {
                orgUnitName: 'Glady\'s clinic',
                timePeriodName: 'FY 2014',
                type: 'CROSSWALK'
            },
            data: [
                {agency: 'CDC', partner: 'PartnerA', value: 12},
                {agency: 'CDC', partner: 'PartnerD', value: 30},
                {agency: 'CDC', partner: 'PartnerG', value: 10}
            ],
            resolve: {
                type: undefined,
                value: undefined
            }
        }];
    }));

    it('should be an object', function () {
        expect(controller).toBeAnObject();
    });

    describe('initialise', function () {
        it('should set processing to true', function () {
            expect(controller.isProcessing).toBe(true);
        });
    });

    describe('useMax', function () {
        beforeEach(function () {
            //Apply rootscope to resolve the mock promise
            $rootScope.$apply();
        });

        it('should set the resolve type to max on all the records', function () {
            controller.useMax();

            expect(controller.dedupeRecords[0].resolve.type).toBe('max');
            expect(controller.dedupeRecords[1].resolve.type).toBe('max');
        });

        it('should call the dedupeService to get the max value', function () {
            controller.useMax();

            expect(dedupeServiceMock.getMax.calls.count()).toBe(2);
            expect(dedupeServiceMock.getMax).toHaveBeenCalledWith(controller.dedupeRecords[0].data);
            expect(dedupeServiceMock.getMax).toHaveBeenCalledWith(controller.dedupeRecords[1].data);
        });

        it('should set the max returned value onto the dedupeRecords', function () {
            dedupeServiceMock.getMax.and.returnValue(60);

            controller.useMax();

            expect(controller.dedupeRecords[0].resolve.value).toBe(60);
            expect(controller.dedupeRecords[1].resolve.value).toBe(60);
        });

        it('should not attempt to map the records if there are none', function () {
            controller.dedupeRecords = undefined;

            controller.useMax();
        });

        it('should not throw an error when dedupeRecords is an empty array', function () {
            controller.dedupeRecords = [];

            controller.useMax();
        });
    });

    describe('useSum', function () {
        beforeEach(function () {
            //Apply rootscope to resolve the mock promise
            $rootScope.$apply();
        });

        it('should set the resolve type to sum on all records', function () {
            controller.useSum();

            expect(controller.dedupeRecords[0].resolve.type).toBe('sum');
            expect(controller.dedupeRecords[1].resolve.type).toBe('sum');
        });

        it('should call the dedupeService to get the sum value', function () {
            controller.useSum();

            expect(dedupeServiceMock.getSum.calls.count()).toBe(2);
            expect(dedupeServiceMock.getSum).toHaveBeenCalledWith(controller.dedupeRecords[0].data);
            expect(dedupeServiceMock.getSum).toHaveBeenCalledWith(controller.dedupeRecords[1].data);
        });

        it('should set the sum returned value onto the dedupeRecords', function () {
            dedupeServiceMock.getSum.and.returnValue(120);

            controller.useSum();

            expect(controller.dedupeRecords[0].resolve.value).toBe(120);
            expect(controller.dedupeRecords[1].resolve.value).toBe(120);
        });

        it('should not attempt to map the records if there are none', function () {
            controller.dedupeRecords = undefined;

            controller.useSum();
        });

        it('should not throw an error when dedupeRecords is an empty array', function () {
            controller.dedupeRecords = [];

            controller.useSum();
        });
    });

    describe('resolveDeduplication', function () {
        beforeEach(function () {
            //Apply rootscope to resolve the mock promise
            $rootScope.$apply();
        });

        it('should be a function', function () {
            expect(controller.resolveDuplicates).toBeAFunction();
        });

        it('should call resolveDeduplication on the dedupeService', function () {
            controller.resolveDuplicates();

            expect(dedupeServiceMock.resolveDuplicates).toHaveBeenCalledWith(controller.dedupeRecords);
        });

        it('should set processing to true', function () {
            controller.resolveDuplicates();

            expect(controller.isProcessing).toBe(true);
        });

        it('should set processing to false after the resolve was completed', function () {
            controller.resolveDuplicates();
            $rootScope.$apply();

            expect(controller.isProcessing).toBe(false);
        });

        it('should remove the the duplicate from the list when it has been resolved', function () {
            $rootScope.$broadcast('DEDUPE_DIRECTIVE.resolve', '2364f5b15e57185fc6564ce64cc9c629', {successCount: 1, errorCount: 0, errors: []});

            expect(controller.dedupeRecords.length).toBe(1);
        });

        it('should log error when getting the records failed', inject(function ($q) {
            dedupeServiceMock.resolveDuplicates
                .and.returnValue($q.reject('Duplicate records passed to resolveDuplicates should be an array with at least one element.'));

            //Recreate controller to re-run the init method with error returning dedupeService
            controller = $controller('appController', {
                dedupeService: dedupeServiceMock,
                $scope: scope,
                notify: notifyMock
            });
            controller.resolveDuplicates();
            $rootScope.$apply();

            expect(notifyMock.error).toHaveBeenCalled();
        }));

        it('should report back the status when it is successful', function () {
            $rootScope.$broadcast('DEDUPE_DIRECTIVE.resolve', '2364f5b15e57185fc6564ce64cc9c629', {successCount: 1, errorCount: 0, errors: []});

            expect(notifyMock.success).toHaveBeenCalled();
        });

        it('should report back when the save failed', function () {
            $rootScope.$broadcast('DEDUPE_DIRECTIVE.resolve', '2364f5b15e57185fc6564ce64cc9c629', {successCount: 0, errorCount: 1, errors: ['Save failed']});

            expect(notifyMock.warning).toHaveBeenCalled();
            expect(notifyMock.error).toHaveBeenCalled();
        });
    });

    describe('includeResolved', function () {
        beforeEach(function () {
            //Apply rootscope to resolve the mock promise
            $rootScope.$apply();

            spyOn(controller, 'getDuplicateRecords');
        });

        it('should update the records when calling changedIncludeResolved', function () {
            controller.changedIncludeResolved();

            expect(dedupeServiceMock.getDuplicateRecords).toHaveBeenCalledWith(undefined, undefined, true, undefined, 1);
        });

        it('should return to only showing the resolved ones', function () {
            controller.changedIncludeResolved();

            expect(dedupeServiceMock.getDuplicateRecords).toHaveBeenCalledWith(undefined, undefined, true, undefined, 1);

            controller.changedIncludeResolved();

            expect(dedupeServiceMock.getDuplicateRecords).toHaveBeenCalledWith(undefined, undefined, false, undefined, 1);
        });
    });

    describe('crosswalk', function () {
        beforeEach(function () {
            //Apply rootscope to resolve the mock promise
            $rootScope.$apply();
        });

        describe('isAllTypeCrosswalk', function () {
            it('should be a function', function () {
                expect(controller.isAllTypeCrosswalk).toBeAFunction();
            });

            it('should return false', function () {
                expect(controller.isAllTypeCrosswalk()).toBe(false);
            });

            it('should return true if only the crosswalk records are visible', function () {
                controller.dedupeRecords = [controller.dedupeRecords[1]];

                expect(controller.isAllTypeCrosswalk()).toBe(true);
            });
        });

        describe('changedOnlyTypeCrosswalk', function () {
            it('should be a function', function () {
                expect(controller.changedOnlyTypeCrosswalk).toBeAFunction();
            });

            it('should call the service with the dedupe records', function () {
                var dedupeRecords = angular.copy(controller.dedupeRecords);
                controller.changedOnlyTypeCrosswalk();

                expect(dedupeRecordFiltersMock.onlyTypeCrosswalk).toHaveBeenCalledWith(dedupeRecords);
            });

            it('should set the deduperecord on the controller to be just the crosswalk records', function () {
                var expectedDedupeRecord = angular.copy(dedupeRecords[1]);

                controller.changedOnlyTypeCrosswalk();

                expect(controller.dedupeRecords.length).toBe(1);
                expect(controller.dedupeRecords[0]).toEqual(expectedDedupeRecord);
            });

            it('should not do anything if the records are already type crosswalk and reset to unresolved', function () {
                controller.dedupeRecords = [angular.copy(dedupeRecords[1])];

                controller.changedOnlyTypeCrosswalk();

                expect(controller.dedupeRecords.length).toBe(3);
            });
        });
    });

    describe('getDuplicateRecords', function () {
        beforeEach(function () {
            controller.isProcessing = false;
            controller.dedupeRecords = [];
            controller.allDedupeRecords = [];
        });

        it('should set processing to true', function () {
            controller.getDuplicateRecords('myorgUnit', '2013April');

            expect(controller.isProcessing).toBe(true);
        });

        it('should set processing to false after duplicate records are loaded', function () {
            controller.getDuplicateRecords('myorgUnit', '2013April');

            $rootScope.$apply();

            expect(controller.isProcessing).toBe(false);
        });

        it('should set all the duplicate records onto the controller', function () {
            controller.getDuplicateRecords('myorgUnit', '2013April');

            $rootScope.$apply();

            expect(controller.allDedupeRecords.length).toBe(3);
        });

        it('should log error when getting the records failed', inject(function ($q) {
            dedupeServiceMock.getDuplicateRecords
                .and.returnValue($q.reject('System setting with id of view not found. Please check if your app is configured correctly.'));
            controller.getDuplicateRecords('myorgUnit', '2013April');

            $rootScope.$apply();

            expect(notifyMock.error).toHaveBeenCalled();
        }));

        it('should add the paging to the controller', function () {
            controller.getDuplicateRecords('myorgUnit', '2013April');

            $rootScope.$apply();

            expect(controller.pager).toEqual({total: 10, current: 1, pageSize: 100});
        });
    });

    describe('changeOrgUnit', function () {
        it('should be a function', function () {
            expect(controller.changeOrgUnit).toBeDefined();
        });

        it('should call the getDuplicateRecords function on the recordService', function () {
            controller.changeOrgUnit({id: 'newOuId'});

            expect(dedupeServiceMock.getDuplicateRecords).toHaveBeenCalledWith('newOuId', undefined, false, undefined, 1);
        });

        it('should not call the service when the orgunit is undefined', function () {
            controller.changeOrgUnit({id: undefined});

            expect(dedupeServiceMock.getDuplicateRecords).not.toHaveBeenCalled();
        });
    });

    describe('changePeriod', function () {
        it('should be a function', function () {
            expect(controller.changePeriod).toBeAFunction();
        });

        it('should call the service for new records when a period has been selected', function () {
            controller.changePeriod({iso: '2013April'});

            expect(dedupeServiceMock.getDuplicateRecords).toHaveBeenCalledWith(undefined, '2013April', false, undefined, 1);
        });

        it('should not call the service if the period iso is not defined', function () {
            controller.changePeriod({iso: undefined});

            expect(dedupeServiceMock.getDuplicateRecords).not.toHaveBeenCalled();
        });
    });

    describe('changeFilterResultsTargets', function () {
        it('should be a function', function () {
            expect(controller.changePeriod).toBeAFunction();
        });

        it('should call the service for records when a filter has been set to empty', function () {
            controller.changeFilterResultsTargets({name: 'Targets'});
            controller.changeFilterResultsTargets(undefined);

            expect(dedupeServiceMock.getDuplicateRecords).toHaveBeenCalledWith(undefined, undefined, false, undefined, 1);
        });

        it('should call the service for records when a filter has been set to targets', function () {
            controller.changeFilterResultsTargets({name: 'Targets'});

            expect(dedupeServiceMock.getDuplicateRecords).toHaveBeenCalledWith(undefined, undefined, false, 'targets', 1);
        });

        it('should call the service for records when a filter has been set to results', function () {
            controller.changeFilterResultsTargets({name: 'Results'});

            expect(dedupeServiceMock.getDuplicateRecords).toHaveBeenCalledWith(undefined, undefined, false, 'results', 1);
        });
    });

    describe('pageChanged', function () {
        it('should call the getDuplicateRecords', function () {
            controller.pager.current = 2;
            controller.pageChanged();

            expect(dedupeServiceMock.getDuplicateRecords).toHaveBeenCalledWith(undefined, undefined, false, undefined, 2);
        });
    });
});
