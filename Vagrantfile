VAGRANTFILE_API_VERSION = "2"

$script = <<SCRIPT

sudo -i

apt-get update -y
apt-get upgrade -y
apt-get install build-essential -y
apt-get install curl libssl-dev -y
apt-get install git-core -y

mkdir /etc/node

cd /etc/node

# Node install
# wget http://nodejs.org/dist/v0.10.36/node-v0.10.36.tar.gz
# tar zxvf node-v0.10.36.tar.gz --strip-components=1

# io.js install
wget https://iojs.org/dist/v1.3.0/iojs-v1.3.0.tar.gz
tar zxvf iojs-v1.3.0.tar.gz --strip-components=1

./configure
make
make install

exit

cd ~/

sudo npm install learnyounode -g

sudo npm install nodemon -g
sudo npm install forever -g

SCRIPT


Vagrant.configure(VAGRANTFILE_API_VERSION) do |config|

	config.vm.box = "ubuntu/trusty64"

	config.vm.provider "virtualbox" do |v|

		v.name = "nsio"

		v.memory = 1024

		v.cpus = 2

	end

	config.vm.synced_folder './', '/var/www'

	config.vm.provision "shell", inline: $script

	config.vm.hostname = "NSIO"
	config.vm.network "forwarded_port", guest: 8080, host: 15280

#	config.vm.boot_timeout = 60
#	config.vm.provider "virtualbox" do |vb, override|
#		vb.gui = true
#	end

end