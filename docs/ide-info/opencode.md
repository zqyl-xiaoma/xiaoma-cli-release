# XIAOMA Method - OpenCode Instructions

## Activating Agents

XIAOMA agents are installed as OpenCode agents in `.opencode/agent/XIAOMA/{module_name}` and workflow commands in `.opencode/command/XIAOMA/{module_name}`.

### How to Use

1. **Switch Agents**: Press **Tab** to cycle through primary agents or select using the `/agents`
2. **Activate Agent**: Once the Agent is selected say `hello` or any prompt to activate that agent persona
3. **Execute Commands**: Type `/xiaoma` to see and execute xiaoma workflow commands (commands allow for fuzzy matching)

### Examples

```
/agents - to see a list of agents and switch between them
/{xiaoma_folder}/xmc/workflows/workflow-init - Activate the workflow-init command
```

### Notes

- Press **Tab** to switch between primary agents (Analyst, Architect, Dev, etc.)
- Commands are autocompleted when you type `/` and allow for fuzzy matching
- Workflow commands execute in current agent context, make sure you have the right agent activated before running a command
