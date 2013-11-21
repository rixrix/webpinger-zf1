var pingApp = angular.module('pingApp.hostFactory', []);

pingApp.factory('hostFactory', function(){
    var hostnames = [],
        hostnameService = {};

    /**
     * Adds a new item. It does have a basic validation whether the host/ip already exists.
     *
     * @param string    Hostname or IP
     */
    hostnameService.addItem = function(host) {
        if (host) {
            if (hostnames.indexOf(host) == -1) {
                hostnames.push(host);
            } else {
                alert(host + ' already exists!');
            }
        }
    }

    /**
     * Removes an item from the list.
     *
     * @param string    Hostname or IP
     */
    hostnameService.removeItem = function(host) {
        var idx = hostnames.indexOf(host);
        if (idx != -1) {
            hostnames.splice(idx, 1);
        }
    }

    /**
     * Returns the list of hostname/IP addresses added by the user.
     *
     * @returns {Array} hostname/IP
     */
    hostnameService.list = function() {
        return hostnames;
    }

    return hostnameService;
});