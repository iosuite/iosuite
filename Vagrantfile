VAGRANTFILE_API_VERSION = "2"

$script = <<SCRIPT

sudo -i

cp /var/www/iosuite/server/assets/ngrok /usr/lib/ngrok
cp /var/www/iosuite/server/assets/.bash_profile /home/vagrant/.bash_profile

apt-get update -y
apt-get upgrade -y
apt-get install build-essential -y
apt-get install curl libssl-dev git-core npm -y

cp /var/www/iosuite/server/assets/ngrok /usr/lib/ngrok

npm install n pm2 nodemon jshint -g
n stable

cd /var/www/iosuite
npm install

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