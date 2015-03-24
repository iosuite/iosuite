# iosuite

## Vagrantfile

The Vagrantfile installs a base io.js server to have a local environment. NPM is installed first then installs the package "ny" to manage iojs versions. The io.js version will be the latest stable release.

In order for NetSuite to be able to see your local environment you must route incoming requests to your ip address to your local machine. By default, the VM is looking for connections through the 8080 port and the 8888 port. A self signed certificate is installed on this server so you can access https://{{yourip}}:8888 (the default secure port is 8888 for the iosuite server).