# Custom Agent Installation

Install and personalize XIAOMA agents in your project.

## Quick Start

```bash
# From your project directory with XIAOMA installed
npx xiaoma-cli agent-install
```

Or if you have xiaoma-cli installed globally:

```bash
xiaoma agent-install
```

## What It Does

1. **Discovers** available agent templates from your custom agents folder
2. **Prompts** you to personalize the agent (name, behavior, preferences)
3. **Compiles** the agent with your choices baked in
4. **Installs** to your project's `.xiaoma/custom/agents/` directory
5. **Creates** IDE commands for all your configured IDEs (Claude Code, Codex, Cursor, etc.)
6. **Saves** your configuration for automatic reinstallation during XIAOMA updates

## Options

```bash
xiaoma agent-install [options]

Options:
  -p, --path <path>     #Direct path to specific agent YAML file or folder
  -d, --defaults        #Use default values without prompting
  -t, --target <path>   #Target installation directory
```

## Installing from Custom Locations

Use the `-s` / `--source` option to install agents from any location:

```bash
# Install agent from a custom folder (expert agent with sidecar)
xiaoma agent-install -s path/to/my-agent

# Install a specific .agent.yaml file (simple agent)
xiaoma agent-install -s path/to/my-agent.agent.yaml

# Install with defaults (non-interactive)
xiaoma agent-install -s path/to/my-agent -d

# Install to a specific destination project
xiaoma agent-install -s path/to/my-agent --destination /path/to/destination/project
```

This is useful when:

- Your agent is in a non-standard location (not in `.xiaoma/custom/agents/`)
- You're developing an agent outside the project structure
- You want to install from an absolute path

## Example Session

```
🔧 XIAOMA Agent Installer

Found XIAOMA at: /project/.xiaoma
Searching for agents in: /project/.xiaoma/custom/agents

Available Agents:

  1. 📄 commit-poet (simple)
  2. 📚 journal-keeper (expert)

Select agent to install (number): 1

Selected: commit-poet

📛 Agent Persona Name

   Agent type: commit-poet
   Default persona: Inkwell Von Comitizen

   Custom name (or Enter for default): Fred

   Persona: Fred
   File: fred-commit-poet.md

📝 Agent Configuration

   What's your preferred default commit message style?
   * 1. Conventional (feat/fix/chore)
     2. Narrative storytelling
     3. Poetic haiku
     4. Detailed explanation
   Choice (default: 1): 1

   How enthusiastic should the agent be?
     1. Moderate - Professional with personality
   * 2. High - Genuinely excited
     3. EXTREME - Full theatrical drama
   Choice (default: 2): 3

   Include emojis in commit messages? [Y/n]: y

✨ Agent installed successfully!
   Name: fred-commit-poet
   Location: /project/.xiaoma/custom/agents/fred-commit-poet
   Compiled: fred-commit-poet.md

   ✓ Source saved for reinstallation
   ✓ Added to agent-manifest.csv
   ✓ Created IDE commands:
      claude-code: /xiaoma:custom:agents:fred-commit-poet
      codex: /xiaoma-custom-agents-fred-commit-poet
      github-copilot: xiaoma-agent-custom-fred-commit-poet
```

## Reinstallation

Custom agents are automatically reinstalled when you run `xiaoma init --quick`. Your personalization choices are preserved in `.xiaoma/_cfg/custom/agents/`.

## Installing Reference Agents

The XIAOMA source includes example agents you can install. **You must copy them to your project first.**

### Step 1: Copy the Agent Template

**For simple agents** (single file):

```bash
# From your project root
cp node_modules/xiaoma-cli/src/modules/xmb/reference/agents/stand-alone/commit-poet.agent.yaml \
   .xiaoma/custom/agents/
```

**For expert agents** (folder with sidecar files):

```bash
# Copy the entire folder
cp -r node_modules/xiaoma-cli/src/modules/xmb/reference/agents/agent-with-memory/journal-keeper \
   .xiaoma/custom/agents/
```

### Step 2: Install and Personalize

```bash
npx xiaoma-cli agent-install
# or: xiaoma agent-install (if XIAOMA installed locally)
```

The installer will:

1. Find the copied template in `.xiaoma/custom/agents/`
2. Prompt for personalization (name, behavior, preferences)
3. Compile and install with your choices baked in
4. Create IDE commands for immediate use

### Available Reference Agents

**Simple (standalone file):**

- `commit-poet.agent.yaml` - Commit message artisan with style preferences

**Expert (folder with sidecar):**

- `journal-keeper/` - Personal journal companion with memory and pattern recognition

Find these in the XIAOMA source:

```
src/modules/xmb/reference/agents/
├── stand-alone/
│   └── commit-poet.agent.yaml
└── agent-with-memory/
    └── journal-keeper/
        ├── journal-keeper.agent.yaml
        └── journal-keeper-sidecar/
```

## Creating Your Own

Use the XMB agent builder to craft your agents. Once ready to use yourself, place your `.agent.yaml` files or folder in `.xiaoma/custom/agents/`.
