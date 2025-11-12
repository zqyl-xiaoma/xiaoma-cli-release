const { program } = require("commander");
const path = require("node:path");
const fs = require("node:fs").promises;
const yaml = require("js-yaml");
const chalk = require("chalk").default || require("chalk");
const inquirer = require("inquirer").default || require("inquirer");
const semver = require("semver");
const https = require("node:https");

// Handle both execution contexts (from root via npx or from installer directory)
let version;
let installer;
let packageName;
try {
  // Try installer context first (when run from tools/installer/)
  version = require("../package.json").version;
  packageName = require("../package.json").name;
  installer = require("../lib/installer");
} catch (error) {
  // Fall back to root context (when run via npx from GitHub)
  console.log(
    `Installer context not found (${error.message}), trying root context...`,
  );
  try {
    version = require("../../../package.json").version;
    installer = require("../../../tools/installer/lib/installer");
  } catch (error) {
    console.error(
      "Error: Could not load required modules. Please ensure you are running from the correct directory.",
    );
    console.error("Debug info:", {
      __dirname,
      cwd: process.cwd(),
      error: error.message,
    });
    process.exit(1);
  }
}

program
  .version(version)
  .description(
    "XiaoMa CLI installer - Universal AI agent framework for any domain",
  );

program
  .command("install")
  .description("Install XiaoMa CLI agents and tools")
  .option("-f, --full", "Install complete XiaoMa CLI")
  .option(
    "-x, --expansion-only",
    "Install only expansion packs (no xiaoma-core)",
  )
  .option("-d, --directory <path>", "Installation directory")
  .option(
    "-i, --ide <ide...>",
    "Configure for specific IDE(s) - can specify multiple (cursor, claude-code, windsurf, trae, roo, kilo, cline, gemini, qwen-code, github-copilot, codex, codex-web, auggie-cli, other)",
  )
  .option(
    "-e, --expansion-packs <packs...>",
    "Install specific expansion packs (can specify multiple)",
  )
  .action(async (options) => {
    try {
      if (!options.full && !options.expansionOnly) {
        // Interactive mode
        const answers = await promptInstallation();
        if (!answers._alreadyInstalled) {
          await installer.install(answers);
          process.exit(0);
        }
      } else {
        // Direct mode
        let installType = "full";
        if (options.expansionOnly) installType = "expansion-only";

        const config = {
          installType,
          directory: options.directory || ".",
          ides: (options.ide || []).filter((ide) => ide !== "other"),
          expansionPacks: options.expansionPacks || [],
        };
        await installer.install(config);
        process.exit(0);
      }
    } catch (error) {
      console.error(chalk.red("Installation failed:"), error.message);
      process.exit(1);
    }
  });

program
  .command("update")
  .description("Update existing XiaoMa installation")
  .option("--force", "Force update, overwriting modified files")
  .option("--dry-run", "Show what would be updated without making changes")
  .action(async () => {
    try {
      await installer.update();
    } catch (error) {
      console.error(chalk.red("Update failed:"), error.message);
      process.exit(1);
    }
  });

// Command to check if updates are available
program
  .command("update-check")
  .description("Check for XiaoMa Update")
  .action(async () => {
    console.log("Checking for updates...");

    // Make HTTP request to npm registry for latest version info
    const req = https.get(
      `https://registry.npmjs.org/${packageName}/latest`,
      (res) => {
        // Check for HTTP errors (non-200 status codes)
        if (res.statusCode !== 200) {
          console.error(
            chalk.red(
              `Update check failed: Received status code ${res.statusCode}`,
            ),
          );
          return;
        }

        // Accumulate response data chunks
        let data = "";
        res.on("data", (chunk) => (data += chunk));

        // Process complete response
        res.on("end", () => {
          try {
            // Parse npm registry response and extract version
            const latest = JSON.parse(data).version;

            // Compare versions using semver
            if (semver.gt(latest, version)) {
              console.log(
                chalk.bold.blue(
                  `⚠️  ${packageName} update available: ${version} → ${latest}`,
                ),
              );
              console.log(chalk.bold.blue("\nInstall latest by running:"));
              console.log(
                chalk.bold.magenta(`  npm install ${packageName}@latest`),
              );
              console.log(chalk.dim("  or"));
              console.log(chalk.bold.magenta(`  npx ${packageName}@latest`));
            } else {
              console.log(chalk.bold.blue(`✨ ${packageName} is up to date`));
            }
          } catch (error) {
            // Handle JSON parsing errors
            console.error(
              chalk.red("Failed to parse npm registry data:"),
              error.message,
            );
          }
        });
      },
    );

    // Handle network/connection errors
    req.on("error", (error) => {
      console.error(chalk.red("Update check failed:"), error.message);
    });

    // Set 30 second timeout to prevent hanging
    req.setTimeout(30_000, () => {
      req.destroy();
      console.error(chalk.red("Update check timed out"));
    });
  });

