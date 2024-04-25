const fs = require('fs');
const util = require('util');
const writeFile = util.promisify(fs.writeFile);
async function writeNginxConfig(subdomain) {
    const nginxConfig = `
    server {
        listen 80;
        listen [::]:80;
        server_name ${subdomain}.alokskj.co;
        index index.html;
        root /var/www/websites/${subdomain};
        location / {
            autoindex on;
            try_files $uri $uri/ /index.html  =404;
          } 
    }
    `;
    const nginxConfigPath = `/etc/nginx/sites-available/${subdomain}.conf`;
    await writeFile(nginxConfigPath, nginxConfig);
}

module.exports = writeNginxConfig