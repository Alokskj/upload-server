const express = require("express");
const { exec } = require("child_process");
const { default: simpleGit } = require("simple-git");
const writeNginxConfig = require("./utils");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/upload", async (req, res) => {
  const { repoUrl, subdomain } = req.body;
  try {
    const clone = await simpleGit().clone(repoUrl, `/var/www/websites/${subdomain}`);
    console.log(`Cloned repository: ${repoUrl}`);
    // Write Nginx configuration for subdomain
    await writeNginxConfig(subdomain);
    exec(
      `cd /etc/nginx/sites-enabled && ln -s /etc/nginx/sites-available/${subdomain}.conf ${subdomain} && systemctl restart nginx`,
      (nginxError, nginxStdout, nginxStderr) => {
        if (nginxError) {
          console.error(`Error restarting Nginx: ${nginxError.message}`);
          res.status(500).send("Error restarting Nginx");
          return;
        }
        console.log("Nginx restarted");
      }
    );
    res
      .status(200)
      .json({ success: true, message: "Repo uploaded successfully" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.listen(8000, () => console.log("Upload server is running on port 8000"));
