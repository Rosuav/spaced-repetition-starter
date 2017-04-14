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

(async function() {
	if (!secret.CLIENT_ID || !secret.CLIENT_SECRET) {
		console.error("Please create server/secret.js before using this script.");
		return;
	}
	let proc = await run(["git", "remote"]);
	if (proc.out.split("\n").includes("heroku")) {
		console.error("Found existing heroku remote - reapplying credentials.");
		return;
	} else {
		proc = await run(["heroku", "create"]);
		console.log(proc.out);
		if (proc.err != "") console.log(proc.err);
	}
	proc = await run(["heroku", "config:set",
		"CLIENT_ID=" + secret.CLIENT_ID,
		"CLIENT_SECRET=" + secret.CLIENT_SECRET,
	]);
	console.log(proc.out);
	if (proc.err != "") console.log(proc.err);
})().catch(console.error);
