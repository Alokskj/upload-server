const {
  cloneRepository,
  configureNginx,
  enableSSL,
} = require("../utils");

// Function to upload website from a Git repository
const uploadWebsite = async (req, res) => {
  const { repoUrl, subdomain } = req.body;
  try {
    await cloneRepository(repoUrl, subdomain);
    await configureNginx(subdomain);
    await enableSSL(subdomain)
    const siteUrl = `http://${subdomain}.${process.env.SERVER_URL}`;
    res.status(200).json({
      success: true,
      url: siteUrl,
      message: `Repo uploaded successfully, checkout your site here ${siteUrl}`,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  uploadWebsite,
};
