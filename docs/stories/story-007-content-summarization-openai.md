# Story: Content Summarization with OpenAI

**Status**: To Do

---

## Related Requirement
This story relates to the [Summary Generation](../requirements.md#2-content-organization) section of the requirements document, specifically the "Intelligent Content Summarization" and "Direct ChatGPT integration" requirements.

## Alignment with Design
This story aligns with the [Content Summarization](../design.md#feature-content-summarization) section of the design document, the [AI Processing Architecture](../architecture.md#ai-processing-architecture) section of the architecture document, and the [Content Value Principles](../content-value-principles.md) document.

## Acceptance Criteria
- OpenAI API integration is implemented
- Two-level summary system is created:
  - Brief 1-3 sentence overview for quick scanning
  - Detailed summary for deeper understanding
- Summaries are stored in the database to avoid regeneration
- Fallback to GPT-3.5-turbo is implemented for cost optimization
- Time-to-consume estimates are generated for content
- Content complexity is detected and flagged when too complex for brief summary
- Structured JSON output is returned with standardized fields
- Content type detection and classification is implemented
- Time sensitivity is flagged for applicable content
- Required background knowledge is identified and listed
- Answer-Forward Testing methodology is applied to validate summaries
- Summaries meet the quality criteria specified in the requirements
- gptAnalyze feature is implemented for direct ChatGPT deep analysis
- Three-tier analysis system is available to users with appropriate UI elements
- Implementation adheres to the five Content Value Principles
- Summary quality metrics are tracked according to Content Value Principles

## Tasks
- [ ] Follow Test-Driven Development (TDD) principles for all implemented features:
  - [ ] Write tests before implementing the feature code
  - [ ] Ensure all code has appropriate test coverage
  - [ ] Run tests continuously during development
- [ ] Set up OpenAI API integration:
  - [ ] Configure API access with environment variables
  - [ ] Implement API client with rate limiting and error handling
  - [ ] Create testing utilities for the API
- [ ] Design and implement prompt templates aligned with Content Value Principles:
  - [ ] Create prompt for brief summary generation with JSON output (focusing on Purpose & Novelty principles)
  - [ ] Develop prompts tailored to specific content types (technical, news, analysis, tutorial, entertainment)
  - [ ] Implement prompt for detailed summary (balancing all five principles)
  - [ ] Create prompt for content type classification
  - [ ] Design prompt for background knowledge identification
  - [ ] Develop content-type specific prompts for gptAnalyze deep analysis (covering all five principles)
- [ ] Implement two-level summary system:
  - [ ] Create service for brief summary generation
  - [ ] Create service for detailed summary generation
  - [ ] Implement model selection logic (GPT-4 vs GPT-3.5-turbo)
  - [ ] Add content type detection for prompt customization
  - [ ] Implement JSON parsing and validation for API responses
- [ ] Implement gptAnalyze feature:
  - [ ] Create utility function for generating ChatGPT URLs with analysis prompts
  - [ ] Implement content-type specific analysis prompts
  - [ ] Create UI component for initiating deep analysis
  - [ ] Add usage tracking for analytics
- [ ] Implement database storage:
  - [ ] Create database schema for summaries with all metadata fields
  - [ ] Implement repository for summary storage and retrieval
  - [ ] Add caching layer to avoid unnecessary API calls
- [ ] Implement time-to-consume estimation:
  - [ ] Create algorithm for reading time estimation based on word count
  - [ ] Create algorithm for video/audio duration extraction
  - [ ] Implement mixed content time calculation
  - [ ] Develop platform-specific extractors (YouTube, articles, etc.)
  - [ ] Store estimates in the database
- [ ] Implement content complexity detection:
  - [ ] Create algorithm to assess content complexity
  - [ ] Add flagging system for complex content
  - [ ] Store complexity metrics in the database
- [ ] Implement Answer-Forward Testing based on Content Value Principles:
  - [ ] Create algorithm to identify natural questions from summaries
  - [ ] Validate summary completeness against standard questions by content type
  - [ ] Create feedback loop to improve summaries that don't pass validation
  - [ ] Implement example-based validation using the validation examples
- [ ] Implement quality testing framework:
  - [ ] Set up evaluation process using GPT-4 to assess GPT-3.5 summaries
  - [ ] Define metrics for clarity, accuracy, and completeness
  - [ ] Implement test harness for automated evaluation
  - [ ] Create dashboard for quality metrics tracking
  - [ ] Implement Content Value Metrics tracking
- [ ] Create API endpoints:
  - [ ] Endpoint to generate summaries for content
  - [ ] Endpoint to retrieve existing summaries
  - [ ] Endpoint to regenerate summaries if needed
- [ ] Implement frontend components:
  - [ ] Summary display component with metadata visualization
  - [ ] Content type indicator and badge
  - [ ] Time-to-consume display
  - [ ] Required background knowledge tags
  - [ ] Time sensitivity indicator
  - [ ] Summary loading state
  - [ ] Error handling for failed summarization
  - [ ] Toggle between brief and detailed summaries
  - [ ] gptAnalyze button for initiating deep analysis
  - [ ] Value metrics visualization

## Notes
- OpenAI API costs should be carefully monitored
- Caching is critical to avoid unnecessary API calls
- Consider implementing a queue system for batch processing
- Prompt engineering is crucial for quality summaries
- Test with various content types to ensure robustness
- Keep temperature setting low (0.1-0.3) for consistency in formatted responses
- Use response_format parameter to enforce JSON output structure
- Consider implementing a feedback mechanism to improve summaries over time
- Implement error handling for edge cases and unusually long content
- The gptAnalyze feature provides deep analysis without additional API costs
- Track usage patterns of gptAnalyze to understand user preferences
- Consider implementing a way to capture and save insights from gptAnalyze sessions
- Ensuring consistency with Content Value Principles improves user experience
- Balance between the different principles based on content type and summary level 