program
  .command("list:expansions")
  .description("List available expansion packs")
  .action(async () => {
    try {
      await installer.listExpansionPacks();
    } catch (error) {
      console.error(chalk.red("Error:"), error.message);
      process.exit(1);
    }
  });

program
  .command("status")
  .description("Show installation status")
  .action(async () => {
    try {
      await installer.showStatus();
    } catch (error) {
      console.error(chalk.red("Error:"), error.message);
      process.exit(1);
    }
  });

program
  .command("flatten")
  .description("Flatten codebase to XML format")
  .option("-i, --input <path>", "Input directory to flatten", process.cwd())
  .option("-o, --output <path>", "Output file path", "flattened-codebase.xml")
  .action(async (options) => {
    try {
      await installer.flatten(options);
    } catch (error) {
      console.error(chalk.red("Flatten failed:"), error.message);
      process.exit(1);
    }
  });

async function promptInstallation() {
  // Display ASCII logo
  console.log(
    chalk.bold.cyan(`
██╗  ██╗██╗ █████╗  ██████╗ ███╗   ███╗ █████╗        ██████╗██╗     ██╗
╚██╗██╔╝██║██╔══██╗██╔═══██╗████╗ ████║██╔══██╗      ██╔════╝██║     ██║
 ╚███╔╝ ██║███████║██║   ██║██╔████╔██║███████║█████╗██║     ██║     ██║
 ██╔██╗ ██║██╔══██║██║   ██║██║╚██╔╝██║██╔══██║╚════╝██║     ██║     ██║
██╔╝ ██╗██║██║  ██║╚██████╔╝██║ ╚═╝ ██║██║  ██║      ╚██████╗███████╗██║
╚═╝  ╚═╝╚═╝╚═╝  ╚═╝ ╚═════╝ ╚═╝     ╚═╝╚═╝  ╚═╝       ╚═════╝╚══════╝╚═╝
  `),
  );

  console.log(
    chalk.bold.magenta("🚀 Universal AI Agent Framework for Any Domain"),
  );
  console.log(chalk.bold.blue(`✨ Installer v${version}\n`));

  const answers = {};

  // Ask for installation directory first
  const { directory } = await inquirer.prompt([
    {
      type: "input",
      name: "directory",
      message:
        "Enter the full path to your project directory where XiaoMa should be installed:",
      default: path.resolve("."),
      validate: (input) => {
        if (!input.trim()) {
          return "Please enter a valid project path";
        }
        return true;
      },
    },
  ]);
  answers.directory = directory;

  // Detect existing installations
  const installDir = path.resolve(directory);
  const state = await installer.detectInstallationState(installDir);

  // Check for existing expansion packs
  const existingExpansionPacks = state.expansionPacks || {};

  // Get available expansion packs
  const availableExpansionPacks = await installer.getAvailableExpansionPacks();

  // Load core config to get short-title
  const coreConfigPath = path.join(
    __dirname,
    "..",
    "..",
    "..",
    "xiaoma-core",
    "core-config.yaml",
  );
  const coreConfig = yaml.load(await fs.readFile(coreConfigPath, "utf8"));
  const coreShortTitle =
    coreConfig["short-title"] || "XiaoMa Agile Core System";

  // Display what will be installed
  let bmadOptionText;
  if (state.type === "v4_existing") {
    const currentVersion = state.manifest?.version || "unknown";
    const newVersion = version; // Always use package.json version
    const versionInfo =
      currentVersion === newVersion
        ? `(v${currentVersion} - reinstall)`
        : `(v${currentVersion} → v${newVersion})`;
    bmadOptionText = `Update ${coreShortTitle} ${versionInfo}`;
  } else {
    bmadOptionText = `${coreShortTitle} (v${version})`;
  }

  console.log(chalk.cyan(`\n📦 Installing: ${bmadOptionText} → .xiaoma-core`));

  // Automatically select xiaoma-core (no user prompt)
  const selectedItems = ["xiaoma-core"];

  // Process selections
  answers.installType = "full";
  answers.expansionPacks = [];

  // Configure sharding settings if installing XiaoMa core
  if (selectedItems.includes("xiaoma-core")) {
    console.log(chalk.cyan("\n📋 Document Organization Settings"));
    console.log(
      chalk.dim(
        "PRD and Architecture documents will be sharded into multiple files.\n",
      ),
    );

    // Automatically enable both PRD and architecture sharding
    answers.prdSharded = true;
    answers.architectureSharded = true;
  }

  // Ask for IDE configuration
  let ides = [];
  let ideSelectionComplete = false;

  while (!ideSelectionComplete) {
    console.log(chalk.cyan("\n🛠️  IDE Configuration"));
    console.log(
      chalk.bold.yellow.bgRed(
        " ⚠️  IMPORTANT: This is a MULTISELECT! Use SPACEBAR to toggle each IDE! ",
      ),
    );
    console.log(chalk.bold.magenta("🔸 Use arrow keys to navigate"));
    console.log(chalk.bold.magenta("🔸 Use SPACEBAR to select/deselect IDEs"));
    console.log(chalk.bold.magenta("🔸 Press ENTER when finished selecting\n"));

    const ideResponse = await inquirer.prompt([
      {
        type: "checkbox",
        name: "ides",
        message:
          "Which IDE(s) do you want to configure? (Select with SPACEBAR, confirm with ENTER):",
        choices: [
          { name: "Cursor", value: "cursor" },
          { name: "Claude Code", value: "claude-code" },
          { name: "Windsurf", value: "windsurf" },
          { name: "Trae", value: "trae" }, // { name: 'Trae', value: 'trae'}
          { name: "Roo Code", value: "roo" },
          { name: "Kilo Code", value: "kilo" },
          { name: "Cline", value: "cline" },
          { name: "Gemini CLI", value: "gemini" },
          { name: "Qwen Code", value: "qwen-code" },
          { name: "Crush", value: "crush" },
          { name: "Github Copilot", value: "github-copilot" },
          { name: "Auggie CLI (Augment Code)", value: "auggie-cli" },
          { name: "Codex CLI", value: "codex" },
          { name: "Codex Web", value: "codex-web" },
        ],
      },
    ]);

    ides = ideResponse.ides;

    // Confirm no IDE selection if none selected
    if (ides.length === 0) {
      const { confirmNoIde } = await inquirer.prompt([
        {
          type: "confirm",
          name: "confirmNoIde",
          message: chalk.red(
            "⚠️  You have NOT selected any IDEs. This means NO IDE integration will be set up. Is this correct?",
          ),
          default: false,
        },
      ]);

      if (!confirmNoIde) {
        console.log(
          chalk.bold.red(
            "\n🔄 Returning to IDE selection. Remember to use SPACEBAR to select IDEs!\n",
          ),
        );
        continue; // Go back to IDE selection only
      }
    }

    ideSelectionComplete = true;
  }

  // Use selected IDEs directly
  answers.ides = ides;

  // Configure GitHub Copilot immediately if selected
  if (ides.includes("github-copilot")) {
    console.log(chalk.cyan("\n🔧 GitHub Copilot Configuration"));
    console.log(
      chalk.dim(
        "XiaoMa works best with specific VS Code settings for optimal agent experience.\n",
      ),
    );

    const { configChoice } = await inquirer.prompt([
      {
        type: "list",
        name: "configChoice",
        message: chalk.yellow(
          "How would you like to configure GitHub Copilot settings?",
        ),
        choices: [
          {
            name: "Use recommended defaults (fastest setup)",
            value: "defaults",
          },
          {
            name: "Configure each setting manually (customize to your preferences)",
            value: "manual",
          },
          {
            name: "Skip settings configuration (I'll configure manually later)",
            value: "skip",
          },
        ],
        default: "defaults",
      },
    ]);

    answers.githubCopilotConfig = { configChoice };
  }

  // Configure Auggie CLI (Augment Code) immediately if selected
  if (ides.includes("auggie-cli")) {
    console.log(chalk.cyan("\n📍 Auggie CLI Location Configuration"));
    console.log(
      chalk.dim(
        "Choose where to install XiaoMa agents for Auggie CLI access.\n",
      ),
    );

    const { selectedLocations } = await inquirer.prompt([
      {
        type: "checkbox",
        name: "selectedLocations",
        message: "Select Auggie CLI command locations:",
        choices: [
          {
            name: "User Commands (Global): Available across all your projects (user-wide)",
            value: "user",
          },
          {
            name: "Workspace Commands (Project): Stored in repository, shared with team",
            value: "workspace",
          },
        ],
        validate: (selected) => {
          if (selected.length === 0) {
            return "Please select at least one location";
          }
          return true;
        },
      },
    ]);

    answers.augmentCodeConfig = { selectedLocations };
  }

  // Automatically include pre-built web bundles
  console.log(chalk.cyan("\n📦 Web Bundles Configuration"));
  console.log(
    chalk.dim(
      "Pre-built web bundles for ChatGPT, Claude, and Gemini will be included.\n",
    ),
  );

  // Set default configuration for web bundles
  answers.includeWebBundles = true;
  answers.webBundleType = "all"; // Include all available bundles
  answers.webBundlesDirectory = `${answers.directory}/web-bundles`;

  return answers;
}

program.parse(process.argv);

// Show help if no command provided
if (process.argv.slice(2).length === 0) {
  program.outputHelp();
}
