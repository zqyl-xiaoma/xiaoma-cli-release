## Overview

**XIAOMA-CLI™'s Two Key Innovations:**

**1. Agentic Planning:** Dedicated agents (Analyst, PM, Architect) collaborate with you to create detailed, consistent PRDs and Architecture documents. Through advanced prompt engineering and human-in-the-loop refinement, these planning agents produce comprehensive specifications that go far beyond generic AI task generation.

**2. Context-Engineered Development:** The Scrum Master agent then transforms these detailed plans into hyper-detailed development stories that contain everything the Dev agent needs - full context, implementation details, and architectural guidance embedded directly in story files.

This two-phase approach eliminates both **planning inconsistency** and **context loss** - the biggest problems in AI-assisted development. Your Dev agent opens a story file with complete understanding of what to build, how to build it, and why.

**📖 [See the complete workflow in the User Guide](docs/user-guide.md)** - Planning phase, development cycle, and all agent roles

## Quick Navigation

### Understanding the BMad Workflow

**Before diving in, review these critical workflow diagrams that explain how BMad works:**

1. **[Planning Workflow (Web UI)](docs/user-guide.md#the-planning-workflow-web-ui)** - How to create PRD and Architecture documents
2. **[Core Development Cycle (IDE)](docs/user-guide.md#the-core-development-cycle-ide)** - How SM, Dev, and QA agents collaborate through story files

> ⚠️ **These diagrams explain 90% of XiaoMa Cli Agentic Agile flow confusion** - Understanding the PRD+Architecture creation and the SM/Dev/QA workflow and how agents pass notes through story files is essential - and also explains why this is NOT taskmaster or just a simple task runner!

### What would you like to do?

- **[Install and Build software with Full Stack Agile AI Team](#quick-start)** → Quick Start Instruction
- **[Learn how to use BMad](docs/user-guide.md)** → Complete user guide and walkthrough
- **[See available AI agents](/xiaoma-core/agents)** → Specialized roles for your team
- **[Explore non-technical uses](#-beyond-software-development---expansion-packs)** → Creative writing, business, wellness, education
- **[Create my own AI agents](docs/expansion-packs.md)** → Build agents for your domain
- **[Browse ready-made expansion packs](expansion-packs/)** → Game dev, DevOps, infrastructure and get inspired with ideas and examples
- **[Understand the architecture](docs/core-architecture.md)** → Technical deep dive
- **[Join the community](https://discord.gg/gk8jAdXWmj)** → Get help and share ideas

## Important: Keep Your BMad Installation Updated

**Stay up-to-date effortlessly!** If you already have XIAOMA-CLI™ installed in your project, simply run:

```bash
npx xiaoma-cli install
# OR
git pull
npm run install:bmad
```

This will:

- ✅ Automatically detect your existing v4 installation
- ✅ Update only the files that have changed and add new files
- ✅ Create `.bak` backup files for any custom modifications you've made
- ✅ Preserve your project-specific configurations

This makes it easy to benefit from the latest improvements, bug fixes, and new agents without losing your customizations!

## Quick Start

### One Command for Everything (IDE Installation)

**Just run one of these commands:**

```bash
npx xiaoma-cli install
# OR explicitly use stable tag:
npx xiaoma-cli@stable install
# OR if you already have BMad installed:
git pull
npm run install:bmad
```

This single command handles:

- **New installations** - Sets up BMad in your project
- **Upgrades** - Updates existing installations automatically
- **Expansion packs** - Installs any expansion packs you've added to package.json

> **That's it!** Whether you're installing for the first time, upgrading, or adding expansion packs - these commands do everything.

**Prerequisites**: [Node.js](https://nodejs.org) v20+ required

### Fastest Start: Web UI Full Stack Team at your disposal (2 minutes)

1. **Get the bundle**: Save or clone the [full stack team file](dist/teams/team-fullstack.txt) or choose another team
2. **Create AI agent**: Create a new Gemini Gem or CustomGPT
3. **Upload & configure**: Upload the file and set instructions: "Your critical operating instructions are attached, do not break character as directed"
4. **Start Ideating and Planning**: Start chatting! Type `*help` to see available commands or pick an agent like `*analyst` to start right in on creating a brief.
5. **CRITICAL**: Talk to BMad Orchestrator in the web at ANY TIME (#bmad-orchestrator command) and ask it questions about how this all works!
6. **When to move to the IDE**: Once you have your PRD, Architecture, optional UX and Briefs - its time to switch over to the IDE to shard your docs, and start implementing the actual code! See the [User guide](docs/user-guide.md) for more details

### Alternative: Clone and Build

```bash
git clone https://github.com/zqyl-xiaoma/xiaoma-cli-release.git
npm run install:bmad # build and install all to a destination folder
```

## 🌟 Beyond Software Development - Expansion Packs

XIAOMA™'s natural language framework works in ANY domain. Expansion packs provide specialized AI agents for creative writing, business strategy, health & wellness, education, and more. Also expansion packs can expand the core XIAOMA-CLI™ with specific functionality that is not generic for all cases. [See the Expansion Packs Guide](docs/expansion-packs.md) and learn to create your own!

## Codebase Flattener Tool

The XIAOMA-CLI™ includes a powerful codebase flattener tool designed to prepare your project files for AI model consumption. This tool aggregates your entire codebase into a single XML file, making it easy to share your project context with AI assistants for analysis, debugging, or development assistance.

### Features

- **AI-Optimized Output**: Generates clean XML format specifically designed for AI model consumption
- **Smart Filtering**: Automatically respects `.gitignore` patterns to exclude unnecessary files
- **Binary File Detection**: Intelligently identifies and excludes binary files, focusing on source code
- **Progress Tracking**: Real-time progress indicators and comprehensive completion statistics
- **Flexible Output**: Customizable output file location and naming

### Usage

```bash
# Basic usage - creates flattened-codebase.xml in current directory
npx xiaoma-cli flatten

# Specify custom input directory
npx xiaoma-cli flatten --input /path/to/source/directory
npx xiaoma-cli flatten -i /path/to/source/directory

# Specify custom output file
npx xiaoma-cli flatten --output my-project.xml
npx xiaoma-cli flatten -o /path/to/output/codebase.xml

# Combine input and output options
npx xiaoma-cli flatten --input /path/to/source --output /path/to/output/codebase.xml
```

### Example Output

The tool will display progress and provide a comprehensive summary:

```text
📊 Completion Summary:
✅ Successfully processed 156 files into flattened-codebase.xml
📁 Output file: /path/to/your/project/flattened-codebase.xml
📏 Total source size: 2.3 MB
📄 Generated XML size: 2.1 MB
📝 Total lines of code: 15,847
🔢 Estimated tokens: 542,891
📊 File breakdown: 142 text, 14 binary, 0 errors
```

The generated XML file contains your project's text-based source files in a structured format that AI models can easily parse and understand, making it perfect for code reviews, architecture discussions, or getting AI assistance with your XIAOMA-CLI™ projects.

#### Advanced Usage & Options

- CLI options
  - `-i, --input <path>`: Directory to flatten. Default: current working directory or auto-detected project root when run interactively.
  - `-o, --output <path>`: Output file path. Default: `flattened-codebase.xml` in the chosen directory.
- Interactive mode
  - If you do not pass `--input` and `--output` and the terminal is interactive (TTY), the tool will attempt to detect your project root (by looking for markers like `.git`, `package.json`, etc.) and prompt you to confirm or override the paths.
  - In non-interactive contexts (e.g., CI), it will prefer the detected root silently; otherwise it falls back to the current directory and default filename.
- File discovery and ignoring
  - Uses `git ls-files` when inside a git repository for speed and correctness; otherwise falls back to a glob-based scan.
  - Applies your `.gitignore` plus a curated set of default ignore patterns (e.g., `node_modules`, build outputs, caches, logs, IDE folders, lockfiles, large media/binaries, `.env*`, and previously generated XML outputs).
- Binary handling
  - Binary files are detected and excluded from the XML content. They are counted in the final summary but not embedded in the output.
- XML format and safety
  - UTF-8 encoded file with root element `<files>`.
  - Each text file is emitted as a `<file path="relative/path">` element whose content is wrapped in `<![CDATA[ ... ]]>`.
  - The tool safely handles occurrences of `]]>` inside content by splitting the CDATA to preserve correctness.
  - File contents are preserved as-is and indented for readability inside the XML.
- Performance
  - Concurrency is selected automatically based on your CPU and workload size. No configuration required.
  - Running inside a git repo improves discovery performance.

#### Minimal XML example

```xml
<?xml version="1.0" encoding="UTF-8"?>
<files>
  <file path="src/index.js"><![CDATA[
    // your source content
  ]]></file>
</files>
```

## Documentation & Resources

### Essential Guides

- 📖 **[User Guide](docs/user-guide.md)** - Complete walkthrough from project inception to completion
- 🏗️ **[Core Architecture](docs/core-architecture.md)** - Technical deep dive and system design
- 🚀 **[Expansion Packs Guide](docs/expansion-packs.md)** - Extend BMad to any domain beyond software development

## Support

- 💬 [Discord Community](https://discord.gg/gk8jAdXWmj)
- 🐛 [Issue Tracker](https://github.com/zqyl-xiaoma/xiaoma-cli-release/issues)
- 💬 [Discussions](https://github.com/zqyl-xiaoma/xiaoma-cli-release/discussions)

## Contributing

**We're excited about contributions and welcome your ideas, improvements, and expansion packs!** 🎉

📋 **[Read CONTRIBUTING.md](CONTRIBUTING.md)** - Complete guide to contributing, including guidelines, process, and requirements

### Working with Forks

When you fork this repository, CI/CD workflows are **disabled by default** to save resources. This is intentional and helps keep your fork clean.

#### Need CI/CD in Your Fork?

See our [Fork CI/CD Guide](.github/FORK_GUIDE.md) for instructions on enabling workflows in your fork.

#### Contributing Workflow

1. **Fork the repository** - Click the Fork button on GitHub
2. **Clone your fork** - `git clone https://github.com/YOUR-USERNAME/xiaoma-cli-release.git`
3. **Create a feature branch** - `git checkout -b feature/amazing-feature`
4. **Make your changes** - Test locally with `npm test`
5. **Commit your changes** - `git commit -m 'feat: add amazing feature'`
6. **Push to your fork** - `git push origin feature/amazing-feature`
7. **Open a Pull Request** - CI/CD will run automatically on the PR

Your contributions are tested when you submit a PR - no need to enable CI in your fork!

## License

MIT License - see [LICENSE](LICENSE) for details.

## Trademark Notice

XIAOMA™ and XIAOMA-CLI™ are trademarks of BMad Code, LLC. All rights reserved.

[![Contributors](https://contrib.rocks/image?repo=zqyl-xiaoma/xiaoma-cli-release)](https://github.com/zqyl-xiaoma/xiaoma-cli-release/graphs/contributors)

<sub>Built with ❤️ for the AI-assisted development community</sub>
