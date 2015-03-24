VAGRANTFILE_API_VERSION = "2"

$script = <<SCRIPT

sudo -i

apt-get update -y
apt-get upgrade -y
apt-get install build-essential -y
apt-get install curl libssl-dev -y
apt-get install git-core -y
apt-get install npm -y

npm install ny -g
ny stable
npm install forever -g

sh /var/www/server/certs.sh

exit

SCRIPT


Vagrant.configure(VAGRANTFILE_API_VERSION) do |config|

	config.vm.box = "ubuntu/trusty64"

	config.vm.provider "virtualbox" do |v|

		v.name = "iosuite"

		v.memory = 1024

		v.cpus = 2

	end

	config.vm.synced_folder './', '/var/www'

	config.vm.provision "shell", inline: $script

	config.vm.hostname = "NSIO"
	config.vm.network "forwarded_port", guest: 8080, host: 8080
	config.vm.network "forwarded_port", guest: 8888, host: 8888

#	config.vm.boot_timeout = 60
#	config.vm.provider "virtualbox" do |vb, override|
#		vb.gui = true
#	end

end