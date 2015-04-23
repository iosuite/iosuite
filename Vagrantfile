VAGRANTFILE_API_VERSION = "2"

$script = <<SCRIPT

sudo -i

apt-get update -y
apt-get upgrade -y
apt-get install build-essential -y
apt-get install curl libssl-dev unzip git-core npm -y

cp /var/www/iosuite/server/ngrok /usr/lib/ngrok
alias ngrok=/usr/lib/ngrok

npm install ny -g
ny stable
npm install forever -g
npm install nodemon -g
npm install jshint -g

exit

SCRIPT


Vagrant.configure(VAGRANTFILE_API_VERSION) do |config|

	config.vm.box = "ubuntu/trusty64"

	config.vm.provider "virtualbox" do |v|

		v.name = "iosuite"

		v.memory = 1024

		v.cpus = 2

	end

	config.vm.synced_folder './', '/var/www/iosuite'

	config.vm.provision "shell", inline: $script

	config.vm.hostname = "NSIO"
	config.vm.network "forwarded_port", guest: 8080, host: 8080

#	config.vm.boot_timeout = 60
#	config.vm.provider "virtualbox" do |vb, override|
#		vb.gui = true
#	end

end