# coding=UTF-8
import xmlrpclib
from urlparse import urlsplit

class NoSuchClientException(Exception):
    pass

class SupervisorWebctl(object):
    def __init__(self, hosts):
        self.hosts = {}
        self.clients = {}
        for s in hosts:
            self.add_host(s)

    def _get_host_info(self, proxy, host):
        # TODO get multicall to work
        identification = proxy.supervisor.getIdentification()
        state = proxy.supervisor.getState()
        api_version = proxy.supervisor.getAPIVersion()
        supervisor_version = proxy.supervisor.getAPIVersion()
        pid = proxy.supervisor.getAPIVersion()

        host_info = {
            "identification" : identification,
            "state" : state,
            "api_version" : api_version,
            "supervisor_version" : supervisor_version,
            "pid" : pid
        }

        if not host_info["identification"] or host_info["identification"] == "supervisor":
            url = urlsplit(host)
            host_id = "{0}:{1}".format(url.hostname, url.port)
            host_info["host_id"] = host_id

        return host_info

    def _create_client_proxy(self, host):
        proxy = xmlrpclib.ServerProxy(host)
        host_info = self._get_host_info(proxy, host)
        return host_info, proxy

    def add_host(self, host):
        host_info, proxy = self._create_client_proxy(host)
        self.clients[host_info["host_id"]] = proxy
        self.hosts[host] = host_info

    def _get_proxy(self, host_id):
        proxy = self.clients.get(host_id)
        if proxy is None:
            raise NoSuchClientException("Could not find client with host id {0}".format(host_id))
        return proxy

    def get_client_proxy(self, host_id):
        return self._get_proxy(host_id).supervisor

    def get_system_proxy(self, host_id):
        return self._get_proxy(host_id).system

    def get_process_list(self):
        process_list = []
        for host, host_info in self.hosts.iteritems():
            processes = self.get_client_proxy(host_info["host_id"]).getAllProcessInfo()
            for p in processes:
                p["host_id"] = host_info["host_id"]
            process_list.extend(processes)

        return process_list