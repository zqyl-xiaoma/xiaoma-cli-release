# XIAOMA Method - iFlow CLI Instructions

## Activating Agents

XIAOMA agents are installed as commands in `.iflow/commands/xiaoma/`.

### How to Use

1. **Access Commands**: Use iFlow command interface
2. **Navigate**: Browse to `{xiaoma_folder}/agents/` or `{xiaoma_folder}/tasks/`
3. **Select**: Choose the agent or task command
4. **Execute**: Run to activate

### Command Structure

```
.iflow/commands/xiaoma/
├── agents/     # Agent commands
└── tasks/      # Task commands
```

### Examples

```
/{xiaoma_folder}/agents/core-dev - Activate dev agent
/{xiaoma_folder}/tasks/core-setup - Execute setup task
```

### Notes

- Commands organized by type (agents/tasks)
- Agent activates for session
- Similar to Crush command structure
