

# .cursor/rules/ Documentation

**Project:** AI Research (Template Repository)  
**Purpose:** Template Repository - Rules for AI-Assisted Production Code Development  
**Structure Version:** 2.1.0  
**Last Updated:** 2025-01-22

---

## Overview

This directory contains reusable `.cursor/rules` templates that can be copied to production projects to enable AI-assisted development with specialized personas.

**⚠️ Important:** This README documents the template repository itself. When you copy these rules to your production project:
- **REQUIRED:** Update `core/project-overview.mdc` with YOUR project details
- **OPTIONAL:** Remove `meta-project-purpose.mdc` if not maintaining templates
- **OPTIONAL:** Remove template-generation files if not creating templates

## Directory Structure

```
.cursor/
├── rules.mdc                          # Main entry point with @import statements
└── rules/
    ├── 00-critical/                   # Critical rules (Priority 1)
    │   └── meta-project-purpose.mdc   # ⚠️ READ FIRST - Explains template usage (for template users)
    │
    ├── core/                          # Core project rules (Priority 2)
    │   ├── project-overview.mdc       # Template placeholder - FILL IN YOUR PROJECT DETAILS
    │   └── template-principles.mdc    # Template design principles and standards
    │
    ├── development/                   # Development standards (Priority 3)
    │   ├── 10-code-style.mdc         # Code style guidelines
    │   ├── 20-testing.mdc            # Testing standards and best practices
    │   ├── git-workflow.mdc          # Git commit and branch standards
    │   └── analysis-methodology.mdc   # Mandatory analysis framework
    │
    ├── documentation/                 # Documentation standards (Priority 4)
    │   ├── standards.mdc              # Documentation guidelines and templates
    │   ├── clear-documentation-principles.mdc  # Clear documentation principles
    │   ├── mermaid-diagram-syntax-rules.mdc   # Mermaid diagram rules
    │   ├── context-summarization.mdc          # Context management
    │   ├── recommendation-file-management.mdc  # Recommendation tracking
    │   └── change-tracking-best-practices.mdc # Change tracking
    │
    ├── ai-guidelines/                 # AI-specific guidance (Priority 5)
    │   ├── knowledge-synthesis.mdc    # How to synthesize cross-project learnings
    │   └── template-generation.mdc    # How to generate reusable templates
    │
    ├── personas/                      # Persona definitions (Priority 6) - 19 Total
    │   ├── # Core Development (4)
    │   ├── persona-developer.mdc
    │   ├── persona-qa-engineer.mdc
    │   ├── persona-devops-engineer.mdc
    │   ├── persona-security-engineer.mdc
    │   │
    │   ├── # Architecture & Design (5)
    │   ├── persona-enterprise-architect.mdc
    │   ├── persona-solution-architect.mdc
    │   ├── persona-solution-architecture-document-author.mdc
    │   ├── persona-technical-design-engineer.mdc
    │   ├── persona-ux-designer.mdc
    │   │
    │   ├── # Product & Business (2)
    │   ├── persona-product-manager.mdc
    │   ├── persona-technical-product-manager.mdc
    │   │
    │   ├── # Process & Leadership (1)
    │   ├── persona-scrum-master.mdc
    │   │
    │   └── # Analysis & Specialized (7)
    │       ├── persona-security-analyst.mdc
    │       ├── persona-data-flow-analyst.mdc
    │       ├── persona-integration-analyst.mdc
    │       ├── persona-business-logic-analyst.mdc
    │       ├── persona-hook-event-analyst.mdc
    │       ├── persona-financial-analyst.mdc
    │       └── persona-trac-analyst.mdc
    │
    ├── templates/                     # Template-specific rules (Priority 8)
    │   └── (Future: Domain-specific template rules)
    │
    └── integrations/                  # External integrations (Priority 7)
        └── (Future: JIRA, Git, CI/CD integrations)
```

## Key Features

### 1. Modular Architecture

- **Main Entry Point:** `rules.mdc` controls loading order
- **@import Support:** Modular files loaded via `@import` statements
- **Hierarchical Organization:** Logical grouping by functional area
- **Easy Customization:** Enable/disable modules by commenting imports

### 2. YAML Frontmatter Metadata

Every `.mdc` file includes metadata:

```yaml
---
description: Brief description of file purpose
globs: ["**/*.py", "**/*.js"]  # File patterns where this applies
tags: [relevant, categorization, tags]
priority: 1-10  # Lower number = higher priority
version: 1.0.0  # Semantic versioning
---
```

### 3. Priority-Based Loading

Files are loaded in priority order:

