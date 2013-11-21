var pingApp = angular.module('pingApp.controllers', []);

pingApp.controller('MainController', ['$scope', '$http', '$timeout', 'hostFactory',function($scope, $http, $timeout, hostFactory){

    /* host container from factory */
    $scope.hostsContainer = hostFactory;

    /* temporary container for host for deletion */
    $scope.tmpHostContainer = [];

    var timeoutId,
        timeoutInterval = 10000; // 10000ms = 10s

    /**
     * Asynchronously ping the hosts from the list - only when the list is not empty.
     * The page will restart pinging based on the given timeout interval @timeoutInterval.
     *
     * @param   string  A comma-separated list of hostnames or ip addresses.
     */
    $scope.pingHost = function() {

        if ($scope.hostsContainer.list().length > 0) {

            $http({
                url: '/index/ping',
                method: 'GET',
                params: { hosts: $scope.hostsContainer.list().join(',')}
            })
                .success(function(data, status){
                    if (data) {
                        for (host_id in data) {
                            var latency = 'No response'; // default latency value

                            if (data[host_id] !== undefined && data[host_id] !== null) {
                                latency = data[host_id];
                            }

                            // Update latency data on each item in the table.
                            // Do some extra validation to make sure that the item hasn't been
                            // deleted while the ping request is running in the background.
                            if (document.getElementById(host_id) != null) {
                                angular.element(document.getElementById(host_id)).html(latency);
                            }
                        }
                    }
                })
                .error(function(data, status){
                    if (status == 400) {
                        alert('There was a problem with server when processing your request. Please check the logs for details.');
                        console.log(data);
                    }
                });
        }

        // schedule the ping process
        timeoutId = $timeout(function(){
            $scope.pingHost();
        }, timeoutInterval);

    }

    /**
     * A convenient method to start the ping service
     */
    $scope.startPing = function() {
        $scope.stopPing();
        $scope.pingHost();
    }

    /**
     * A convenient method to stop the ping service.
     */
    $scope.stopPing = function() {
        if (typeof timeoutId === 'object') {
            $timeout.cancel(timeoutId);
        }
    }

    /**
     * Removes the selected host from the list. It's also advisable to cleanup tmpHostContainer to avoid
     * keeping of stale data
     */
    $scope.removeHost = function() {
        if ($scope.tmpHostContainer.length > 0) {
            var tmpHosts = [];
            angular.forEach($scope.tmpHostContainer, function(value, key){
                $scope.hostsContainer.removeItem(value);
                tmpHosts.push(value);
            });

            // cleanup temporary host container
            angular.forEach(tmpHosts, function(value, key){
                if ($scope.tmpHostContainer.indexOf(value) != -1) {
                    $scope.tmpHostContainer.splice($scope.tmpHostContainer.indexOf(value));
                }
            });
        }
    }

    /**
     * Updates the temp container with the selected hostname|ip ready to be removed from the list.
     *
     * @param string    Hostname or IP
     */
    $scope.updateSelection = function(hostId) {
        if($scope.tmpHostContainer.indexOf(hostId) == -1) {
            $scope.tmpHostContainer.push(hostId);
        } else {
            $scope.tmpHostContainer.splice($scope.tmpHostContainer.indexOf(hostId),1);
        }
    }

    /* XXX: Start polling the server after page load */
    $scope.startPing();

}]);