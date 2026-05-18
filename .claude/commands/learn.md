---
name: learn
description: Deep-dive into a technical topic with practical examples, team advice, and Claude Code workflow tips
argument-hint: <topic>
allowed-tools: [Read, Glob, Grep, Bash, Agent, WebSearch, WebFetch, Write]
---

# Learn

Deep-dive into a technical topic. The goal is not just understanding — it's building the kind of understanding you can use at work and teach to your team.

## Arguments

The user wants to learn about: $ARGUMENTS

## Context

The user is a software engineer with a full-time day job who builds QR Foundry as a side project. They want to:
1. **Understand the topic deeply** — not surface-level summaries
2. **Connect it to real code** — use their QR Foundry codebase or day-job patterns as concrete examples
3. **Prepare team advice** — distill what they learn into actionable guidance they can share with their team
4. **Optimize for Claude Code workflows** — their team uses Claude Code without MCP servers, so tips should work within that constraint

## Research Phase

1. **Web search** for authoritative sources on the topic — official docs, well-regarded blog posts, RFCs, or conference talks. Prefer primary sources over summaries.

2. **Check the QR Foundry codebase** for relevant examples. Search across all repos:
   - `/Users/jonathanlam/code/qr-foundry/qr-foundry-app/`
   - `/Users/jonathanlam/code/qr-foundry/qr-foundry-worker/`
   - `/Users/jonathanlam/code/qr-foundry/qr-foundry-api/`
   - `/Users/jonathanlam/code/qr-foundry/qr-foundry-site/`

   If the topic is already implemented (or partially implemented) in the codebase, use that as the primary teaching example. If it's not, identify where it *would* apply.

3. **Check memory** for any stored context about the user's day job, tech stack, or team that would help tailor the explanation.

## Output Structure

### 1. What it is
Plain-language explanation. No jargon without definition. Build from first principles — assume the user is smart but hasn't encountered this specific topic before.

### 2. Why it matters
When would you reach for this? What problem does it solve? What goes wrong without it? Use concrete scenarios, not abstract benefits.

### 3. How it works
The mechanics. Go deep enough that the user could explain it in a technical discussion or code review. Use diagrams (ASCII art) where they help. Show real code examples — preferably from their own codebase, otherwise create minimal examples.

### 4. In your codebase
Point to specific files/patterns in QR Foundry that relate to this topic:
- **Already doing it**: "You're already using this pattern here: `file:line`"
- **Could benefit from it**: "This would improve X in your worker/app/api"
- **Doing it wrong**: "This part of your code has the exact problem this solves"

If the topic doesn't relate to the codebase, say so and skip this section.

### 5. Team advice
Practical guidance the user can bring back to their team. Structure as:
- **The pitch**: 2-3 sentences explaining why the team should care (written as if the user is saying it in a team meeting or Slack message)
- **Quick wins**: Things the team can do immediately with low effort
- **Patterns to adopt**: Longer-term practices worth establishing
- **Common mistakes**: What teams usually get wrong with this topic
- **Code review checklist**: Specific things to look for in PRs related to this topic

### 6. Claude Code tips
How to use Claude Code effectively for this topic, keeping in mind the team does NOT have MCP servers. Focus on:
- Useful prompts or slash commands
- CLAUDE.md instructions that would help Claude apply this pattern correctly
- Hooks that could enforce the pattern
- What Claude Code does well vs. poorly for this topic
- Workarounds for the lack of MCP (e.g., using `! commands`, manual context loading)

### 7. Go deeper (optional)
If the topic has interesting depth, provide 2-3 follow-up questions or subtopics the user might want to explore next, with a one-line hook for each.

## Style

- Be direct and concrete. No filler.
- Use code examples liberally — reading code is faster than reading prose for an engineer.
- When there are tradeoffs, present them honestly. Don't oversell patterns.
- If something is genuinely simple, say so. Don't inflate complexity to seem thorough.
- If the user's codebase has a relevant anti-pattern, point it out respectfully — that's the most valuable kind of learning.

## Memory

After completing the research, save a memory note if the topic reveals something worth remembering about:
- The user's learning interests or knowledge gaps
- Their team's tech stack or constraints
- Patterns they're adopting or considering
