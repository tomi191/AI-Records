# SUNO-Style Layout Overhaul

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Date:** 2026-04-04
**Status:** Approved
**Reference:** SUNO screenshots in /screenshots/suno-*.png

## Goal

Transform AI-Records layout to match SUNO's proven UX patterns: persistent right panel for track details, 2-column create workspace, inline prompt on home, visual genre discovery, expanded sidebar navigation.

## Changes Overview

1. **TrackDetailPanel** — persistent right panel showing current track details, lyrics, actions
2. **Dashboard layout** — 3-panel system (sidebar + main + right panel)
3. **Home redesign** — inline prompt + trending + genre cards + new releases
4. **Create redesign** — 2-column (creation panel + workspace results)
5. **Explore page** — new page with genre cards, curated playlists, jump back in
6. **Sidebar update** — add Explore, Search links
7. **Library expansion** — more tabs (Песни, Covers, История)
8. **Track cards** — cover art thumbnails + version badges
9. **Middleware** — protect /explore, /search

## Implementation Phases

### Phase A: TrackDetailPanel + Layout (foundation)
- Create TrackDetailPanel component
- Update dashboard layout to 3-panel
- Mobile: slide-up sheet

### Phase B: Home + Explore (content discovery)
- Redesign /home with inline prompt + genre cards + trending
- Create /explore page with genres, curated, jump back in

### Phase C: Create 2-column (workspace)
- Split /create into 2-column layout
- Left: creation panel, Right: workspace results

### Phase D: Sidebar + Library + Track cards
- Update sidebar with Explore, Search
- Expand library tabs
- Track card component with cover art + version badge
