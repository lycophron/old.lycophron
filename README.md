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

1. Clone the repo
2. `cd lycophron`
3. `cp lycophron.conf.sample lycophron.conf`
4. Adjust settings to your needs in `lycophron.conf`
5. `sudo cp lycophron.conf /etc/init/lycophron.conf`
6. `sudo service lycophron start`

TODO: pull latest source from github after git push.


## Licensed under MIT

See [LICENCE](LICENSE) file.
