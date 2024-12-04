# Sana Website Development

## How to: Production Deployment

Clone the GitHub into `sana.ics.uci.edu` on OpenLab, then run `npx react-scripts build`. This will build and place the build files in `public_html`, where it is ready to be served.

## How to: Production Environment Testing

To test the application on an environment similar to that of the production environment, you can deploy it on your own personal `students.ics.uci.edu` webpage. Follow the guide [here](https://ics.uci.edu/~djpatter/classes/2010_09_INF133/misc/logon/www.ics.uci.edu/~avaladar/index.html) to get started. Use whichever utility to connect to your student account.

The `students.ics.uci.edu` doesn't allow Node, thus you can't simply clone the repository and run `./build.sh`. You have to build it on your own personal computer, then transfer the files (both the built `public_html` folder and any other important files) to the root of your `students.ics.uci.edu` account. You will need to use SFTP for this.

To build on your own machine for production environment testing, you need to set a specific environment variable. Create a file `.env.local` at the base of the project, and set `REACT_APP_BASENAME="/~ucinetid/"`, replacing with your UCI Net ID.
