#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { exec } from "child_process";
import { promisify } from "util";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const execAsync = promisify(exec);

class RulesMCPServer {
  constructor(config) {
    this.config = config;
    this.cacheDir = path.join(__dirname, "cache");
    this.rulesRepoPath = path.join(this.cacheDir, "rules-repo");
    this.lastFetchTime = null;
    this.fetchLock = false;

    this.server = new Server(
      {
        name: "cursor-rules-server",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
          prompts: {},
          resources: {
            subscribe: false,
            listChanged: false,
          },
        },
      }
    );

    this.setupHandlers();
  }

  setupHandlers() {
    console.error("Setting up MCP handlers...");
    
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: "get_rule",
          description: "Retrieve a specific Cursor rule by name from the Git repository",
          inputSchema: {
            type: "object",
            properties: {
              ruleName: {
                type: "string",
                description: "Name of the rule file without extension (e.g., 'documentation-consistency')",
              },
              refresh: {
                type: "boolean",
                description: "Force refresh from Git repository (default: false)",
                default: false,
              },
            },
            required: ["ruleName"],
          },
        },
        {
          name: "list_rules",
          description: "List all available Cursor rules from the Git repository",
          inputSchema: {
            type: "object",
            properties: {
              refresh: {
                type: "boolean",
                description: "Force refresh from Git repository (default: false)",
                default: false,
              },
            },
          },
        },
        {
          name: "get_all_rules",
          description: "Get all rules as a single combined document",
          inputSchema: {
            type: "object",
            properties: {
              refresh: {
                type: "boolean",
                description: "Force refresh from Git repository (default: false)",
                default: false,
              },
            },
          },
        },
        {
          name: "get_rule_readme",
          description: "Get the README.md file that explains how to use the rules",
          inputSchema: {
            type: "object",
            properties: {
              refresh: {
                type: "boolean",
                description: "Force refresh from Git repository (default: false)",
                default: false,
              },
            },
          },
        },
        {
          name: "refresh_rules",
          description: "Force refresh all rules from the Git repository",
          inputSchema: {
            type: "object",
            properties: {},
          },
        },
      ],
    }));

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case "get_rule":
            return await this.getRule(args.ruleName, args.refresh || false);
          case "list_rules":
            return await this.listRules(args?.refresh || false);
          case "get_all_rules":
            return await this.getAllRules(args?.refresh || false);
          case "get_rule_readme":
            return await this.getRuleReadme(args?.refresh || false);
          case "refresh_rules":
            return await this.refreshRules();
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    });

    // List available prompts
    this.server.setRequestHandler(ListPromptsRequestSchema, async () => ({
      prompts: [
        {
          name: "apply_documentation_consistency",
          description: "Apply documentation consistency rules when creating or updating documentation",
          arguments: [
            {
              name: "context",
              description: "Context about what documentation is being created or updated",
              required: true,
            },
          ],
        },
        {
          name: "validate_completeness",
          description: "Validate documentation completeness using the validation framework",
          arguments: [
            {
              name: "phase",
              description: "Phase name or identifier to validate",
              required: true,
            },
            {
              name: "document_type",
              description: "Type of document being validated (e.g., 'phase_overview', 'technical_solution')",
              required: false,
            },
          ],
        },
        {
          name: "check_objective_alignment",
          description: "Check if work aligns with stated objectives using the objective alignment framework",
          arguments: [
            {
              name: "work_description",
              description: "Description of the work being done",
              required: true,
            },
            {
              name: "objectives",
              description: "Stated objectives for this work",
              required: true,
            },
          ],
        },
        {
          name: "plan_phase",
          description: "Get guidance for planning a new roadmap phase",
          arguments: [
            {
              name: "phase_name",
              description: "Name of the phase being planned",
              required: true,
            },
            {
              name: "context",
              description: "Context about the phase (what it's trying to accomplish)",
              required: false,
            },
          ],
        },
        {
          name: "review_jira_initiative",
          description: "Review a JIRA Initiative against organizational standards",
          arguments: [
            {
              name: "initiative_details",
              description: "Details of the Initiative to review",
              required: true,
            },
          ],
        },
        {
          name: "review_jira_epic",
          description: "Review a JIRA Epic against organizational standards",
          arguments: [
            {
              name: "epic_details",
              description: "Details of the Epic to review",
              required: true,
            },
          ],
        },
      ],
    }));

    // Handle prompt requests
    this.server.setRequestHandler(GetPromptRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case "apply_documentation_consistency":
            return await this.buildConsistencyPrompt(args.context);
          case "validate_completeness":
            return await this.buildCompletenessPrompt(args.phase, args.document_type);
          case "check_objective_alignment":
            return await this.buildObjectiveAlignmentPrompt(args.work_description, args.objectives);
          case "plan_phase":
            return await this.buildPlanPhasePrompt(args.phase_name, args.context);
          case "review_jira_initiative":
            return await this.buildJiraInitiativePrompt(args.initiative_details);
          case "review_jira_epic":
            return await this.buildJiraEpicPrompt(args.epic_details);
          default:
            throw new Error(`Unknown prompt: ${name}`);
        }
      } catch (error) {
        return {
          messages: [
            {
              role: "user",
              content: {
                type: "text",
                text: `Error building prompt: ${error.message}`,
              },
            },
          ],
        };
      }
    });

    // List available resources
    console.error("Registering ListResourcesRequestSchema handler...");
    this.server.setRequestHandler(ListResourcesRequestSchema, async (request) => {
      try {
        console.error("ListResourcesRequestSchema handler called");
        await this.cloneOrUpdateRepo(false);
        const rulesPath = await this.getRulesPath();
        
        const files = await fs.readdir(rulesPath);
        const ruleFiles = files.filter(
          (f) => (f.endsWith(".mdc") || f.endsWith(".md")) && f !== "README.md"
        );

        const resources = ruleFiles.map((file) => {
          const ruleName = file.replace(/\.(mdc|md)$/, "");
          return {
            uri: `rule://${ruleName}`,
            name: ruleName,
            description: `Cursor rule: ${ruleName}`,
            mimeType: "text/markdown",
          };
        });

        // Add README as a resource
        resources.push({
          uri: "rule://README",
          name: "README",
          description: "Rules README documentation",
          mimeType: "text/markdown",
        });

        console.error(`Returning ${resources.length} resources`);
        return { resources };
      } catch (error) {
        console.error(`Error listing resources: ${error.message}`);
        console.error(`Stack trace: ${error.stack}`);
        // Return empty resources array instead of throwing to prevent MCP error
        return { resources: [] };
      }
    });

    // Handle resource read requests
    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const { uri } = request.params;

      try {
        if (uri === "rule://README") {
          return await this.getRuleReadme(false);
        }

        // Extract rule name from URI (format: rule://rule-name)
        const match = uri.match(/^rule:\/\/(.+)$/);
        if (!match) {
          throw new Error(`Invalid resource URI: ${uri}`);
        }

        const ruleName = match[1];
        return await this.getRule(ruleName, false);
      } catch (error) {
        return {
          contents: [
            {
              uri,
              mimeType: "text/plain",
              text: `Error reading resource: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  // Git operations
  async ensureCacheDir() {
    try {
      await fs.mkdir(this.cacheDir, { recursive: true });
    } catch (error) {
      // Directory might already exist, that's fine
    }
  }

  async cloneOrUpdateRepo(refresh = false) {
    await this.ensureCacheDir();

    const repoExists = await fs
      .access(this.rulesRepoPath)
      .then(() => true)
      .catch(() => false);

    if (repoExists && !refresh) {
      // Check if we need to update (based on cache TTL)
      const cacheAge = this.lastFetchTime
        ? Date.now() - this.lastFetchTime
        : Infinity;
      const cacheTTL = this.config.cacheTTL || 3600000; // Default 1 hour

      if (cacheAge < cacheTTL) {
        console.error(`Using cached rules (age: ${Math.round(cacheAge / 1000)}s)`);
        return;
      }
    }

    if (this.fetchLock) {
      console.error("Fetch already in progress, waiting...");
      while (this.fetchLock) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      return;
    }

    this.fetchLock = true;

    try {
      if (repoExists) {
        console.error("Updating rules repository...");
        await execAsync(`git pull`, { cwd: this.rulesRepoPath });
      } else {
        console.error(`Cloning rules repository from ${this.config.gitRepo}...`);
        await execAsync(
          `git clone ${this.config.gitRepo} "${this.rulesRepoPath}"`
        );
      }

      // Handle branch/ref if specified
      if (this.config.gitBranch) {
        await execAsync(`git checkout ${this.config.gitBranch}`, {
          cwd: this.rulesRepoPath,
        });
      }

      this.lastFetchTime = Date.now();
      console.error("Rules repository updated successfully");
    } catch (error) {
      throw new Error(
        `Failed to fetch rules from Git: ${error.message}\n\nMake sure:\n1. Git is installed\n2. The repository URL is correct\n3. You have access to the repository`
      );
    } finally {
      this.fetchLock = false;
    }
  }

  async refreshRules() {
    await this.cloneOrUpdateRepo(true);
    return {
      content: [
        {
          type: "text",
          text: "Rules refreshed successfully from Git repository",
        },
      ],
    };
  }

  // Rule retrieval
  async getRulesPath() {
    // Support both .cursor/rules/ and rules/ directory structures
    const possiblePaths = [
      path.join(this.rulesRepoPath, ".cursor", "rules"),
      path.join(this.rulesRepoPath, "rules"),
      path.join(this.rulesRepoPath, ".cursorrules"),
      this.rulesRepoPath,
    ];

    for (const rulesPath of possiblePaths) {
      try {
        const stat = await fs.stat(rulesPath);
        if (stat.isDirectory() || stat.isFile()) {
          return rulesPath;
        }
      } catch {
        // Continue to next path
      }
    }

    throw new Error(
      `Could not find rules directory. Checked: ${possiblePaths.join(", ")}`
    );
  }

  async getRule(ruleName, refresh = false) {
    await this.cloneOrUpdateRepo(refresh);
    const rulesPath = await this.getRulesPath();

    // Try different file extensions
    const extensions = [".mdc", ".md", ".txt"];
    let ruleContent = null;
    let foundFile = null;

    for (const ext of extensions) {
      const possibleFiles = [
        path.join(rulesPath, `${ruleName}${ext}`),
        path.join(rulesPath, ruleName, `README${ext}`),
      ];

      for (const filePath of possibleFiles) {
        try {
          const content = await fs.readFile(filePath, "utf-8");
          ruleContent = content;
          foundFile = filePath;
          break;
        } catch {
          // Continue to next file
        }
      }

      if (ruleContent) break;
    }

    if (!ruleContent) {
      // List available files to help user
      try {
        const files = await fs.readdir(rulesPath);
        const availableRules = files
          .filter((f) => f.endsWith(".mdc") || f.endsWith(".md"))
          .map((f) => f.replace(/\.(mdc|md)$/, ""));

        return {
          content: [
            {
              type: "text",
              text: `Rule "${ruleName}" not found.\n\nAvailable rules:\n${availableRules.map((r) => `- ${r}`).join("\n")}\n\nSearched in: ${rulesPath}`,
            },
          ],
          isError: true,
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Rule "${ruleName}" not found and could not list available rules: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    }

    return {
      content: [
        {
          type: "text",
          text: `# Rule: ${ruleName}\n\nSource: ${foundFile}\n\n---\n\n${ruleContent}`,
        },
      ],
    };
  }

  async listRules(refresh = false) {
    await this.cloneOrUpdateRepo(refresh);
    const rulesPath = await this.getRulesPath();

    try {
      const files = await fs.readdir(rulesPath);
      const rules = files
        .filter((f) => f.endsWith(".mdc") || f.endsWith(".md"))
        .filter((f) => f !== "README.md")
        .map((f) => ({
          name: f.replace(/\.(mdc|md)$/, ""),
          file: f,
        }));

      const rulesList = rules.map((r) => `- ${r.name} (${r.file})`).join("\n");

      return {
        content: [
          {
            type: "text",
            text: `Available rules (${rules.length}):\n\n${rulesList}\n\nUse get_rule with the rule name (without extension) to retrieve a specific rule.`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error listing rules: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }

  async getAllRules(refresh = false) {
    await this.cloneOrUpdateRepo(refresh);
    const rulesPath = await this.getRulesPath();

    try {
      const files = await fs.readdir(rulesPath);
      const ruleFiles = files.filter(
        (f) => (f.endsWith(".mdc") || f.endsWith(".md")) && f !== "README.md"
      );

      const allRules = [];

      for (const file of ruleFiles) {
        try {
          const content = await fs.readFile(
            path.join(rulesPath, file),
            "utf-8"
          );
          allRules.push(`\n\n# ${file}\n\n${content}\n\n---`);
        } catch (error) {
          console.error(`Error reading ${file}: ${error.message}`);
        }
      }

      return {
        content: [
          {
            type: "text",
            text: `# All Cursor Rules\n\n${allRules.join("\n")}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error retrieving all rules: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }

  async getRuleReadme(refresh = false) {
    await this.cloneOrUpdateRepo(refresh);
    const rulesPath = await this.getRulesPath();

    const readmePaths = [
      path.join(rulesPath, "README.md"),
      path.join(this.rulesRepoPath, "README.md"),
    ];

    for (const readmePath of readmePaths) {
      try {
        const content = await fs.readFile(readmePath, "utf-8");
        return {
          content: [
            {
              type: "text",
              text: content,
            },
          ],
        };
      } catch {
        // Continue to next path
      }
    }

    return {
      content: [
        {
          type: "text",
          text: "README.md not found in the rules repository",
        },
      ],
      isError: true,
    };
  }

  // Prompt builders
  async buildConsistencyPrompt(context) {
    const consistencyRule = await this.getRule("documentation-consistency", false);
    const ruleText = consistencyRule.content[0].text;

    return {
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Apply these documentation consistency rules:\n\n${ruleText}\n\n---\n\nContext: ${context}\n\nPlease apply these rules to ensure consistency across all related documentation.`,
          },
        },
      ],
    };
  }

  async buildCompletenessPrompt(phase, documentType) {
    const completenessRule = await this.getRule("completeness-validation", false);
    const ruleText = completenessRule.content[0].text;

    const docTypeContext = documentType
      ? `\n\nDocument type: ${documentType}`
      : "";

    return {
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Validate completeness using these rules:\n\n${ruleText}\n\n---\n\nPhase: ${phase}${docTypeContext}\n\nPlease validate that all required artifacts and documentation are complete.`,
          },
        },
      ],
    };
  }

  async buildObjectiveAlignmentPrompt(workDescription, objectives) {
    const alignmentRule = await this.getRule("objective-alignment", false);
    const ruleText = alignmentRule.content[0].text;

    return {
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Check objective alignment using these rules:\n\n${ruleText}\n\n---\n\nWork Description: ${workDescription}\n\nObjectives: ${objectives}\n\nPlease verify that the work aligns with the stated objectives and follows the alignment framework.`,
          },
        },
      ],
    };
  }

  async buildPlanPhasePrompt(phaseName, context) {
    try {
      const planningRule = await this.getRule("roadmap-planning-guide", false);
      const objectiveRule = await this.getRule("objective-alignment", false);
      const planningText = planningRule.content[0].text;
      const objectiveText = objectiveRule.content[0].text;

      const contextPart = context ? `\n\nContext: ${context}` : "";

      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `Plan a new roadmap phase using these guidelines:\n\n## Planning Guide\n${planningText}\n\n## Objective Alignment\n${objectiveText}\n\n---\n\nPhase Name: ${phaseName}${contextPart}\n\nPlease help plan this phase following the planning guide and objective alignment framework.`,
            },
          },
        ],
      };
    } catch (error) {
      // Fallback if planning guide doesn't exist
      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `Plan a new roadmap phase:\n\nPhase Name: ${phaseName}\n\nContext: ${context || "No context provided"}\n\nPlease help plan this phase.`,
            },
          },
        ],
      };
    }
  }

  async buildJiraInitiativePrompt(initiativeDetails) {
    const jiraRule = await this.getRule("jira-initiative-epic-standards", false);
    const ruleText = jiraRule.content[0].text;

    return {
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Review this JIRA Initiative against organizational standards:\n\n${ruleText}\n\n---\n\nInitiative Details:\n${initiativeDetails}\n\nPlease review this Initiative and provide feedback based on the organizational standards.`,
          },
        },
      ],
    };
  }

  async buildJiraEpicPrompt(epicDetails) {
    const jiraRule = await this.getRule("jira-initiative-epic-standards", false);
    const ruleText = jiraRule.content[0].text;

    return {
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Review this JIRA Epic against organizational standards:\n\n${ruleText}\n\n---\n\nEpic Details:\n${epicDetails}\n\nPlease review this Epic and provide feedback based on the organizational standards.`,
          },
        },
      ],
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("Cursor Rules MCP server running on stdio");
    console.error(`Git repository: ${this.config.gitRepo}`);
    console.error(`Cache directory: ${this.cacheDir}`);
  }
}

// Load configuration
async function loadConfig() {
  const configPath = path.join(__dirname, "config.json");
  try {
    const configContent = await fs.readFile(configPath, "utf-8");
    return JSON.parse(configContent);
  } catch (error) {
    // Create default config if it doesn't exist
    const defaultConfig = {
      gitRepo: "https://github.com/your-username/your-rules-repo.git",
      gitBranch: "main",
      cacheTTL: 3600000,
    };

    console.error(
      `Config file not found at ${configPath}. Please create config.json with:\n${JSON.stringify(defaultConfig, null, 2)}`
    );
    process.exit(1);
  }
}

// Main
loadConfig()
  .then((config) => {
    const server = new RulesMCPServer(config);
    server.run().catch(console.error);
  })
  .catch((error) => {
    console.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  });