# XIAOMA Method - Codex Instructions

## Activating Agents

XIAOMA agents, tasks and workflows are installed as custom prompts in
`$CODEX_HOME/prompts/xiaoma-*.md` files. If `CODEX_HOME` is not set, it
defaults to `$HOME/.codex/`.

### Examples

```
/xiaoma-xmc-agents-dev - Activate development agent
/xiaoma-xmc-agents-architect - Activate architect agent
/xiaoma-xmc-workflows-dev-story - Execute dev-story workflow
```

### Notes

Prompts are autocompleted when you type /
Agent remains active for the conversation
Start a new conversation to switch agents
