# Cursor Rules MCP Server

An MCP (Model Context Protocol) server that fetches Cursor rules from a Git repository, enabling you to share rules across multiple projects.

## Quick Start

1. **Install dependencies:**
   npm install

2. **Make server executable:**
   chmod +x server.js

3. **Create `config.json`:**
   {
     "gitRepo": "https://github.com/your-username/your-rules-repo.git",
     "gitBranch": "main",
     "cacheTTL": 3600000
   }

4. **Test the server:**
   node server.js

5. **Connect to Cursor:**
   - Open Cursor Settings → Features → MCP
   - Click "+ Add New MCP Server"
   - Name: `cursor-rules-server`
   - Type: `stdio`
   - Command: `node /absolute/path/to/cursor-rules-mcp/server.js`

## Configuration

Edit `config.json`:

- `gitRepo` (required): Git repository URL containing your rules
- `gitBranch` (optional): Branch name (default: "main")
- `cacheTTL` (optional): Cache duration in milliseconds (default: 3600000 = 1 hour)

## Git Repository Structure

The server looks for rules in these locations (in order):
1. `.cursor/rules/` directory
2. `rules/` directory  
3. Root directory

Rule files should have `.mdc` or `.md` extensions.

## Available Tools

- `get_rule` - Get a specific rule by name
- `list_rules` - List all available rules
- `get_all_rules` - Get all rules combined
- `get_rule_readme` - Get the README file
- `refresh_rules` - Force refresh from Git

## Available Prompts

- `apply_documentation_consistency` - Apply consistency rules
- `validate_completeness` - Validate documentation completeness
- `check_objective_alignment` - Check objective alignment
- `plan_phase` - Get phase planning guidance
- `review_jira_initiative` - Review JIRA Initiative
- `review_jira_epic` - Review JIRA Epic

## Troubleshooting

**Server won't start:**
- Check Node.js version: `node --version` (needs 18+)
- Verify `config.json` exists and is valid JSON
- Check Git is installed: `git --version`
- If you see `EACCES` (permission denied) error, make the server executable: `chmod +x server.js`

**Can't fetch rules:**
- Verify `gitRepo` URL is correct
- Test access: `git clone <your-repo-url>`
- Check branch name matches `gitBranch` in config

**Rules not found:**
- Use `list_rules` tool to see available rules
- Check repository structure matches expected format
- Verify file extensions are `.mdc` or `.md`

**Cache issues:**
- Delete `cache/` directory to clear cache
- Use `refresh_rules` tool to force refresh