[![Build Status](https://travis-ci.org/lycophron/lycophron.svg?branch=master)](https://travis-ci.org/lycophron/lycophron)
# lycophron
A stupid anagram solver supporting multiple languages with a few sample applications.

## Important notes

1. All languages contain a sample dictionary `locales/{lang}/default`, which is not an __official__ dictionary.
2. You can add dictionaries that serve your needs.


## Getting started

### Development

1. Clone the repo
2. `npm install`
3.  If you use authentication
 - `export GOOGLE_CLIENT_ID=...`
 - `export GOOGLE_CLIENT_SECRET=...`
4. `npm test` - run all tests
5. `node server` - start the webserver
6. Edit `users.json` to grant access to the game.

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

##### Setup

* Clone the project `git clone https://github.com/lycophron/lycophron.git`
* `cd lycophron`
* `cp lycophron.conf.sample lycophron.conf`
* Adjust settings to your needs in `lycophron.conf`
* `sudo cp lycophron.conf /etc/init/lycophron.conf`
* `npm install`
* `sudo service lycophron start`
* Edit `~/lycophron/users.json` as needed
* Run `crontab -e`


```crontab
# crontab
MAILTO=<fill in>
# m h  dom mon dow   command
45 * * * * curl -s -S -o /dev/null http://localhost/auth/
```

##### Update
```bash
cd ~/lycophron
git pull
npm install
sudo service lycophron restart # if needed, i.e. server/* has changed
```


## Licensed under MIT

See [LICENSE](LICENSE) file.