1. **Priority 1:** Critical rules (00-critical/)
2. **Priority 2:** Core project rules (core/)
3. **Priority 3:** Development standards (development/)
4. **Priority 4:** Documentation standards (documentation/)
5. **Priority 5:** AI guidelines (ai-guidelines/)
6. **Priority 6:** Personas (personas/)
7. **Priority 7:** Integrations (integrations/)
8. **Priority 8:** Templates (templates/)

## Quick Start

### For Template Users (Copying to Production Project)

1. **Copy `.cursor/rules/` to your production project**
   ```bash
   cp -r .cursor/rules/ /path/to/your/production/project/.cursor/
   ```

2. **Read `00-critical/meta-project-purpose.mdc` FIRST**
   - Understand this is a template repository
   - Follow instructions for copying to your project

3. **REQUIRED: Update `core/project-overview.mdc`**
   - Fill in YOUR project details
   - Replace all `[Your Project Name]` placeholders
   - Customize for your technology stack

4. **Select relevant personas**
   - Enable/disable personas in `rules.mdc` based on your needs

### For Template Maintainers (This Repository)

1. **Read `00-critical/meta-project-purpose.mdc` FIRST**
   - Understand this is a template repository, not a typical development project
   - Focus on template generation and knowledge synthesis
   - Think reusability and generalization

2. **Review Core Principles**
   - `core/project-overview.mdc` - Template placeholder structure
   - `core/template-principles.mdc` - Template design standards

3. **Follow AI Guidelines**
   - `ai-guidelines/knowledge-synthesis.mdc` - How to synthesize learnings
   - `ai-guidelines/template-generation.mdc` - How to create templates

4. **Use Appropriate Personas**
   - Load personas relevant to current task
   - Adapt persona behavior for template creation context

### For Developers Using the Template

1. **Understand the Template Structure**
   - All rules are designed for production code development
   - Customize `project-overview.mdc` for your project
   - Remove template-specific files if not maintaining templates

2. **Review Structure Standards**
   - Understand modular `.mdc` architecture
   - Learn `@import` pattern usage
   - See main `README.md` for complete usage guide

3. **Follow Git Workflow**
   - See `development/git-workflow.mdc`
   - Use standardized commit messages with Jira ticket prefix
   - Follow branch naming conventions

## How to Use This Structure

### Viewing Rules

The main entry point is `.cursor/rules.mdc`. Cursor AI automatically loads this file and processes all `@import` statements.

### Enabling/Disabling Modules

Comment out `@import` lines in `rules.mdc` to disable modules:

```markdown
## Development Standards
@import ./rules/development/10-code-style.mdc
@import ./rules/development/20-testing.mdc
# @import ./rules/development/git-workflow.mdc  # Disabled temporarily
```

### Adding New Rules

1. **Choose appropriate directory** based on category
2. **Create `.mdc` file** with YAML frontmatter
3. **Add content** following template standards
4. **Import in `rules.mdc`** at appropriate location
5. **Test** to verify it loads correctly

**Example:**

```markdown
---
description: API design standards
globs: ["**/*.ts", "**/*.js"]
tags: [development, api, standards]
priority: 3
version: 1.0.0
---

# API Design Standards

[Your content here]
```

### Updating Existing Rules

1. **Edit the `.mdc` file** directly
2. **Update version** in frontmatter if significant changes
3. **Update changelog** in file or `rules.mdc`
4. **Test** to ensure no breaking changes

## Customization for Production Projects

**When copying this template to your production project:**

### Step 1: Copy Rules to Your Project

```bash
# Copy .cursor/rules/ directory to your production project
cp -r .cursor/rules/ /path/to/your/production/project/.cursor/
```

### Step 2: Update Project Context (REQUIRED)

```bash
# Edit project-overview.mdc and fill in YOUR project details
# Replace [Your Project Name], [Your Project Type], etc.
```

### Step 3: Remove Template-Specific Files (OPTIONAL)

```bash
# Optional: Remove template-specific files if not maintaining templates
# These are only needed for template creators
rm .cursor/rules/00-critical/meta-project-purpose.mdc  # Can remove after reading
rm .cursor/rules/ai-guidelines/knowledge-synthesis.mdc  # Only for template creators
rm .cursor/rules/ai-guidelines/template-generation.mdc  # Only for template creators
```

### Step 4: Add Project-Specific Files

```bash
# Add your project-specific rules
# Example: Business rules
cat > .cursor/rules/core/business-rules.mdc << 'EOF'
---
description: Business domain rules and constraints
globs: "**/*"
tags: [core, business, domain]
priority: 2
version: 1.0.0
---

# Business Rules

[Your business rules here]
EOF
```

### Step 5: Update Main Entry Point

Edit `.cursor/rules.mdc`:

