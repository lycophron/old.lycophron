# lycophron
A stupid anagram solver supporting multiple languages with a few sample applications.

## Getting started

### Development

1. Clone the repo
2. `npm install`
3.  If you use authentication
 - `export GOOGLE_CLIENT_ID=...`
 - `export GOOGLE_CLIENT_SECRET=...`
4. `npm test` - run all tests
5. `node server` - start the webserver
6. Edit users.json, who can access to the game.

### Deployment

#### AWS example
 * Allocate new EC2 instance (e.g. t1.micro) with a Ubuntu 64-bit image
 * Associate public IP and set firewall rules (Security Group) for service ports
 * Log-in via SSH and
 * Run `sudo apt-get -y update && sudo apt-get upgrade`
 * Tweak `sudo vi /etc/hostname` (reflect your choice of DNS name)
 * Tweak `.ssh/authorized_keys`
 * Run `sudo apt-get -y install git build-essential curl`
 * Run `curl -sL https://deb.nodesource.com/setup | sudo bash -`
 * Run `sudo  apt-get install -y nodejs`


1. Clone the project `git clone https://github.com/lycophron/lycophron.git`
2. `cd lycophron`
3. `cp lycophron.conf.sample lycophron.conf`
4. Adjust settings to your needs in `lycophron.conf`
5. `sudo cp lycophron.conf /etc/init/lycophron.conf`
6. `npm install`
7. `sudo service lycophron start`

TODO: pull latest source from github after git push.


## Licensed under MIT

See [LICENCE](LICENSE) file.
