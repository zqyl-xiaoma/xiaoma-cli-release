# XIAOMA Method - Crush Instructions

## Activating Agents

XIAOMA agents are installed as commands in `.crush/commands/xiaoma/`.

### How to Use

1. **Open Command Palette**: Use Crush command interface
2. **Navigate**: Browse to `{xiaoma_folder}/{module}/agents/`
3. **Select Agent**: Choose the agent command
4. **Execute**: Run to activate agent persona

### Command Structure

```
.crush/commands/xiaoma/
├── agents/          # All agents
├── tasks/           # All tasks
├── core/            # Core module
│   ├── agents/
│   └── tasks/
└── {module}/        # Other modules
```

### Notes

- Commands organized by module
- Can browse hierarchically
- Agent activates for session
