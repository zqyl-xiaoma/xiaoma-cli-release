# XIAOMA Method - Cursor Instructions

## Activating Agents

XIAOMA agents are installed in `.cursor/rules/xiaoma/` as MDC rules.

### How to Use

1. **Reference in Chat**: Use `@{xiaoma_folder}/{module}/agents/{agent-name}`
2. **Include Entire Module**: Use `@{xiaoma_folder}/{module}`
3. **Reference Index**: Use `@{xiaoma_folder}/index` for all available agents

### Examples

```
@{xiaoma_folder}/core/agents/dev - Activate dev agent
@{xiaoma_folder}/xmc/agents/architect - Activate architect agent
@{xiaoma_folder}/core - Include all core agents/tasks
```

### Notes

- Rules are Manual type - only loaded when explicitly referenced
- No automatic context pollution
- Can combine multiple agents: `@{xiaoma_folder}/core/agents/dev @{xiaoma_folder}/core/agents/test`
