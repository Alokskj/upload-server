const fs = require("fs");
const util = require("util");
const writeFile = util.promisify(fs.writeFile);
const { exec } = require("child_process");
const { default: simpleGit } = require("simple-git");


// Function to clone repository
const cloneRepository = async (repoUrl, subdomain) => {
  try {
    const clonePath = `${process.env.WEBSITES_LOCATION}/${subdomain}`;
    if (fs.existsSync(clonePath)) {
      throw new Error(`${subdomain} is already taken`);
    }
    const git = simpleGit()
    await git.init();
    await git.clone(repoUrl, clonePath);
    console.log(`Cloned repository: ${repoUrl}`);
  } catch (error) {
    console.error(`Error cloning repository: ${error.message}`);
    if (error.message.includes("fatal:")) {
      throw new Error("Invalid or private repository URL");
    } else {
      throw new Error(`Error cloning repository: ${error.message}`);
    }
  }
};

const executeShellCommand = (command) => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error || stderr) {
        const errorMessage = stderr ? stderr : error.message;
        console.error(`Error executing command: ${errorMessage}`);
        reject(new Error(`Error executing command: ${errorMessage}`));
      } else {
        resolve();
      }
    });
  });
};
async function writeNginxConfig(subdomain) {
  const nginxConfig = `
      server {
          listen 80;
          listen [::]:80;
          server_name ${subdomain}.${process.env.SERVER_URL};
          index index.html;
          root ${process.env.WEBSITES_LOCATION}/${subdomain};
          location / {
              autoindex on;
              try_files $uri $uri/ /index.html  =404;
            }
      }
      `;
  const nginxConfigPath = `/etc/nginx/sites-available/${subdomain}.conf`;
  await writeFile(nginxConfigPath, nginxConfig);
  console.log("Nginx config file created");
}

const createNginxSymbolicLink = async (subdomain) => {
  try {
    const command = `cd /etc/nginx/sites-enabled && ln -s /etc/nginx/sites-available/${subdomain}.conf ${subdomain}`;
    await executeShellCommand(command);
    console.log("Nginx symbolic link created");
  } catch (error) {
    console.error(`Error creating symbolic link Nginx: ${error.message}`);
    throw new Error(`Error creating symbolic link Nginx: ${error.message}`);
  }
};

const restartNginx = async () => {
  try {
    const command = `systemctl restart nginx`;
    await executeShellCommand(command);
    console.log("Nginx restarted");
  } catch (error) {
    console.error(`Error restarting Nginx: ${error.message}`);
    throw new Error(`Error restarting Nginx: ${error.message}`);
  }
};
// Function to configure Nginx for subdomain
const configureNginx = async (subdomain) => {
  await writeNginxConfig(subdomain);
  await createNginxSymbolicLink(subdomain);
  await restartNginx();
};

module.exports = {
  writeNginxConfig,
  cloneRepository,
  configureNginx,
  restartNginx,
  createNginxSymbolicLink,
};
