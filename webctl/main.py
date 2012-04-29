__author__ = 'Joakim'

from gevent.monkey import patch_all
patch_all()

from webctl.web import app
from webctl.core import SupervisorWebctl

def main():
    hosts = [
        "http://54.247.168.245:9001"
    ]
    app.webctl = SupervisorWebctl(hosts)
    app.run(debug=True)

if __name__ == "__main__":
    main()