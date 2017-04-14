//Create a Heroku remote and configure it to use the same credentials we have here
const child_process = require('child_process');

const secret = require('./server/secret');

//Promisify the running of a subprocess
function run(args, options={}) {
	return new Promise((res, rej) => {
		child_process.execFile(args.shift(), args, options, (e, out, err) => {
			if (e) rej(e);
			else res({out, err});
		});
	});
}

if (!secret.CLIENT_ID || !secret.CLIENT_SECRET) {
	console.error("Please create server/secret.js before using this script.");
	process.exit(1);
}
run(["git", "remote"]).then(proc => {
	if (proc.out.split("\n").includes("heroku")) {
		console.log("Found existing heroku remote - reapplying credentials.");
		return run(["true"]); //Shim because it's a pain to do conditional promises.
	} else {
		return run(["heroku", "create"]);
	}
}).then(proc => {
	console.log(proc.out);
	if (proc.err != "") console.log(proc.err);

	//This is the most important part. It's equivalent to running:
	//heroku config:set CLIENT_ID=yourId123.apps.googleusercontent.com CLIENT_SECRET=yoursecret
	//but with the actual ID and secret taken from the gitignored file in the server directory.
	return run(["heroku", "config:set",
		"CLIENT_ID=" + secret.CLIENT_ID,
		"CLIENT_SECRET=" + secret.CLIENT_SECRET,
	]);
}).then(proc => {
	console.log(proc.out);
	if (proc.err != "") console.log(proc.err);
}).catch(console.error);
