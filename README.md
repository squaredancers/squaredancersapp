# This web application is intended for scheduling and tracking square dancing members and callers.

## Prerequisites for running this application

1. npm version 11.13.0 or higher needs to be installed. This application installs third party packages that are required by this application. [Here is a link to where to download this software](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
1. Git bash is required to download this application from github and run simple bash scripts. [Here is a link to download Git Bash](https://git-scm.com/install/)

## Installation instructions

Once the above prerequistes have been installed follow these steps to setup the application.

1. Open a git bash command dialog.
1. Create a directory where you want to install this application.
1. Change your directory to this newly created directory.
1. Run this git command to download this application <br/>
   `git clone https://github.com/squaredancers/squaredancersapp.git`
1. Change your directory to squaredancersapp/server
1. Run this command `./setup.sh` Note: the screen may look like it is stuck, please wait a few minutes for the installation process to complete.
1. If you want to create an empty database run this command `npm run update`
1. If you have an existing square dancing database copy it to this directory(ie. squaredancersapp/server). Make sure that the name of the database is called squaredance.db
1. Run the command `npm start` This command will start the application server and open up a browser session in your default browser. Note: if you get a message about the application being unsecure click the button that will allow the application to proceed. Note2: each time you want to start the server use this npm start command from the server directory. To stop the server just enter ctrl-c.
1. You should see the full square dancing application come up.
