# Story: Content Consumption Time Calculator

**Status**: To Do

---

## Related Requirement
This story relates to the [Summary Generation](../requirements.md#2-content-organization) section of the requirements document, specifically helping users prioritize content based on time investment required.

## Alignment with Design
This story aligns with the [Content Summarization](../design.md#feature-content-summarization) section of the design document, particularly the Time-to-Consume Calculation subsection.

## Acceptance Criteria
- A system for calculating accurate consumption time estimates is implemented
- Different calculation methods are used based on content type:
  - Text: Based on word count and average reading speed
  - Video: Based on extracted duration metadata
  - Audio: Based on extracted duration metadata
  - Mixed: Combining calculations proportionally
- Platform-specific extractors are implemented for:
  - YouTube videos (using ISO 8601 duration format)
  - Articles (using word count)
  - Other media sources as needed
- Consumption time estimates are stored with content metadata
- Time estimates are displayed in the UI to help users prioritize content
- Estimates account for content type (read/watch/listen/mixed)

## Tasks
- [ ] Follow Test-Driven Development (TDD) principles for all implemented features:
  - [ ] Write tests before implementing the feature code
  - [ ] Ensure all code has appropriate test coverage
  - [ ] Run tests continuously during development
- [ ] Design data models:
  - [ ] Create ContentMetadata interface with type-specific fields
  - [ ] Define ConsumptionTime interface with minutes and type fields
  - [ ] Implement platform-specific metadata interfaces (YouTube, articles, etc.)
- [ ] Implement core calculation functionality:
  - [ ] Create base calculator class with type-based dispatch
  - [ ] Implement article reading time calculator (words ÷ reading speed)
  - [ ] Develop video/audio duration calculator
  - [ ] Build mixed content calculator with proportional combination
- [ ] Create platform-specific extractors:
  - [ ] Implement YouTube duration parser (ISO 8601 format)
  - [ ] Create article word counter with content cleaning
  - [ ] Develop podcast/audio duration extractor
  - [ ] Build email content analyzer
- [ ] Implement extraction pipeline:
  - [ ] Create detection logic for content type
  - [ ] Implement appropriate extractor selection
  - [ ] Build error handling for missing metadata
  - [ ] Add fallback estimates when extraction fails
- [ ] Create database integration:
  - [ ] Extend schema to store consumption time metadata
  - [ ] Implement repository methods for storing/retrieving time estimates
  - [ ] Create migration for existing content
- [ ] Build API endpoints:
  - [ ] Endpoint to calculate time for new content
  - [ ] Endpoint to retrieve existing time estimates
  - [ ] Batch calculation endpoint for multiple content items
- [ ] Implement frontend components:
  - [ ] Time estimate display component
  - [ ] Time filter for content lists
  - [ ] Visual indicators for quick/medium/long content
  - [ ] Time-based sorting option

## Notes
- Standard reading speed is typically 250 words per minute, but this could be made configurable
- YouTube API provides duration in ISO 8601 format (PT1H2M10S) requiring special parsing
- Consider adding user preferences for reading speed
- Mixed content (like articles with embedded videos) requires special handling
- Add confidence levels for estimates when exact metadata is unavailable
- Consider integrating with user behavior data to refine estimates over time
- Time estimates should be calculated at content ingestion time to avoid UI delays 