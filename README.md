# iosuite

## Vagrantfile

The Vagrantfile installs a base node.js server to have a local environment. NPM is installed first then installs the package "n" to manage Node versions. The Node.js version will be the latest stable release.

In order for NetSuite to be able to see your local environment you must setup an ngrok account. The easiest solution would be to reserve your domain which requires the Basic ngrok account. Once reserved you can run "setup {{authtoken}} {{reserved domain}}" on the server. The commands "start" and "stop" create and disable the server respectively.