```markdown
---
description: Main Cursor rules configuration for [Your Project]
globs: "**/*"
tags: [main, configuration]
priority: 1
version: 2.0.0
project_type: [your-project-type]
---

# [Your Project] - Cursor Rules Configuration

## CRITICAL RULES
# Remove meta-project import
# @import ./rules/00-critical/meta-project-purpose.mdc

## Core Project Rules
@import ./rules/core/project-overview.mdc
@import ./rules/core/business-rules.mdc  # Add your rules

# ... rest of imports
```

### Step 4: Customize Personas

Enable only personas relevant to your team:

```markdown
## Personas
@import ./rules/personas/persona-developer.mdc
@import ./rules/personas/persona-qa-engineer.mdc
# @import ./rules/personas/persona-devops-engineer.mdc  # Not needed for this project
```

## File Naming Conventions

- **Use descriptive names:** `git-workflow.mdc` not `git.mdc`
- **Use kebab-case:** `code-style.mdc` not `CodeStyle.mdc`
- **Group related files:** `jira-integration.mdc`, `jira-worklog.mdc`
- **Number for priority:** `00-critical/`, `10-code-style.mdc`
- **Use `.mdc` extension:** Enables `@import` and metadata support

## Best Practices

### Do's ✅

- Keep files focused on single topics
- Use YAML frontmatter metadata
- Provide concrete examples
- Document rationale ("why" not just "what")
- Version files appropriately
- Test changes before committing
- Keep documentation current

### Don'ts ❌

- Don't create monolithic files
- Don't skip metadata
- Don't hardcode project-specific values in templates
- Don't duplicate content (use `@import`)
- Don't skip examples
- Don't forget to update version numbers

## Troubleshooting

### Rules Not Loading

1. **Check `@import` path** - Must be relative to `rules.mdc`
2. **Verify file exists** - Typos in filename or path
3. **Check YAML frontmatter** - Must be valid YAML
4. **Review Cursor logs** - Check for parsing errors

### Conflicts Between Rules

1. **Check priority** - Lower priority number loads first
2. **Review `@import` order** - Later imports can override earlier ones
3. **Use specific globs** - Target rules to specific file types
4. **Document precedence** - Explain which rule takes precedence

### Performance Issues

1. **Reduce number of imports** - Combine related rules
2. **Use specific globs** - Don't apply rules to all files unnecessarily
3. **Optimize file size** - Keep individual files focused
4. **Cache effectively** - Cursor caches loaded rules

## Related Documentation

### In This Project

- `docs/learnings/COMPREHENSIVE_PERSONA_FRAMEWORK_SYNTHESIS_20251027.md` - Cross-project analysis
- `docs/recommendations/CURSOR_RULES_STRUCTURE_BEST_PRACTICES_20251027.md` - Structure recommendations
- `docs/learnings/AI_RESEARCH_PROJECT_ADAPTATION_20251027.md` - Meta-project adaptation
- `Multi-IDE_Persona_Analysis_Strategy.md` - Multi-workspace analysis

### External Resources

- [Cursor Documentation](https://cursor.sh/docs)
- [Markdown Guide](https://www.markdownguide.org/)
- [YAML Specification](https://yaml.org/spec/)
- [Semantic Versioning](https://semver.org/)

## Maintenance

### Review Cycle

- **Critical rules:** Review monthly
- **Core rules:** Review quarterly
- **Development rules:** Review semi-annually
- **Personas:** Review annually
- **Templates:** Review when feedback received

### Update Process

1. **Identify need** for update (feedback, new learnings, etc.)
2. **Draft changes** in separate branch
3. **Test changes** with AI assistant
4. **Update version** and changelog
5. **Commit with descriptive message**
6. **Monitor** for issues after deployment

### Version Management

Follow semantic versioning:

- **Major (2.0.0):** Breaking changes, structural reorganization
- **Minor (2.1.0):** New features, additional rules
- **Patch (2.1.1):** Bug fixes, clarifications, typos

## Support

### Questions or Issues?

1. **Check this README** first
2. **Review related documentation** in `docs/`
3. **For template users:** See main `README.md` in repository root
4. **For template maintainers:** See template maintenance guidelines above
5. **Create new issue** if needed in the template repository

### Contributing

**For Template Users:**
- Use the rules in your production project
- Customize `project-overview.mdc` for your project
- Follow git workflow standards (see `development/git-workflow.mdc`)

**For Template Maintainers:**
1. **Follow git workflow** standards (see `development/git-workflow.mdc`)
2. **Test changes** thoroughly with multiple project types
3. **Update documentation** as needed
4. **Submit pull request** with clear description
5. **Respond to feedback** promptly

---

**Template Repository:** AI Research Team  
**Last Updated:** 2025-01-22  
**Version:** 2.1.0  
**Next Review:** 2026-04-22

**Questions?** Create an issue in the template repository tracker.
