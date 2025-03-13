# Content Value Principles

This document defines the core principles for evaluating content value in the AI Feed Consolidator and guides our multi-tiered approach to content analysis and summarization.

## Core Principles

Our content processing features are guided by five fundamental principles that inform how we assess, summarize, and analyze content:

### 1. Purpose & Nature
- Content type and format
- Time sensitivity
- Standalone vs series/narrative
- Primary function (inform, analyze, entertain)
- Target audience/required knowledge
- Application: Primary focus for quick summaries

### 2. Novelty & Change
- New information or developments
- Changes to existing understanding
- Why it matters now
- Impact and implications
- Application: Primary focus for quick summaries

### 3. Truth & Information Quality
- Factual accuracy
- Quality of evidence/sources
- Clarity of reasoning
- Logical implications of claims
- Gaps between assertions and conclusions
- Hidden assumptions in reasoning chains
- Application: Focus for deep analysis

### 4. Context & Dependencies
- Required background knowledge
- Related events/topics
- Historical precedents
- System interactions/dependencies
- Application: Important for both summary and deep analysis

### 5. Perspective & Framing
- Identified biases/viewpoints
- Competing interpretations
- What's explicitly included vs omitted
- Assumptions made in the framing
- Application: Primary focus for deep analysis

## Multi-Tier Analysis System

These principles are applied differently across our three-tiered content analysis system:

### Tier 1: Quick Summary
- 1-3 sentence format (max 50 words)
- Focus on Principles 1 & 2 (Purpose & Novelty)
- Critical context only
- Implemented via OpenAI API
- Answer-Forward Testing validation

### Tier 2: Detailed Summary
- Extended format with structured sections
- Balance of all five principles
- More comprehensive context
- Implemented via OpenAI API
- Includes metadata and categorization

### Tier 3: Deep Analysis (gptAnalyze)
- Comprehensive coverage of all principles
- Full logical analysis
- Complete context exploration
- Multiple perspective consideration
- Implemented via direct ChatGPT integration

## Answer-Forward Testing

A core validation methodology ensuring our summaries preemptively answer the obvious follow-up questions they raise.

### Principle
A good summary should anticipate and answer the natural questions that arise from its own statements. If an important question arises that could be answered concisely, the summary should include that answer.

### Standard Questions by Content Type

#### Technical Content
- What is the new approach/technology?
- How does it differ from existing solutions?
- What are the key improvements/capabilities?
- What background knowledge is required?

#### News/Current Events
- What specifically changed/happened?
- Who is affected and how?
- When does it take effect?
- What are the immediate implications?

#### Analysis/Opinion
- What is the main argument?
- What evidence supports it?
- What are the key assumptions?
- What alternatives are considered?

#### Tutorial/Educational
- What will you learn?
- What prerequisites are needed?
- What practical applications exist?
- How long/deep is the content?

### Validation Example

**Poor Summary:**
"Technical deep-dive explaining a new approach to quantum computing that claims 10x performance improvement. Requires understanding of quantum gates. Part 3 of ongoing series."

**Natural Questions:**
- What is the new approach?
- How does it achieve improvement?
- What parts are covered in this piece?

**Improved Summary:**
"Technical deep-dive: New quantum computing approach uses topological qubits for error correction, claiming 10x performance over standard gates. This part covers implementation details and hardware requirements. Requires understanding of quantum gates. Part 3 of ongoing series."

## Deep Analysis Prompts

Our gptAnalyze feature uses customized deep analysis prompts based on content type. The core prompt structure is:

```
Analyze [URL]

Please search the web and provide:
1. Main arguments and key findings
2. Supporting evidence and data
3. Context and implications
4. Notable quotes or statements
5. Technical details or methodologies
6. Critical evaluation of:
   - Implicit assumptions in the reasoning
   - How well conclusions follow from evidence
   - Gaps or ambiguities that undermine arguments
   - Alternative interpretations or perspectives
```

This comprehensive prompt ensures coverage of all five Content Value Principles.

## Content Value Metrics

We evaluate our content processing features using the following metrics:

### Summary Quality Metrics
- Answer Completeness: How well summaries address obvious follow-up questions
- Information Density: Ratio of key insights to word count
- Accuracy: Factual correctness compared to source
- Relevance: Focus on what's new and important

### Processing Effectiveness Metrics
- User Engagement: How often users interact with each tier
- Progression Rate: How often users move from summary to deep analysis
- Time Saved: Estimated reading time saved through summarization
- Insight Generation: Novel connections or implications surfaced

## Related Documents

- [Design Document](./design.md)
- [Content Summarization Story](./stories/story-007-content-summarization-openai.md)
- [Answer-Forward Testing Story](./stories/story-019-answer-forward-testing.md)
- [gptAnalyze Component Story](./stories/story-024-gptanalyze-component.md)
- [Content Value Metrics](./content-value-metrics.md)
- [Content Value Metrics Dashboard Story](./stories/story-025-content-value-metrics-dashboard.md)

This document serves as the foundational philosophy for all content processing features in the AI Feed Consolidator, ensuring they deliver genuine value to users through a consistent, principled approach to content analysis. 